import { aggregationSchema } from "./aggregations/aggregation-schema";
import { z } from "zod";
import { aggregationCalcController } from "./aggregations/aggregation-controller";
import { filterInputSchema } from "./filter-config";
import { filterByController } from "./filter-by-controller";
import { ChatCompletionTool } from "openai/resources";

export enum ToolRegistryType {
  AggregationCalc = "AggregationCalc",
  FilterByCalc = "FilterByCalc",
}

export const TOOL_REGISTRY: Record<
  ToolRegistryType,
  {
    params: z.ZodObject<any, any, any>;
    executable: Function;
    functionName: string;
    description: string;
  }
> = {
  [ToolRegistryType.FilterByCalc]: {
    params: z.object({
      inputUrl: z.string().describe("The URL of the input data"),
      filterConfig: filterInputSchema.describe(
        "The filter configuration to apply to the data"
      ),
    }),
    functionName: "filterByController",
    description: "Filters structured data based on a filter configuration.",
    executable: filterByController,
  },
  [ToolRegistryType.AggregationCalc]: {
    params: z.object({
      inputUrl: z.string().describe("The URL of the input data"),
      aggregationSchema: aggregationSchema.describe(
        "The aggregation schema the data should be grouped by"
      ),
    }),
    functionName: "aggregationCalcController",
    description: "Filters structured data based on a filter configuration.",
    executable: aggregationCalcController,
  },
};

/**
 * Defines the OpenAI tool for generating chart configurations.
 * export const aggregationTool = {
  type: "function" as const,
  function: {
    name: "aggregationController",
    description:
      "Generates an aggregation from structured data based on AggregationType.",
    parameters: {
      type: "object",
      properties: {
        inputData: {
          type: "json",
          description: "The structured data to be aggregated.",
        },
        aggregation: aggregationSchema,
      },
      required: ["inputData", "aggregation"],
    },
  },
};
 */

function mapRegistryToOpenAiTools({
  functionName,
  config,
}: {
  functionName: string;
  config: z.ZodObject<any, any, any>;
}): ChatCompletionTool {
  return {
    type: "function" as const,
    function: {
      name: functionName,
      description:
        "Generates an aggregation from structured data based on AggregationType.",
      parameters: {
        type: "object",
        properties: {
          inputUrl: {
            type: "string",
            description: "The url of the input data",
          },
          config,
        },
        required: ["inputUrl", "config"],
      },
    },
  };
}

/**
 * Defines the OpenAI tools available for use.
 * It takes the tool registry and maps it to a list of tools.
 */
export const openAITools = Object.entries(TOOL_REGISTRY).map(
  ([key, { params, functionName }]) => {
    return mapRegistryToOpenAiTools({ functionName, config: params });
  }
);
