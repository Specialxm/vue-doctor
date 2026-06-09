import {
  ElementTypes,
  NodeTypes,
  type ElementNode,
  type TemplateChildNode,
} from '@vue/compiler-dom';

export const hasVForDirective = (node: ElementNode): boolean =>
  node.props.some(
    (prop) => prop.type === NodeTypes.DIRECTIVE && prop.name === 'for',
  );

export const hasKeyProp = (node: ElementNode): boolean =>
  node.props.some((prop) => {
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === 'key') {
      return true;
    }

    if (
      prop.type === NodeTypes.DIRECTIVE &&
      prop.name === 'bind' &&
      prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
      prop.arg.content === 'key'
    ) {
      return true;
    }

    return false;
  });

export const isTemplateElement = (node: ElementNode): boolean =>
  node.tag === 'template' && node.tagType === ElementTypes.TEMPLATE;

export const directChildHasKey = (node: ElementNode): boolean => {
  for (const child of node.children) {
    if (child.type === NodeTypes.ELEMENT && hasKeyProp(child)) {
      return true;
    }
  }

  return false;
};

export const isMissingVForKeyViolation = (node: ElementNode): boolean => {
  if (!hasVForDirective(node)) {
    return false;
  }

  if (hasKeyProp(node)) {
    return false;
  }

  if (isTemplateElement(node) && directChildHasKey(node)) {
    return false;
  }

  return true;
};

export const walkTemplateChildren = (
  nodes: TemplateChildNode[],
  onElement: (node: ElementNode) => void,
): void => {
  for (const node of nodes) {
    switch (node.type) {
      case NodeTypes.ELEMENT:
        onElement(node);
        walkTemplateChildren(node.children, onElement);
        break;
      case NodeTypes.IF:
        for (const branch of node.branches) {
          walkTemplateChildren(branch.children, onElement);
        }
        break;
      case NodeTypes.FOR:
        walkTemplateChildren(node.children, onElement);
        break;
      default:
        break;
    }
  }
};
