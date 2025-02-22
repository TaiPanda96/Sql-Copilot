import multiline from "multiline-ts";
import { ContextWith } from "../../create-context";
import { basePrompt } from "../llms/base-prompt";
import { parseCSV } from "../../utils/parse-csv";
import { ChartConfig, chartConfigSchema } from "./chart-config-schema";
import {
  assertIsChatCompletion,
  assertIsOpenAiClient,
} from "../../utils/assertions";
import { OpenAiClient } from "../llms/open-ai/get-open-ai-client";

const tokenLimit = 4096;

/**
 * Defines the OpenAI tool for generating chart configurations.
 */
const chartDataTool = {
  type: "function" as const,
  function: {
    name: "getChartData",
    description: "Generates a chart configuration from structured data.",
    parameters: {
      type: "object",
      properties: {
        fileContent: {
          type: "string",
          description: "The content of the file to be parsed.",
        },
      },
      required: ["fileContent"],
    },
  },
};

/**
 * Tool function that OpenAI will invoke to generate chart configurations.
 */
async function getChartData({
  fileContent,
}: {
  fileContent: string;
}): Promise<ChartConfig> {
  const parsedData = await parseCSV(fileContent); // Parse CSV into structured JSON
  if (!parsedData || parsedData.length === 0) {
    throw new Error("No valid data found in the file.");
  }

  // Dynamically infer X and Y keys
  const keys = Object.keys(parsedData[0]);
  if (keys.length < 2) {
    throw new Error("Insufficient columns for chart visualization.");
  }

  return {
    type: "BarChart",
    title: "Generated Chart",
    data: parsedData,
    xKey: keys[0], // First column as x-axis
    yKey: keys[1], // Second column as y-axis
  };
}

/**
 * Fetches OpenAI's response using native tool calling.
 */
export async function getChartResponseIo(
  ctx: ContextWith<"prisma" | "model">,
  fileStream: ReadableStream<Uint8Array>,
  query: string
): Promise<{
  success: boolean;
  chartConfig: ChartConfig | null;
  message?: string;
}> {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  if (!fileStream) {
    throw new Error("File stream is required for this operation.");
  }

  // Convert file stream to text
  const fileContent = await new Response(fileStream).text();
  if (!fileContent) {
    throw new Error("File stream is empty.");
  }

  try {
    // Call OpenAI with tool calling
    const chatCompletionResponse = await model.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: basePrompt,
        },
        {
          role: "user",
          content: multiline`The user has submitted the following question: ${query} 
          with the following streamed data context: ${fileContent}. Please return a suitable chartData JSON array.`,
        },
      ],
      tools: [chartDataTool],
      tool_choice: "required", // Always call the function
      max_tokens: tokenLimit,
      n: 1,
    });

    if (!chatCompletionResponse) {
      throw new Error("Failed to get a response from the model.");
    }

    assertIsChatCompletion(chatCompletionResponse);

    let response = "";
    if (chatCompletionResponse.choices.length > 0) {
      for (const choice of chatCompletionResponse.choices) {
        if (choice.message.tool_calls) {
          // OpenAI decided to call a function
          for (const toolCall of choice.message.tool_calls) {
            if (toolCall.function.name === "getChartData") {
              // Extract parameters and call the function
              const params = JSON.parse(toolCall.function.arguments);
              const chartConfig = await getChartData(params);
              return {
                success: true,
                chartConfig,
                message: "Successfully generated chart configuration.",
              };
            }
          }
        }
        response += choice.message.content ?? "";
      }
    } else {
      throw new Error("Failed to get a response from the model.");
    }

    // Validate and parse the response as a ChartConfig
    const parsedResponse = chartConfigSchema.safeParse(JSON.parse(response));
    if (!parsedResponse.success) {
      throw new Error("Invalid chart response format.");
    }

    return {
      success: true,
      chartConfig: parsedResponse.data,
      message: "Successfully generated chart configuration.",
    };
  } catch (error) {
    return {
      success: false,
      chartConfig: null,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
