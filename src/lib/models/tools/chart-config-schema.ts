import { z } from "zod";
/**
 * Schema for the expected chart configuration returned by OpenAI.
 */
export const chartConfigSchema = z.object({
  type: z.enum(["BarChart", "LineChart", "PieChart"]),
  title: z.string(),
  data: z.array(z.record(z.string(), z.any())),
  xKey: z.string(),
  yKey: z.string(),
});

export type ChartConfig = z.infer<typeof chartConfigSchema>;
