import { ContextWith } from "@sql-copilot/lib/create-context";
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

/**
 * Get Query Response from OpenAI.
 * This gets a default context and a query string.
 */
export async function* getQueryResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  { query, fileStream }: QueryInputOptions
): AsyncGenerator<string> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  const basePrompt = multiline`
  You are a highly skilled data scientist and AI assistant specializing in data visualization.
  **Your Role:** Given a dataset in CSV or JSON format, analyze its structure and return a valid \`chartData\` JSON array for visualization.

  **Strict Guidelines:**
  - Identify categorical vs. numerical data automatically.
  - Ensure the \`xKey\` is categorical and \`yKey\` is numerical.
  - If data contains missing values, exclude incomplete rows from the output.
  - Do **not** invent data. If an error occurs, return an appropriate message.
  
  **Example Input:**
  \`\`\`json
  [
    {"Country": "USA", "GDP": 21.4},
    {"Country": "China", "GDP": 14.3},
    {"Country": "India", "GDP": 2.9}
  ]
  \`\`\`

  **Expected Output:**
  \`\`\`json
  [
    {
      "type": "BarChart",
      "title": "GDP by Country",
      "data": [
        {"Country": "USA", "GDP": 21.4},
        {"Country": "China", "GDP": 14.3},
        {"Country": "India", "GDP": 2.9}
      ],
      "xKey": "Country",
      "yKey": "GDP"
    }
  ]
  \`\`\`

  **If the data is not suitable for visualization, return:**
  \`\`\`json
  { "error": "Insufficient data for meaningful visualization." }
  \`\`\`
`;
  const fileStreamString = await new Response(fileStream).text();

  // Token limit is 4096 tokens
  const estimatedTokens = query.length / 4; // Rough estimate: 1 token ≈ 4 chars
  const tokenLimit = Math.min(estimatedTokens * 2, 4096); // Cap at 4096 tokens

  const streamResponse = await model?.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: basePrompt,
      },
      {
        role: "system",
        content: multiline`The user has submitted the following story: ${query} 
        with the following streamed context: ${fileStreamString}`,
      },

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
