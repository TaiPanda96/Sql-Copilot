import { ChartConfig } from "@sql-copilot/app/post-user-query-action";
import { ContextWith } from "../create-context";
import { getQueryResponseIo } from "./get-query-response-io";
import { createReadableStream } from "../utils/create-readable-stream";
import { extractJsonResponse } from "../utils/extract-json-response";

/**
 * Get the model response from the LLM model.
 * This gets a default context and a query string.
 */
export async function getChartConfigResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  {
    fileContent,
    query,
    messageHistory = [],
  }: {
    fileContent: string | Blob | ArrayBuffer | Array<unknown>;
    query: string;
    messageHistory?: string[];
  }
): Promise<{
  llmResponse: {
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
  };
}> {
  const emptyChartConfig = {
    type: "BarChart",
    title: "Title of the chart",
    data: [],
    xKey: "key1",
    yKey: "key2",
  } as ChartConfig;

  const readableStream = createReadableStream(fileContent);
  const modelResponse = getQueryResponseIo(ctx, {
    fileStream: readableStream,
    query,
    messageHistory,
  });

  // Convert LLM stream to string
  let response = "";
  for await (const chunk of modelResponse) {
    response += chunk;
  }

  // If the response is empty, throw an error
  if (!response) {
    throw new Error("Failed to get a response from the model.");
  }

  // Parse and validate the response
  const parsedResponse = extractJsonResponse(response);
  if (!parsedResponse || !parsedResponse[0]) {
    return { llmResponse: emptyChartConfig };
  }
  return { llmResponse: parsedResponse[0] };
}
