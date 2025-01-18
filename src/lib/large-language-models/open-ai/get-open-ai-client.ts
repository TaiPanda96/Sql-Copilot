import { ContextWith } from "@sql-copilot/lib/create-context";
import multiline from "multiline-ts";
import OpenAI from "openai";

export type OpenAiClient = OpenAI;

let openAiClient: OpenAiClient | null = null;
let maxTokens = 16384;

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

/**
 * Get Query Response from OpenAI.
 * This gets a default context and a query string.
 */
export async function* getQueryResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  {
    query,
    messageHistory,
  }: {
    query: string;
    messageHistory: string[];
  }
): AsyncGenerator<string> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  // Remove the base prompt for now
  const basePrompt = await getBasePrompt();
  const fullQuery = multiline`The user has submitted the following story: ${query}`;

  const streamResponse = await model?.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: basePrompt,
      },
      {
        role: "system",
        content: fullQuery,
      },
      // Add the message history
      // ...messageHistory.map((message) => ({
      //   role: "user" as const,
      //   content: message,
      // })),
      {
        role: "user",
        content: query,
      },
    ],
    max_tokens: maxTokens,
    n: 1,
  });

  if (!streamResponse) {
    throw new Error("Failed to get a response from the model.");
  }

  if (streamResponse.choices && streamResponse.choices.length > 0) {
    for (const choice of streamResponse.choices) {
      yield getResponseFromCompletion(choice);
    }
  } else {
    throw new Error("Failed to get a response from the model.");
  }
}

function getResponseFromCompletion(
  completion: OpenAI.Chat.Completions.ChatCompletion.Choice
): string {
  return completion.message.content ?? "";
}

/**
 * Asserts that the client is an OpenAI client.
 * As we use Dependency Injection, we can scale this assertion to other LLM clients.
 * For now, we only have OpenAI as an option.
 */
function assertIsOpenAiClient(
  client: OpenAiClient
): asserts client is OpenAiClient {
  if (!client) {
    throw new Error("OpenAI client is not initialized.");
  }
}

/**
 * This function is used to get a base prompt from a blob storage.
 */
async function getBasePrompt() {
  const blobUrl = process.env.NEXT_PUBLIC_BLOB_PROMPT_URL;
  if (!blobUrl) {
    throw new Error("Blob URL is not set.");
  }

  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch the base prompt from blob storage.");
    }

    const prompt = await response.text();
    return prompt;
  } catch (error) {
    console.error("Error fetching or parsing base prompt from blob:", error);
    return "Base prompt could not be loaded.";
  }
}
