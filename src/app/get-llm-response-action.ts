"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { ContextWith, createContext } from "@sql-copilot/lib/create-context";
import { getQueryResponseIo } from "@sql-copilot/lib/large-language-models/open-ai/get-open-ai-client";

export async function getResponseAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{ success: boolean; llmResponse: string }> {
  const ctx = await createContext(["prisma", "model"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, llmResponse: "" };
  }
  const { url, story } = validation.data;

  try {
    // Fetch and parse the file content
    const fileContent = await fetchAndParseFile(url);

    // Fetch the response from the LLM
    const response = await fetchLLMResponse(ctx, fileContent, story);

    if (typeof response !== "string") {
      throw new Error("LLM response is not a string.");
    }
    assertIsValidReactComponent(response);

    return {
      success: true,
      llmResponse: response,
    };
  } catch (error) {
    console.error("Error processing files:", error);
    return {
      success: false,
      llmResponse: "",
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
): Promise<string> {
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

  return response;
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
export function assertIsValidReactComponent(componentCode: string): void {
  if (!componentCode || typeof componentCode !== "string") {
    throw new Error("Component code must be a non-empty string.");
  }

  // Basic checks to ensure the code references React and expected libraries
  if (!componentCode.includes("React")) {
    throw new Error("Component code must include a reference to 'React'.");
  }

  if (
    !componentCode.includes("Recharts") &&
    !componentCode.includes("LucidReact")
  ) {
    throw new Error(
      "Component code must include references to either 'Recharts' or 'LucidReact'."
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

  // Optional: Perform a lightweight syntax check using Function constructor
  try {
    new Function(`return (${componentCode});`);
  } catch (error) {
    throw new Error("Component code contains invalid JavaScript syntax.");
  }
}
