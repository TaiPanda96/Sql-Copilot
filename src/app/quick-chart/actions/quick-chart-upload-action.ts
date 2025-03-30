"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { createContext } from "@sql-copilot/lib/create-context";
import { Threads, Messages } from "@sql-copilot/gen/prisma";
import { threadUpsertIo } from "@sql-copilot/lib/entities/threads/thread-upsert-io";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-data-input";
import {
  ChartConfig,
  QuickChartInput,
  quickChartInputSchema,
} from "./quick-chart-input";
import { getChartToolIo } from "@sql-copilot/lib/services/get-chart-tool-call-io";
import { aggregateData } from "@sql-copilot/lib/models/tools/aggregations/aggregate-data";
import { normalizeAggregatedData } from "@sql-copilot/lib/models/tools/aggregations/normalize-aggregated-data";

export async function quickChartUploadAction(input: QuickChartInput): Promise<{
  success: boolean;
  chartConfig: ChartConfig | null;
  message?: string;
  thread:
    | (Threads & {
        messages: Messages[];
      })
    | null;
}> {
  const ctx = await createContext(["prisma", "model"]);
  const validation = validateActionInput(input, quickChartInputSchema);
  if (!validation.success) {
    return { success: false, chartConfig: null, thread: null };
  }
  const { attachments, query, chartConfig } = validation.data;

  const csvFile = attachments?.find((file) => file.fileName.includes(".csv"));
  if (!csvFile) {
    return {
      success: false,
      chartConfig: null,
      thread: null,
      message: "Non csv uploads not supported in free tier.",
    };
  }

  // Check if the file size exceeds 5MB
  const exceedsFileSize =
    csvFile.fileSize && csvFile.fileSize > 5 * 1024 * 1024;
  if (exceedsFileSize) {
    return {
      success: false,
      chartConfig: null,
      thread: null,
      message: "File size exceeds 5MB limit.",
    };
  }

  const streamedData = streamDataInput(csvFile.url);
  const inputDataArray: Record<string, unknown>[] = [];
  let sampleIter = 0;
  let sampleLimit = 15;
  for await (const data of streamedData) {
    inputDataArray.push(data);
    if (sampleIter < sampleLimit) sampleIter++;
  }

  try {
    // Get Chart Config
    const chartConfigSchema = await getChartToolIo(ctx, {
      query,
      sampleColumns: Object.keys(inputDataArray[0]),
      sampleRows: inputDataArray.slice(0, 15),
      presetChartConfig: chartConfig,
    });

    if (!chartConfigSchema) {
      return {
        success: false,
        chartConfig: null,
        thread: null,
        message: "Failed to get chart config.",
      };
    }

    const aggregationStepConfig = chartConfigSchema.aggregationSteps;
    if (!aggregationStepConfig) {
      return {
        success: false,
        chartConfig: null,
        thread: null,
        message: "Aggregation steps are undefined.",
      };
    }
    // Aggregate the Data
    const chartData = aggregateData(inputDataArray, aggregationStepConfig);
    if (!chartData) {
      return {
        success: false,
        chartConfig: null,
        thread: null,
        message: "Failed to aggregate data.",
      };
    }

    // Build the Chart Config
    const chartConfigOutput = buildChartConfig({
      chartConfig: chartConfigSchema,
      data: normalizeAggregatedData(
        chartData,
        chartConfigSchema.xKey,
        chartConfigSchema.yKey,
        chartConfigSchema.expressAsPercent === true
      ),
    });

    console.log("chartConfigOutput", chartConfigOutput);

    const threadOutput = await threadUpsertIo(ctx, {
      query,
      threadId: validation.data.threadId,
    });

    if (!threadOutput) {
      return {
        success: false,
        chartConfig: null,
        message: "Failed to create a new thread.",
        thread: null,
      };
    }

    return {
      success: true,
      chartConfig: chartConfigOutput,
      message: "Successfully fetched the chart data.",
      thread: threadOutput.thread,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      chartConfig: null,
      message: errorMessage,
      thread: null,
    };
  }
}

function buildChartConfig({
  chartConfig,
  data,
}: {
  chartConfig: ChartConfig;
  data: Record<string, unknown>[];
}): ChartConfig {
  console.log("sample", data[0]);
  const xKeyMismatch = !data[0].hasOwnProperty(chartConfig.xKey);
  const yKeyMismatch = !data[0].hasOwnProperty(chartConfig.yKey);
  if (xKeyMismatch || yKeyMismatch) {
    // Correct the xKey and yKey if they don't match the data
    chartConfig.xKey = Object.keys(data[0])[0];
    chartConfig.yKey = Object.keys(data[0])[1];
  }
  return {
    ...chartConfig,
    data,
  };
}
