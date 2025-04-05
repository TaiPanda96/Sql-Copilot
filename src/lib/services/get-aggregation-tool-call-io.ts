import multiline from "multiline-ts";
import { ChartConfig } from "types/chart";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ContextWith } from "../create-context";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";
import {
  aggregationConfigPrompt,
  aggregationSchema,
} from "../models/tools/aggregations/aggregation-schema";
import { assertIsOpenAiClient } from "../utils/assertions";

export const aggregationTool = {
  type: "function" as const,
  function: {
    name: "aggregation",
    description: "Executes an aggregation function on a data set.",
    parameters: zodToJsonSchema(aggregationSchema),
  },
};

/**
 * Get the model response from the LLM model.
 * This gets a default context and a query string.
 */
export async function getAggregationToolCallIo(
  ctx: ContextWith<"prisma" | "model">,
  {
    query,
    sampleColumns,
    sampleRows,
  }: {
    query: string;
    sampleColumns: string[];
    sampleRows: Record<string, unknown>[];
    presetChartConfig?: ChartConfig;
    messageHistory?: string[];
  }
): Promise<z.infer<typeof aggregationSchema>> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  const dataContext = JSON.stringify({
    sampleRows,
    sampleColumns,
  });

  const response = await model.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: aggregationConfigPrompt,
      },
      {
        role: "user",
        content: multiline`I would like you to answer my question ${query} provided the following sample data set columns and rows for your consideration: ${dataContext}. 
        Please help me return the appropriate aggregation configuration to transform this data appropriately.`,
      },
    ],
    tools: [aggregationTool],
    tool_choice: "required",
    max_tokens: 4096,
  });

  const toolCalls = response.choices[0]?.message?.tool_calls;
  if (!toolCalls) {
    throw new Error("No tool call generated.");
  }

  // Execute tool function
  let aggregationConfig: z.infer<typeof aggregationSchema> = {} as z.infer<
    typeof aggregationSchema
  >;
  for (const tool of toolCalls) {
    if (tool.function.name === "aggregation") {
      let parsedFunctionArgs;
      try {
        parsedFunctionArgs = JSON.parse(tool.function.arguments);
      } catch (e) {
        console.log("Error parsing tool response", e);
      }

      const validatedParams = aggregationSchema.safeParse(parsedFunctionArgs);
      // Validate using safe-parse
      if (validatedParams.success) {
        Object.assign(aggregationConfig, validatedParams.data);
      } else {
        console.log(validatedParams.error);
      }
    }
  }
  return aggregationConfig;
}
