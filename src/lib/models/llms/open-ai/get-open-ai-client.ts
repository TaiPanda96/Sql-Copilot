import { ContextWith } from "@sql-copilot/lib/create-context";
import { basePrompt } from "@sql-copilot/lib/models/llms/base-prompt";
import multiline from "multiline-ts";
import OpenAI from "openai";

export type OpenAiClient = OpenAI;

let openAiClient: OpenAiClient | null = null;
/**
 * Get OpenAI Client as a Singleton.
 * @returns OpenAI Client
 *
 * OpenAI takes the `ClientOptions` interface, for more details import the types
 */
export function getOpenAiClient(): OpenAiClient {
  if (openAiClient) return openAiClient;

  openAiClient = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
  });

  if (openAiClient === null) {
    throw new Error("OpenAI client is not initialized.");
  }

  return openAiClient;
}

export interface QueryInputOptions {
  query: string;
  // If a user submits a file, we can stream the file data to the model.
  fileStream?: ReadableStream<Uint8Array>;
  messageHistory?: string[];
}
