import multiline from "multiline-ts";
import OpenAI from "openai";
import { ContextWith } from "../create-context";
import {
  assertIsOpenAiClient,
  assertIsChatCompletion,
} from "../utils/assertions";
import { basePrompt } from "../models/llms/base-prompt";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";

const tokenLimit = 4096;

export interface QueryInputOptions {
  query: string;
  // If a user submits a file, we can stream the file data to the model.
  fileStream?: ReadableStream<Uint8Array>;
  messageHistory?: string[];
}

/**
 * Get Query Response from OpenAI.
 * This gets a default context and a query string.
 */
export async function* getQueryResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  { query, fileStream, messageHistory }: QueryInputOptions
): AsyncGenerator<string> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  if (!fileStream) {
    throw new Error("File stream is required for this operation.");
  }
  const dataContext = await new Response(fileStream).text();

  let messageContext: {
    role: "user" | "system";
    content: string;
  }[] = [];
  if (Array.isArray(messageHistory) && messageHistory.length > 0) {
    messageContext = messageHistory.map((message) => ({
      role: "user",
      content: message,
    }));

    console.log("Message Context:", messageContext);
  }
  const streamResponse = await model?.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: basePrompt,
      },
      {
        role: "system",
        content: multiline`The user has submitted the following question: ${query} 
        with the following streamed data context: ${dataContext}. Please return a suitable chartData json array.`,
      },
      ...messageContext,
      {
        role: "user",
        content: query,
      },
    ],
    max_tokens: tokenLimit,
    n: 1,
  });

  if (!streamResponse) {
    throw new Error("Failed to get a response from the model.");
  }

  assertIsChatCompletion(streamResponse);

  if (streamResponse.choices && streamResponse.choices.length > 0) {
    for (const choice of streamResponse.choices) {
      yield getResponseFromCompletion(choice);
    }
  } else {
    throw new Error("Failed to get a response from the model.");
  }
}

export function getResponseFromCompletion(
  completion: OpenAI.Chat.Completions.ChatCompletion.Choice
): string {
  return completion.message.content ?? "";
}
