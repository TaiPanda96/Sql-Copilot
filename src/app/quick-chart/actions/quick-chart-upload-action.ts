"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { createContext } from "@sql-copilot/lib/create-context";
import { Threads, Messages } from "@sql-copilot/gen/prisma";
import { threadUpsertIo } from "@sql-copilot/lib/entities/threads/thread-upsert-io";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-input";
import { QuickChartInput, quickChartInputSchema } from "./quick-chart-input";
import { getChartToolIo } from "@sql-copilot/lib/services/get-chart-tool-call-io";
import { z } from "zod";
import { aggregationSchema } from "@sql-copilot/lib/models/tools/aggregations/aggregation-schema";
import { aggregateData } from "@sql-copilot/lib/models/tools/aggregations/aggregate-data";
import { normalizeAggregatedData } from "@sql-copilot/lib/models/tools/aggregations/normalize-aggregated-data";

export interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart" | "Histogram";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  aggregationSteps?: z.infer<typeof aggregationSchema>;
}

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

  const streamedData = streamDataInput(csvFile.url);
  const inputDataArray: Record<string, unknown>[] = [];
  for await (const data of streamedData) {
    inputDataArray.push(data);
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
    console.log("aggregationStepConfig", aggregationStepConfig);

    // Aggregate the Data
    const chartData = aggregationStepConfig
      ? aggregateData(inputDataArray, aggregationStepConfig)
      : inputDataArray;

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
        chartConfigSchema.yKey
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
  const xKeyMismatch = !data[0].hasOwnProperty(chartConfig.xKey);
  const yKeyMismatch = !data[0].hasOwnProperty(chartConfig.yKey);
  if (xKeyMismatch || yKeyMismatch) {
    // Correct the xKey and yKey if they don't match the data
    chartConfig.xKey = Object.keys(data[0])[0];
    chartConfig.yKey = Object.keys(data[0])[1];
  }
  const { type, title, xKey, yKey } = chartConfig;
  return {
    type,
    title,
    data,
    xKey,
    yKey,
  };
}
