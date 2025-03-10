import multiline from "multiline-ts";
import { ContextWith } from "../create-context";
import { assertIsOpenAiClient } from "../utils/assertions";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";
import { filterPrompt } from "../models/tools/filter-config-prompt";
import { getModelResponseIo } from "../models/get-model-response-io";
import { filterInputSchema } from "../models/tools/filter-config";
import { z } from "zod";

export interface QueryInputOptions {
  query: string;
  sampleRows: Record<string, unknown>[];
  sampleColumns: string[];
}

/**
 * Get Query Response from OpenAI.
 * This gets a default context and a query string.
 */
export async function getFilterPredictionIo(
  ctx: ContextWith<"prisma" | "model">,
  { query, sampleRows, sampleColumns }: QueryInputOptions
): Promise<
  z.infer<typeof filterInputSchema> | z.infer<typeof filterInputSchema>[]
> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  const dataContext = JSON.stringify({
    sampleRows,
    sampleColumns,
  });

  const modelResponse = getModelResponseIo(ctx, {
    query,
    prompt: filterPrompt,
    content: multiline`The user has submitted the following question: ${query}
    with the following streamed data context: ${dataContext}. Please return a suitable filter configuration.`,
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
  const parsedResponse = extractFilterResponse(response);
  let validation:
    | z.infer<typeof filterInputSchema>
    | z.infer<typeof filterInputSchema>[];

  if (Array.isArray(parsedResponse)) {
    const zodResponse = z.array(filterInputSchema).safeParse(parsedResponse);
    if (!zodResponse.success) {
      throw new Error(
        `Failed to validate the response from the model. ${zodResponse.error}`
      );
    }
    validation = zodResponse.data;
  } else {
    const zodResponse = filterInputSchema.safeParse(parsedResponse);
    if (!zodResponse.success) {
      throw new Error("Failed to validate the response from the model.");
    }
    validation = zodResponse.data;
  }

  return validation;
}

function extractFilterResponse(response: string): Record<string, unknown> {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/; // Capture JSON within ```json ... ```
  // Extract all contents within ```json ... ```
  const jsonMatch = response.match(jsonRegex);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from the response.");
  }
  const jsonContent = jsonMatch[1];
  console.log(jsonContent);
  return JSON.parse(jsonContent);
}
