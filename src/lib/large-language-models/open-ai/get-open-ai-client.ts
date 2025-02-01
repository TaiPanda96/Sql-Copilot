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

  // Remove the base prompt for now
  const basePrompt = multiline`
    You are a helpful data scientist who is assisting the user with understanding their data. 
    Your goal is to understand the data passed by the user, either in csv or json format, and return
    a chartData json array that best represents the data. If data file is uploaded, you will parse the data and return the chartData json array in the specified format below.
    When processing any data, always remove nulls, undefined, and empty values. Don't return any data that is not necessary.
    Secondarily, if the data provided by the user is already nicely formatted, you can skip the parsing step and proceed to the chartData json array creation.
    Remember, your goal is to always return a chartData jsonArray compatible to the following format:
    [
      {
        "type": "BarChart",
        "title": "Title of the chart",
        "data": [
          {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3"
          },
          {
            "key1": "value4",
            "key2": "value5",
            "key3": "value6"
          }
        ],
        "xKey": "key1",
        "yKey": "key2"
      }
    ]

    When returning a response, always ensure you respond with the standard output format in one of the following supported chart types
    (BarChart, LineChart, PieChart). Take special note in the ChartType enum and the DynamicChart component.
    That defines the supported chart types and the rendering logic for each chart type. Your job is to identify a suitable chart type
    that best represents the data and return the chartData json array in the format specified above.
    
    The chart data should be in the formats, as shown below in each example corresponding to the chart type:
    "Output is the following: [
      {
        "type": "BarChart",
        "title": "Title of the chart",
        "data": [
          {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3"
          },
          {
            "key1": "value4",
            "key2": "value5",
            "key3": "value6"
          }
        ],
        "xKey": "key1",
        "yKey": "key2"
      }
    ]"

    "Output is the following: [
      {
        "type": "LineChart",
        "title": "Title of the chart",
        "data": [
          {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3"
          },
          {
            "key1": "value4",
            "key2": "value5",
            "key3": "value6"
          }
        ],
        "xKey": "key1",
        "yKey": "key2"
      }
    ]"

        "Output is the following: [
      {
        "type": "PieChart",
        "title": "Title of the chart",
        "data": [
          {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3"
          },
          {
            "key1": "value4",
            "key2": "value5",
            "key3": "value6"
          }
        ],
        "xKey": "key1",
        "yKey": "key2"
      }
    ]"

    For now, if the instructions are unclear, pause and return an empty response, like below:
    "Output is the following: [
      {
        "type": "BarChart",
        "title": "Title of the chart",
        "data": [],
        "xKey": "key1",
        "yKey": "key2"
      }
    ]"

    This will add more predictability to your responses.
  `;
  const fileStreamString = await new Response(fileStream).text();
  const fullQuery = multiline`The user has submitted the following story: ${query} 
  with the following streamed context: ${fileStreamString}`;

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
