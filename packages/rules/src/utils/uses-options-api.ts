import { Node, Project } from 'ts-morph';

export const usesOptionsApi = (scriptContent: string): boolean => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('component.ts', scriptContent, {
    overwrite: true,
  });

  for (const statement of sourceFile.getStatements()) {
    if (!Node.isExportAssignment(statement) || statement.isExportEquals()) {
      continue;
    }

    if (Node.isObjectLiteralExpression(statement.getExpression())) {
      return true;
    }
  }

  return false;
};
