"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { ContextWith, createContext } from "@sql-copilot/lib/create-context";
import { getQueryResponseIo } from "@sql-copilot/lib/large-language-models/open-ai/get-open-ai-client";
import multiline from "multiline-ts";

export async function getResponseAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{
  success: boolean;
  llmResponse: string;
  isReactComponent: boolean;
}> {
  const ctx = await createContext(["prisma", "model"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, llmResponse: "", isReactComponent: false };
  }
  const { url, story } = validation.data;

  try {
    // Fetch and parse the file content
    const fileContent = await fetchAndParseFile(url);

    // Fetch the response from the LLM
    const response = await fetchLLMResponse(ctx, fileContent, story);
    console.log("Response from LLM:", response);
    return {
      success: true,
      ...response,
    };
  } catch (error) {
    console.error("Error processing files:", error);
    return {
      success: false,
      llmResponse: "",
      isReactComponent: false,
    };
  }
}

/**
 * Fetches and parses the file content from a URL.
 * It makes a fetch request to the URL and parses the content based on the file type.
 * Then, it asserts the file content type to be either JSON or CSV.
 */
async function fetchAndParseFile(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      return await response.json(); // Parse JSON files
    } else if (contentType?.includes("text/csv")) {
      const text = await response.text();
      return parseCSV(text); // Parse CSV files
    } else {
      throw new Error(
        "Unsupported file type. Only JSON and CSV are supported."
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error parsing file from URL: ${error.message}`);
    } else {
      throw new Error("Error parsing file from URL: unknown error");
    }
  }
}

/**
 * Parses a CSV string into a structured array of objects.
 */
function parseCSV(csv: string): Array<Record<string, string>> {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {} as Record<string, string>);
  });
}

/**
 * Fetches the response from the LLM.
 */
async function fetchLLMResponse(
  ctx: ContextWith<"prisma" | "model">,
  fileContent: any,
  query: string
): Promise<{
  llmResponse: string;
  isReactComponent: boolean;
}> {
  const readableStream = createReadableStream(fileContent);

  const llmResponse = getQueryResponseIo(ctx, {
    fileStream: readableStream,
    query,
  });

  // Convert LLM stream to string
  let response = "";
  for await (const chunk of llmResponse) {
    response += chunk;
  }

  // IF the response is empty, throw an error
  if (!response) {
    throw new Error("Failed to get a response from the model.");
  }

  const componentCode = extractJsxCodeFromResponse(response);
  // Check if the response has "```" which indicates a code block in markdown
  if (componentCode) {
    await assertIsValidReactComponent(componentCode);
    return {
      llmResponse: componentCode,
      isReactComponent: true,
    };
  }

  return {
    llmResponse: response,
    isReactComponent: false,
  };
}

/**
 * Creates a ReadableStream from file content.
 */
function createReadableStream(data: any): ReadableStream {
  const jsonString = JSON.stringify(data);

  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const view = encoder.encode(jsonString);
      controller.enqueue(view);
      controller.close();
    },
  });
}

/**
 * Assert that the LLM response is a string.
 */
/**
 * Validates that the provided component code contains a valid React component definition
 * and necessary imports for rendering within an iframe.
 *
 * @param {string} componentCode - The React component code as a string.
 * @throws {Error} Throws an error if the code does not meet validation criteria.
 */
export async function assertIsValidReactComponent(
  componentCode: string
): Promise<void> {
  console.log(
    "Validating React component code...",
    multiline`${componentCode}`
  );
  if (!componentCode || typeof componentCode !== "string") {
    throw new Error("Component code must be a non-empty string.");
  }

  // Basic checks to ensure the code references React and expected libraries
  if (!componentCode.includes("React")) {
    throw new Error("Component code must include a reference to 'React'.");
  }

  // Check for import statements for `recharts`
  if (!componentCode.includes("recharts")) {
    throw new Error(
      "Component code must include import statements for 'recharts'."
    );
  }

  // Check if the code defines a React component
  if (
    !/function\s+\w+\s*\(.*\)\s*{/.test(componentCode) &&
    !/const\s+\w+\s*=\s*\(.*\)\s*=>/.test(componentCode)
  ) {
    throw new Error(
      "Component code must define a valid React component using 'function' or 'const'."
    );
  }

  // Ensure the component renders JSX
  if (!componentCode.includes("return") || !componentCode.includes("<")) {
    throw new Error("Component code must include a JSX 'return' statement.");
  }
}

function extractJsxCodeFromResponse(response: string): string | null {
  // Regular expression to match `jsx` or `javascript` code blocks
  const jsxBlockRegex = /```jsx\s*([\s\S]*?)\s*```/g;
  const jsBlockRegex = /```javascript\s*([\s\S]*?)\s*```/g;

  // Match all code blocks
  const matches = response.match(jsxBlockRegex) || response.match(jsBlockRegex);

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
