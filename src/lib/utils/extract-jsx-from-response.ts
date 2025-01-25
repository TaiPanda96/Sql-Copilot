/**
 * This function checks for ```jsx``` code in the response and extracts it.
 * When extracting, you want to extract everything between the first pair of JSX tags.
 *
 */
export function extractJsxFromResponse(response: string): string | null {
  // Regular expression to match `jsx` code blocks
  const jsxBlockRegex = /```jsx\s*([\s\S]*?)\s*```/g;

  // Match all code blocks
  const matches = response.match(jsxBlockRegex);

  if (!matches) {
    return null;
  }

  // Extract the first code block
  const firstMatch = matches[0];

  // Extract the code block
  const codeBlock = firstMatch.replace(/```jsx/g, "").replace("```", "");

  console.log("Extracted JSX code block:", codeBlock);
  return codeBlock;
}
