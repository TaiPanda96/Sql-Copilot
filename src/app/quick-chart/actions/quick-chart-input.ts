import { z } from "zod";

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
  chartConfig: z
    .object({
      type: z.enum(["BarChart", "LineChart", "PieChart"]),
      title: z.string(),
      data: z.array(z.record(z.unknown())),
      xKey: z.string(),
      yKey: z.string(),
    })
    .optional(),
});

export type QuickChartInput = z.infer<typeof quickChartInputSchema>;
