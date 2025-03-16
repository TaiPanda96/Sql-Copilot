import {
  ChartConfig,
  chartConfigSchema,
} from "@sql-copilot/app/quick-chart/actions/quick-chart-upload-action";
import { ContextWith } from "../create-context";
import { z } from "zod";
import { basePrompt } from "../models/llms/base-prompt";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";
import { assertIsOpenAiClient } from "../utils/assertions";
import multiline from "multiline-ts";
import zodToJsonSchema from "zod-to-json-schema";

export const chartConfigTool = {
  type: "function" as const,
  function: {
    name: "ChartConfig",
    description:
      "Creates a chart configuration based on user-defined conditions.",
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

  const emptyChartConfig = {
    type: "BarChart",
    title: "Title of the chart",
    data: [],
    xKey: "key1",
    yKey: "key2",
  };

  const response = await model.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: basePrompt,
      },
      {
        role: "user",
        content: multiline`The user has submitted the following question: ${query} 
          with the following dataset context: ${dataContext}. ${
          hasUserSpecifiedChartConfig
            ? `The user has also specified a chart configuration. ${JSON.stringify(
                presetChartConfig
              )}`
            : ""
        }
          Please return a structured filter configuration in the tool call.`,
      },
    ],
    tools: [chartConfigTool],
    tool_choice: "required",
    max_tokens: 4096,
  });

  const toolCalls = response.choices[0]?.message?.tool_calls;
  if (!toolCalls) {
    throw new Error("No tool call generated.");
  }

  // Execute tool function
  let chartConfigResponse: z.infer<typeof chartConfigSchema> =
    emptyChartConfig as ChartConfig;
  for (const tool of toolCalls) {
    if (tool.function.name === "FilterByCalc") {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(tool.function.arguments);
      } catch (e) {
        console.log("Error parsing tool response", e);
      }

      // Validate using safe-parse
      const filterSchemaResponse = chartConfigSchema.safeParse(parsedResponse);
      if (filterSchemaResponse.success) {
        Object.assign(chartConfigResponse, filterSchemaResponse.data);
      }
    }
  }

  return chartConfigResponse;
}
