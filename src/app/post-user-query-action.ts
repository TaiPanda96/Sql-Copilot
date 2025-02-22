"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { createContext } from "@sql-copilot/lib/create-context";
import { processFileInputs } from "@sql-copilot/lib/utils/process-file-inputs";
import { assertType } from "@sql-copilot/lib/utils/assertions";
import { postUserInputSchema } from "./post-user-query-input";
import { getChartConfigResponseIo } from "@sql-copilot/lib/services/get-chart-config-response-io";
import { Threads, Messages } from "@sql-copilot/gen/prisma";

export interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart";
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export async function postUserQueryAction(
  input: z.input<typeof postUserInputSchema>
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
  const validation = validateActionInput(input, postUserInputSchema);
  if (!validation.success) {
    return { success: false, chartConfig: null, thread: null };
  }
  const { url, query } = validation.data;

  try {
    const fileContent = await processFileInputs(url);
    assertType(query, z.string());
    assertType(
      fileContent,
      z.union([
        z.string(),
        z.instanceof(Blob),
        z.instanceof(ArrayBuffer),
        z.array(z.any()),
      ])
    );

    // Assess if there's an existing thread
    // If there is a thread, get all the historical messages in the thread
    // This is to provide context to the model
    let thread:
      | (Threads & {
          messages: Messages[];
        })
      | null = null;
    let messageHistory: string[] = [];
    const hasThread = !!validation.data.threadId;
    if (hasThread) {
      assertType(validation.data.threadId, z.string());
      // Get all the thread's messages
      thread = await ctx.prisma.threads.findUnique({
        where: { id: validation.data.threadId },
        include: { messages: true },
      });

      if (!thread) {
        return { success: false, chartConfig: null, thread: null };
      }

      const newMessage = await ctx.prisma.messages.create({
        data: {
          message: query,
          threadId: thread.id,
        },
      });
      messageHistory = thread.messages
        .map((messageObj) => messageObj.message)
        .concat(newMessage.message);
    } else {
      await ctx.prisma.threads.create({
        data: {
          title: query,
          messages: {
            create: {
              message: query,
            },
          },
        },
      });

      const newThread = await ctx.prisma.threads.findFirst({
        where: { title: query },
        include: { messages: true },
      });

      thread = newThread;
    }

    const response = await getChartConfigResponseIo(ctx, {
      fileContent,
      query,
      messageHistory,
    });

    const isEmptyChart =
      !response.llmResponse.data || response.llmResponse.data.length === 0;
    if (isEmptyChart) {
      return {
        success: false,
        chartConfig: null,
        message: "No data available for visualization.",
        thread,
      };
    }
    return {
      success: true,
      chartConfig: response.llmResponse,
      message: "Successfully fetched the chart data.",
      thread,
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
