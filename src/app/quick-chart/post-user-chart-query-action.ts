"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { createContext } from "@sql-copilot/lib/create-context";
import { Threads, Messages } from "@sql-copilot/gen/prisma";
import { userChartQueryInput } from "./user-chart-query-input";
import { threadUpsertIo } from "@sql-copilot/lib/entities/threads/thread-upsert-io";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-input";

export interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export async function postUserChartQueryAction(
  input: z.input<typeof userChartQueryInput>
): Promise<{
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
  const validation = validateActionInput(input, userChartQueryInput);
  if (!validation.success) {
    return { success: false, chartConfig: null, thread: null };
  }
  const { url, query } = validation.data;

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

/**
 * Utility function to get sample rows from the input URL.
 * @param url The URL to the input data.
 * @returns The sample rows and columns.
 */
async function getSampleRowsFromInputUrl(url: string) {
  const inputData = streamDataInput(url, 200);
  const sampleRows = [];
  const sampleColumns = [];
  for await (const row of inputData) {
    sampleRows.push(row);
    sampleColumns.push(...Object.keys(row));
  }
  return { sampleRows, sampleColumns };
}
