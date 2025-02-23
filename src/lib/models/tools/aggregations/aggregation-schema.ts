import { z } from "zod";

export enum AggregationType {
  Sum = "Sum",
  Average = "Average",
  Count = "Count",
  Min = "Min",
  Max = "Max",
  GroupBy = "GroupBy",
  GroupByCount = "GroupByCount",
  GroupBySum = "GroupBySum",
  GroupBySelect = "GroupBySelect",
}

export const aggregationSchema = z.object({
  type: z.enum([
    AggregationType.Sum,
    AggregationType.Average,
    AggregationType.Count,
    AggregationType.Min,
    AggregationType.Max,
    AggregationType.GroupBy,
    AggregationType.GroupByCount,
    AggregationType.GroupBySum,
    AggregationType.GroupBySelect,
  ]),
  sumField: z.string().optional(),
  avgField: z.string().optional(),
  countField: z.string().optional(),
  minField: z.string().optional(),
  maxField: z.string().optional(),
  groupByField: z.string().optional(),
  groupByCountField: z.string().optional(),
  groupBySumField: z.string().optional(),
});

export type Aggregation = z.infer<typeof aggregationSchema>;

/**
 * Defines the OpenAI tool for generating chart configurations.
 */
export const aggregationTool = {
  type: "function" as const,
  function: {
    name: "aggregationCalc",
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
