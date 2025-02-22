"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { ContextWith, createContext } from "@sql-copilot/lib/create-context";
import { getQueryResponseIo } from "@sql-copilot/lib/services/get-query-response-io";
import { processFileInputs } from "@sql-copilot/lib/services/process-file-inputs";
import { createReadableStream } from "@sql-copilot/lib/utils/create-readable-stream";
import { extractJsonResponse } from "@sql-copilot/lib/utils/extract-json-response";
import { assertType } from "@sql-copilot/lib/utils/assertions";

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
  message?: string;
}> {
  const ctx = await createContext(["prisma", "model"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, chartConfig: null };
  }
  const { url, story } = validation.data;

  try {
    const fileContent = await processFileInputs(url);
    assertType(story, z.string());
    assertType(
      fileContent,
      z.union([
        z.string(),
        z.instanceof(Blob),
        z.instanceof(ArrayBuffer),
        z.array(z.any()),
      ])
    );

    const response = await getResponseIo(ctx, fileContent, story);

    const isEmptyChart =
      !response.llmResponse.data || response.llmResponse.data.length === 0;
    if (isEmptyChart) {
      return {
        success: false,
        chartConfig: null,
        message: "No data available for visualization.",
      };
    }
    return {
      success: true,
      chartConfig: response.llmResponse,
      message: "Successfully fetched the chart data.",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      chartConfig: null,
      message: errorMessage,
    };
  }
}

async function getResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  fileContent:
    | string
    | Blob
    | ArrayBuffer
    | Array<{ key: string; value: string }>,
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
