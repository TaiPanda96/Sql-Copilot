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
  toolTip: z
    .string()
    .optional()
    .describe("The tooltip to be displayed on the chart."),
  legend: z.object({
    show: z
      .boolean()
      .optional()
      .describe("Whether to show the legend on the chart."),
    position: z
      .enum(["top", "bottom", "left", "right"])
      .optional()
      .describe("The position of the legend on the chart."),
  }),
  expressAsPercent: z
    .boolean()
    .optional()
    .describe(
      "Whether to express the data as a percentage for PieChart or Histogram."
    )
    .default(false),
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
        fileSize: z.number().optional(),
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
export type ChartConfig = z.infer<typeof chartConfigSchema>;
