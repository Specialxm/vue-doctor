import {
  CallExpression,
  Node,
  SyntaxKind,
  type Node as MorphNode,
} from 'ts-morph';

const PINIA_STORE_CALL_PATTERN = /^use\w*Store$/;

export const isPiniaStoreCall = (call: CallExpression): boolean => {
  const expression = call.getExpression();

  if (!Node.isIdentifier(expression)) {
    return false;
  }

  return PINIA_STORE_CALL_PATTERN.test(expression.getText());
};

export const isInsideSetupFunction = (call: CallExpression): boolean => {
  let current: MorphNode | undefined = call;

  while (current) {
    if (current.getKind() === SyntaxKind.MethodDeclaration) {
      const method = current.asKindOrThrow(SyntaxKind.MethodDeclaration);
      if (method.getName() === 'setup') {
        return true;
      }
    }

    const parent = current.getParent();

    if (parent && parent.getKind() === SyntaxKind.PropertyAssignment) {
      const property = parent.asKindOrThrow(SyntaxKind.PropertyAssignment);
      const propertyName = property.getName();

      if (propertyName === 'setup') {
        const initializer = property.getInitializer();
        if (
          initializer &&
          (initializer.getKind() === SyntaxKind.ArrowFunction ||
            initializer.getKind() === SyntaxKind.FunctionExpression)
        ) {
          return true;
        }
      }
    }

    current = parent;
  }

  return false;
};
