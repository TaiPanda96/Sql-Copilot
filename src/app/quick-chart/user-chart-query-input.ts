import { z } from "zod";

export const userChartQueryInput = z.object({
  url: z.string(),
  threadId: z.string().optional(),
  fileName: z.string().optional(),
  userEmail: z.string().optional(),
  query: z.string(),
  xKey: z.string(),
  yKey: z.string(),
  chartType: z.enum(["BarChart", "LineChart", "PieChart"]),
  title: z.string(),
});
