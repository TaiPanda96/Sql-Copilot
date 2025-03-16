"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { createContext } from "@sql-copilot/lib/create-context";
import { Threads, Messages } from "@sql-copilot/gen/prisma";
import { threadUpsertIo } from "@sql-copilot/lib/entities/threads/thread-upsert-io";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-input";
import { QuickChartInput, quickChartInputSchema } from "./quick-chart-input";
import { camelCase } from "lodash";
import { resolveFilterConfig } from "@sql-copilot/lib/models/tools/filter-config";
import { getFilterToolIo } from "@sql-copilot/lib/services/get-filter-tool-io";
import { getChartToolIo } from "@sql-copilot/lib/services/get-chart-tool-io";

export interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export const chartConfigSchema = z.object({
  type: z.enum(["BarChart", "LineChart", "PieChart"]),
  title: z.string(),
  data: z.array(z.record(z.unknown())),
  xKey: z.string(),
  yKey: z.string(),
});

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

  // TO DO: Add the "Action Abstraction"
  const streamedData = streamDataInput(csvFile.url);
  const sampledData: Record<string, unknown>[] = [];
  let sampleIter = 0;
  let sampleCount = 30;
  for await (const data of streamedData) {
    if (sampleIter <= sampleCount) {
      sampledData.push(
        Object.fromEntries(
          Object.entries(data).map(([key, value]) => [camelCase(key), value])
        )
      );
      sampleIter++;
    }
    break;
  }

  const filterConfig = await getFilterToolIo(ctx, {
    query,
    sampleColumns: Object.keys(sampledData[0]),
    sampleRows: sampledData,
  });

  const filteredOutput: Record<string, unknown>[] = [];
  if (Array.isArray(filterConfig)) {
    for (const filter of filterConfig) {
      const filterFn = resolveFilterConfig(filter);
      for await (const row of sampledData) {
        if (filterFn && filterFn(row)) {
          filteredOutput.push(row);
        }
      }
    }
  } else {
    const filterFn = resolveFilterConfig(filterConfig);
    for await (const row of sampledData) {
      if (filterFn && filterFn(row)) {
        filteredOutput.push(row);
      }
    }
  }

  // Build the chart config that will be used to render the chart
  if (filteredOutput.length === 0) {
    return {
      success: false,
      chartConfig: null,
      message: "No data available for visualization.",
      thread: null,
    };
  }

  let chartConfigOutput: ChartConfig;
  if (filteredOutput.length > 0 && chartConfig) {
    chartConfigOutput = buildChartConfig({ chartConfig, filteredOutput });
  } else {
    // Invoke the chart generation tool
    chartConfigOutput = await getChartToolIo(ctx, {
      query,
      sampleColumns: Object.keys(sampledData[0]),
      sampleRows: sampledData,
      // If the user has
      presetChartConfig: chartConfig,
    });
  }

  try {
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

    const isEmptyChart = true;

    if (isEmptyChart) {
      return {
        success: false,
        chartConfig: null,
        message: "No data available for visualization.",
        thread: threadOutput.thread,
      };
    }
    return {
      success: true,
      chartConfig: null,
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
  filteredOutput,
}: {
  chartConfig: ChartConfig;
  filteredOutput: Record<string, unknown>[];
}): ChartConfig {
  const { type, title, xKey, yKey } = chartConfig;
  return {
    type,
    title,
    data: filteredOutput,
    xKey,
    yKey,
  };
}
