import { aggregationSchema } from "@sql-copilot/lib/models/tools/aggregations/aggregation-schema";
import { z } from "zod";

export const chartConfigSchema = z.object({
  type: z
    .enum(["BarChart", "LineChart", "PieChart", "Histogram"])
    .describe(
      'The type of chart to be built. It can be one of the following: "BarChart", "LineChart", "PieChart", "Histogram".'
    ),
  title: z.string().describe("The title of the chart."),
  data: z
    .array(z.record(z.unknown()))
    .describe(
      "The data to be used for the chart. It represents the data you need to work with to build the chart."
    ),
  xKey: z.string().describe("The key to be used for the x-axis."),
  yKey: z.string().describe("The key to be used for the y-axis."),
  aggregationSteps: aggregationSchema
    .optional()
    .describe(
      "Aggregation steps to be applied to the data such that the chart can be built. If not provided, the data will be displayed as is."
    ),
});

export const quickChartInputSchema = z.object({
  attachments: z
    .array(
      z.object({
        url: z.string(),
        fileName: z.string(),
      })
    )
    .optional(),
  threadId: z.string().optional(),
  fileName: z.string().optional(),
  userEmail: z.string().optional(),
  query: z.string(),
  chartConfig: chartConfigSchema.optional(),
});

export type QuickChartInput = z.infer<typeof quickChartInputSchema>;
