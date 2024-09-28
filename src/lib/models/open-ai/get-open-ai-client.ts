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
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openAiClient;
}
