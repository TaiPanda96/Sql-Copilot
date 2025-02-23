import { assertType } from "@sql-copilot/lib/utils/assertions";
import { z } from "zod";
import { Aggregation, AggregationType } from "./aggregation-schema";

/**
 * Tool function that OpenAI will invoke to generate aggregation.
 */
export function aggregationCalc(
  inputData: z.AnyZodObject[],
  aggregationSchema: Aggregation
) {
  const { type, ...aggregation } = aggregationSchema;
  switch (type) {
    case AggregationType.Sum:
      assertType(aggregation.sumField, z.string());
      return inputData.reduce(
        (acc, curr) => acc + curr[aggregation.sumField as keyof typeof curr],
        0
      );
    case AggregationType.Average:
      assertType(aggregation.avgField, z.string());
      return (
        inputData.reduce(
          (acc, curr) => acc + curr[aggregation.avgField as keyof typeof curr],
          0
        ) / inputData.length
      );
    case AggregationType.Count:
      return inputData.length;
    case AggregationType.Min:
      assertType(aggregation.minField, z.string());
      return Math.min(
        ...inputData.map(
          (item) => item[aggregation.minField as keyof typeof item]
        )
      );
    case AggregationType.Max:
      assertType(aggregation.maxField, z.string());
      return Math.max(
        ...inputData.map(
          (item) => item[aggregation.maxField as keyof typeof item]
        )
      );
    case AggregationType.GroupBy:
      assertType(aggregation.groupByField, z.string());
      return inputData.reduce((acc, curr) => {
        const key = curr[aggregation.groupByField as keyof typeof curr];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      }, {} as Record<string, typeof inputData>);
    case AggregationType.GroupBySum:
      assertType(aggregation.groupByField, z.string());
      assertType(aggregation.groupBySumField, z.string());
      return inputData.reduce((acc, curr) => {
        const key = curr[aggregation.groupByField as keyof typeof curr];
        const value = curr[aggregation.groupBySumField as keyof typeof curr];
        assertType(value, z.number());
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += value;
        return acc;
      }, {} as Record<string, number>);
    default:
      throw new Error("Invalid aggregation type.");
  }
}
