"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { ContextWith, createContext } from "@sql-copilot/lib/create-context";
import { getQueryResponseIo } from "@sql-copilot/lib/large-language-models/open-ai/get-open-ai-client";
import { json } from "stream/consumers";

export interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export async function getResponseAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{
  success: boolean;
  chartConfig: ChartConfig | null;
}> {
  const ctx = await createContext(["prisma", "model"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, chartConfig: null };
  }
  const { url, story } = validation.data;

  try {
    // Fetch and parse the file content
    const fileContent = await fetchAndParseFile(url);

    // Fetch the response from the LLM
    const response = await fetchLLMResponse(ctx, fileContent, story);
    return {
      success: true,
      chartConfig: response.llmResponse,
    };
  } catch (error) {
    console.error("Error processing files:", error);
    return {
      success: false,
      chartConfig: null,
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

async function fetchLLMResponse(
  ctx: ContextWith<"prisma" | "model">,
  fileContent: any,
  query: string
): Promise<{
  llmResponse: {
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
  };
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

  // If the response is empty, throw an error
  if (!response) {
    throw new Error("Failed to get a response from the model.");
  }

  console.log("LLM Response:", "Raw response from the model:", response);
  // Parse and validate the response
  const parsedResponse = extractJsonStringifiedDataFromResponse(response);

  return { llmResponse: parsedResponse[0] };
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
 * Extracts and validates the JSON stringified data from the LLM response.
 * It detects JSON-like structures, deserializes them, and validates that they match the expected chart data format.
 *
 * The expected response format is:
 * [
 *   {
 *     "type": "BarChart",
 *     "title": "Title of the chart",
 *     "data": [
 *       {
 *         "key1": "value1",
 *         "key2": "value2"
 *       },
 *       {
 *         "key1": "value3",
 *         "key2": "value4"
 *       }
 *     ],
 *     "xKey": "key1",
 *     "yKey": "key2"
 *   }
 * ]
 *
 * @param llmResponse - The response from the LLM as a string
 * @returns The parsed and validated chart data as a JavaScript object
 * @throws An error if the response doesn't contain valid JSON data or if the structure is invalid
 */
function extractJsonStringifiedDataFromResponse(
  llmResponse: string
): ChartConfig[] {
  const findOutputKeyWord = "Output is the following:";
  // Extract the portion of the response after the keyword
  let outputStartIndex = llmResponse.indexOf(findOutputKeyWord);
  if (outputStartIndex === -1) {
    outputStartIndex = `Output is the following: ${llmResponse}`.indexOf(
      findOutputKeyWord
    );
    if (outputStartIndex === -1) {
      throw new Error(
        `Failed to find the output keyword "${findOutputKeyWord}" in the response.`
      );
    }
  }

  let jsonString = llmResponse
    .slice(outputStartIndex + findOutputKeyWord.length)
    .trim();

  // Remove markdown code block markers (```json and ```)
  jsonString = jsonString.replace(/```json|```/g, "").trim();

  let chartConfig: {
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
  }[];

  try {
    chartConfig = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse JSON stringified data: ${error}`);
  }

  return chartConfig;
}
