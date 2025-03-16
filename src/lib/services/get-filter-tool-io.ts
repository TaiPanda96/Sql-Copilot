import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ContextWith } from "../create-context";
import {
  QueryInputOptions,
  OpenAiClient,
} from "../models/llms/open-ai/get-open-ai-client";
import { filterInputSchema } from "../models/tools/filter-config";
import { assertIsOpenAiClient } from "../utils/assertions";
import { filterPrompt } from "../models/tools/filter-config-prompt";

export const filterTool = {
  type: "function" as const,
  function: {
    name: "FilterByCalc",
    description: "Filters data based on user-defined conditions.",
    parameters: zodToJsonSchema(filterInputSchema), // Use Zod to enforce schema
  },
};

export interface FilterInputOptions extends QueryInputOptions {
  sampleRows: Record<string, unknown>[];
  sampleColumns: string[];
}

export async function getFilterToolIo(
  ctx: ContextWith<"prisma" | "model">,
  { query, sampleRows, sampleColumns }: FilterInputOptions
): Promise<z.infer<typeof filterInputSchema>[]> {
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
        content: filterPrompt,
      },
      {
        role: "user",
        content: `The user has submitted the following question: ${query} 
        with the following dataset context: ${dataContext}. 
        Please return a structured filter configuration.`,
      },
    ],
    tools: [filterTool],
    tool_choice: "required",
    max_tokens: 4096,
  });

  const toolCalls = response.choices[0]?.message?.tool_calls;
  if (!toolCalls) {
    throw new Error("No tool call generated.");
  }

  // Execute tool function
  let filterInputConfigs: z.infer<typeof filterInputSchema>[] = [];
  for (const tool of toolCalls) {
    if (tool.function.name === "FilterByCalc") {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(tool.function.arguments);
      } catch (e) {
        console.log("Error parsing tool response", e);
      }

      // Validate using safeparse
      const filterSchemaResponse = filterInputSchema.safeParse(parsedResponse);
      if (filterSchemaResponse.success) {
        filterInputConfigs.push(filterSchemaResponse.data);
      }
    }
  }

  return filterInputConfigs;
}
