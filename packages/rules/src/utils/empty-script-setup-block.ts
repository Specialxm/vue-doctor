const SCRIPT_SETUP_OPEN_PATTERN = /<script\s+setup\b[^>]*>/i;

const stripScriptComments = (content: string): string => {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .trim();
};

export const extractScriptSetupBlockContent = (source: string): string | null => {
  const openMatch = SCRIPT_SETUP_OPEN_PATTERN.exec(source);
  if (!openMatch || openMatch.index === undefined) {
    return null;
  }

  const contentStart = openMatch.index + openMatch[0].length;
  const closeIndex = source.indexOf('</script>', contentStart);
  if (closeIndex === -1) {
    return null;
  }

  return source.slice(contentStart, closeIndex);
};

export const getScriptSetupBlockLine = (source: string): number => {
  const openMatch = SCRIPT_SETUP_OPEN_PATTERN.exec(source);
  if (!openMatch || openMatch.index === undefined) {
    return 1;
  }

  return source.slice(0, openMatch.index).split('\n').length;
};

export const isEmptyScriptSetupContent = (content: string): boolean => {
  return stripScriptComments(content).length === 0;
};

export const hasEmptyScriptSetupBlock = (
  source: string,
  scriptSetupContent: string | null | undefined,
): boolean => {
  if (scriptSetupContent !== null && scriptSetupContent !== undefined) {
    return isEmptyScriptSetupContent(scriptSetupContent);
  }

  const blockContent = extractScriptSetupBlockContent(source);
  if (blockContent === null) {
    return false;
  }

  return isEmptyScriptSetupContent(blockContent);
};
