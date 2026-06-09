import { CallExpression, Node } from 'ts-morph';

const API_ROOT_IDENTIFIERS = new Set([
  'fetch',
  'axios',
  '$fetch',
  'useFetch',
  'useAsyncData',
]);

export const isApiCallExpression = (call: CallExpression): boolean => {
  const expression = call.getExpression();

  if (Node.isIdentifier(expression)) {
    return API_ROOT_IDENTIFIERS.has(expression.getText());
  }

  if (Node.isPropertyAccessExpression(expression)) {
    const rootExpression = expression.getExpression();
    if (Node.isIdentifier(rootExpression)) {
      return API_ROOT_IDENTIFIERS.has(rootExpression.getText());
    }
  }

  return false;
};
