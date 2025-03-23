import { ContextWith } from "../create-context";
import { z } from "zod";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";
import { assertIsOpenAiClient } from "../utils/assertions";
import multiline from "multiline-ts";
import zodToJsonSchema from "zod-to-json-schema";
import {
  ChartConfig,
  chartConfigSchema,
} from "@sql-copilot/app/quick-chart/actions/quick-chart-input";
import { basePrompt } from "../models/llms/base-prompt";

export const chartConfigTool = {
  type: "function" as const,
  function: {
    name: "ChartConfig",
    description: "Creates a chart configuration provided a user question.",
    parameters: zodToJsonSchema(chartConfigSchema),
  },
};

/**
 * Get the model response from the LLM model.
 * This gets a default context and a query string.
 */
export async function getChartToolIo(
  ctx: ContextWith<"prisma" | "model">,
  {
    query,
    sampleColumns,
    sampleRows,
    presetChartConfig,
    messageHistory = [],
  }: {
    query: string;
    sampleColumns: string[];
    sampleRows: Record<string, unknown>[];
    presetChartConfig?: ChartConfig;
    messageHistory?: string[];
  }
): Promise<ChartConfig> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  const dataContext = JSON.stringify({
    sampleRows,
    sampleColumns,
  });

  const hasUserSpecifiedChartConfig = presetChartConfig !== undefined;
  const toolCallResponse = await model.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: basePrompt,
      },
      {
        role: "user",
        content: multiline`This is my question: ${query} 
          with the following dataset context: ${dataContext}.${
          hasUserSpecifiedChartConfig
            ? `I have also specified a chart configuration. ${JSON.stringify(
                presetChartConfig
              )}`
            : ""
        } Please return a chart configuration JSON object with the fields:
          - type, title, xKey, yKey
          - (optional) aggregation: a full aggregation config that describes how to prepare the data from the sampleRows, using filters, groupBy, and sum/avg/count/min/max as needed.
          Ensure the aggregation config transforms the sampleRows into a structure that matches the xKey/yKey expectations for the selected chart type.`,
      },
    ],
    tools: [chartConfigTool],
    tool_choice: "required",
    max_tokens: 4096,
  });

  const toolCalls = toolCallResponse.choices[0]?.message?.tool_calls;
  if (!toolCalls) {
    throw new Error("No tool call generated.");
  }

  // Execute tool function
  let chartConfigResponse: z.infer<typeof chartConfigSchema> =
    {} as ChartConfig;
  for (const tool of toolCalls) {
    if (tool.function.name === "ChartConfig") {
      let toolCallResponse;
      try {
        toolCallResponse = JSON.parse(tool.function.arguments);
      } catch (e) {
        console.log("Error parsing tool response", e);
      }
      // Validate using safe-parse
      const chartResponseSchema = chartConfigSchema
        .omit({
          data: true,
        })
        .safeParse(toolCallResponse);
      if (chartResponseSchema.success) {
        Object.assign(chartConfigResponse, chartResponseSchema.data);
      } else {
        console.log(
          "Error parsing chart config response",
          chartResponseSchema.error
        );
      }
    }
  }

  return chartConfigResponse;
}
