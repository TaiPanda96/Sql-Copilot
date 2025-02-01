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
  // Remove the base prompt for now
  const basePrompt = multiline`
    You are a helpful data scientist who is assisting the user with understanding their data. 
    Your goal is to understand the data passed by the user, either in csv or json format, and return
    a chartData json array that best represents the data.
    You will make a function call to the getChartData function with the data passed by the user.
    You will only answer the user's questions and provide the necessary information to help them understand the data.
    If data file is uploaded, you will parse the data and return the chartData json array.

    Your goal is to always return a chartData jsonArray compatible to the following format:
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

    The reason is, your response will be rendered in a dynamically generated chart component.
    Here's the actual component code that you will be generating the response for:

    import React from "react";
    import {
      BarChart,
      Bar,
      LineChart,
      Line,
      PieChart,
      Pie,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      Legend,
      ResponsiveContainer,
    } from "recharts";
    
    interface ChartData {
      type: "BarChart" | "LineChart" | "PieChart";
      title: string;
      data: Array<{ [key: string]: any }>;
      xKey: string;
      yKey: string;
    }
    
    interface DynamicChartProps {
      chartData: ChartData;
    }
    
    export const DynamicChart: React.FC<DynamicChartProps> = ({ chartData }) => {
      if (!chartData) {
        return <p>No data available for visualization.</p>;
      }
    
      const { type, title, data, xKey, yKey } = chartData;
    
      return (
        <div className="w-full space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <>
                  {type === "BarChart" && (
                    <BarChart
                      data={data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={yKey} fill="#82ca9d" />
                    </BarChart>
                  )}
                  {type === "LineChart" && (
                    <LineChart
                      data={data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xKey} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
                    </LineChart>
                  )}
                  {type === "PieChart" && (
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey={yKey}
                        nameKey={xKey}
                        fill="#82ca9d"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  )}
                </>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    };

    When returning a response, always ensure you respond with the standard output format:
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
  ]"`;
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
