import OpenAI from "openai";
import { OpenAiClient } from "../models/llms/open-ai/get-open-ai-client";
import { z } from "zod";

/**
 * Asserts that the client is an OpenAI client.
 * As we use Dependency Injection, we can scale this assertion to other LLM clients.
 * For now, we only have OpenAI as an option.
 */
export function assertIsOpenAiClient(
  client: OpenAiClient
): asserts client is OpenAiClient {
  if (!client) {
    throw new Error("OpenAI client is not initialized.");
  }
}

/**
 * Utility function to assert that the response is a valid
 * OpenAi Chat Completion.
 */
export function assertIsChatCompletion(
  response: OpenAI.Chat.Completions.ChatCompletion | undefined
): asserts response is OpenAI.Chat.Completions.ChatCompletion {
  if (!response) {
    throw new Error("Invalid Chat Completion response.");
  }
}

/**
 * Utility function to assert the type of a value using Zod.
 * If the value doesn't match the expected type, it throws an error.
 * @param value - The value to assert the type of
 * @param type - The Zod type to assert against
 * @throws An error if the value doesn't match the expected type
 * example:
 * ```ts
 * assertType(value, z.string());
 * ```
 */
export function assertType<T>(
  value: unknown,
  type: z.ZodType<T>
): asserts value is T {
  type.parse(value);
}
