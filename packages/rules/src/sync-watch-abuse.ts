import { Project, SyntaxKind, Node } from 'ts-morph';
import type { Issue, Rule, ScanContext, TsFileInfo, VueFileInfo } from '@vue-doctor/core';

const isWatchCall = (callText: string): boolean => {
  return callText === 'watch' || callText.endsWith('.watch');
};

const getWatchSourceName = (sourceNode: Node): string | null => {
  if (Node.isIdentifier(sourceNode)) {
    return sourceNode.getText();
  }

  if (Node.isPropertyAccessExpression(sourceNode)) {
    return sourceNode.getText();
  }

  return null;
};

const callbackMutatesWatchedSource = (
  callbackNode: Node,
  watchedSourceName: string,
): boolean => {
  if (!Node.isArrowFunction(callbackNode) && !Node.isFunctionExpression(callbackNode)) {
    return false;
  }

  const body = callbackNode.getBody();
  const assignmentTargets = body.getDescendantsOfKind(SyntaxKind.BinaryExpression).filter(
    (expression) => {
      const operator = expression.getOperatorToken().getKind();

      return (
        operator === SyntaxKind.EqualsToken ||
        operator === SyntaxKind.PlusEqualsToken ||
        operator === SyntaxKind.MinusEqualsToken
      );
    },
  );

  return assignmentTargets.some((expression) => {
    const leftSide = expression.getLeft().getText();
    return (
      leftSide === watchedSourceName ||
      leftSide === `${watchedSourceName}.value` ||
      leftSide.endsWith(`.${watchedSourceName}`) ||
      leftSide.endsWith(`.${watchedSourceName}.value`)
    );
  });
};

const scanScriptForWatchAbuse = (
  file: VueFileInfo | TsFileInfo,
  scriptContent: string,
  issues: Issue[],
): void => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    `${file.relativePath}.ts`,
    scriptContent,
    { overwrite: true },
  );

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const callText = callExpression.getExpression().getText();
    if (!isWatchCall(callText)) {
      continue;
    }

    const args = callExpression.getArguments();
    if (args.length < 2) {
      continue;
    }

    const watchedSourceName = getWatchSourceName(args[0]);
    if (!watchedSourceName) {
      continue;
    }

    if (!callbackMutatesWatchedSource(args[1], watchedSourceName)) {
      continue;
    }

    issues.push({
      ruleId: 'sync-watch-abuse',
      severity: 'warn',
      file: file.relativePath,
      line: callExpression.getStartLineNumber(),
      message: 'watch callback mutates the watched source',
      suggestion: 'Use computed, a derived ref, or event handlers instead of self-modifying watch',
      category: 'performance',
    });
  }
};

export const syncWatchAbuse: Rule = {
  id: 'sync-watch-abuse',
  description: 'Avoid watch callbacks that mutate the value being watched',
  severity: 'warn',
  category: 'performance',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const vueFile of context.vueFiles) {
      if (!vueFile.scriptContent) {
        continue;
      }

      scanScriptForWatchAbuse(vueFile, vueFile.scriptContent, issues);
    }

    for (const tsFile of context.tsFiles) {
      scanScriptForWatchAbuse(tsFile, tsFile.source, issues);
    }

    return issues;
  },
};
