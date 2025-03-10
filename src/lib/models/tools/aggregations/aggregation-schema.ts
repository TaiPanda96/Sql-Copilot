import { filterInputSchema } from "@sql-copilot/lib/models/tools/filter-config";
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
  groupBySelect: z.object({
    from: z.number(),
    to: z.number(),
  }),
  filters: z.array(filterInputSchema).optional(),
});

export type AggregationConfig = z.infer<typeof aggregationSchema>;
