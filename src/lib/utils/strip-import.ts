/**
 * Strips import statements from the given component code.
 * @param {string} componentCode - The React component code as a string.
 * @returns {string} - The component code with imports removed.
 */
export function stripImports(componentCode: string): string {
  return componentCode.replace(/^import\s+.*?;$/gm, "").trim();
}
