import { assertType } from "@sql-copilot/lib/utils/assertions";
import { z } from "zod";
import { AggregationConfig, AggregationType } from "./aggregation-schema";
import { zodDecimal } from "@sql-copilot/lib/utils/zod-decimal";
import Decimal from "decimal.js";
import { filterMapReduceCalcStream } from "../filter-map-reduce-calc";

export type AggregationCalcInput = AsyncGenerator<z.AnyZodObject>;

export type AggregationCalcOutput = Promise<
  | Record<string, Decimal>
  | Decimal
  | null
  | { [key: string]: Decimal }
  | { key: string; value: Decimal }
>;

/**
 * An aggregation calculation function that generates an aggregation from structured data based on AggregationType.
 * This is used in the OpenAI tool for analyzing structured data.
 */
export function aggregationCalc(
  inputGenerator: AsyncGenerator<z.AnyZodObject>,
  aggregationSchema: AggregationConfig
): AggregationCalcOutput {
  const { type, ...aggregation } = aggregationSchema;
  switch (type) {
    case AggregationType.Sum:
      assertType(aggregation.sumField, z.string());
      return filterMapReduceCalcStream(inputGenerator, {
        filterConfig: aggregation.filters ?? [],
        mapFn: (item) => {
          const key = aggregation.sumField as keyof typeof item;
          assertType(item[key], zodDecimal.nullable());
          return item[key] ?? new Decimal(0);
        },
        reduceFn: (acc = new Decimal(0), current) => {
          assertType(acc, zodDecimal);
          assertType(current, zodDecimal.nullable());
          return acc.add(current ?? new Decimal(0));
        },
        initialValue: new Decimal(0),
      });
    case AggregationType.GroupBySelect:
      assertType(aggregation.groupByField, z.string());
      assertType(aggregation.groupBySumField, z.string());
      return filterMapReduceCalcStream(inputGenerator, {
        filterConfig: aggregation.filters ?? [],
        mapFn: (item) => {
          const key = aggregation.groupByField as keyof typeof item;
          const valueToAggregate =
            aggregation.groupBySumField as keyof typeof item;
          assertType(item[key], z.string());
          assertType(item[valueToAggregate], zodDecimal.nullable());
          return {
            key: item[key] as string,
            value: item[valueToAggregate] ?? new Decimal(0),
          };
        },
        reduceFn: (acc, current) => {
          assertType(acc, z.record(zodDecimal));
          assertType(current, z.object({ key: z.string(), value: zodDecimal }));
          const key = current.key;
          const value = current.value;
          const reducerResult = {
            ...acc,
            [key]: (acc[key] ?? new Decimal(0)).add(value),
          };
          return reducerResult;
        },
        selectFn: (acc) => {
          assertType(acc, z.record(zodDecimal));
          const sorted = Object.entries(acc)
            .map(([key, value]) => [key, value])
            .sort((a, b) => {
              assertType(a[1], zodDecimal);
              assertType(b[1], zodDecimal);
              return b[1].cmp(a[1]);
            });
          const from = aggregation.groupBySelect.from;
          const to = aggregation.groupBySelect.to;
          return Object.fromEntries(sorted.slice(from, to));
        },
        initialValue: null,
      });
    case AggregationType.GroupBySum:
      assertType(aggregation.groupByField, z.string());
      assertType(aggregation.groupBySumField, z.string());
      return filterMapReduceCalcStream(inputGenerator, {
        filterConfig: aggregation.filters ?? [],
        mapFn: (item) => {
          const groupByKey = aggregation.groupByField as keyof typeof item;
          const sumKey = aggregation.groupBySumField as keyof typeof item;
          assertType(item[groupByKey], z.string());
          assertType(item[sumKey], zodDecimal.nullable());
          return {
            key: item[groupByKey] as string,
            value: item[sumKey] ?? new Decimal(0),
          };
        },
        reduceFn: (acc, current) => {
          assertType(acc, z.record(zodDecimal));
          assertType(current, z.object({ key: z.string(), value: zodDecimal }));
          const key = current.key;
          const value = current.value;
          return { ...acc, [key]: (acc[key] ?? new Decimal(0)).add(value) };
        },
        initialValue: null,
      });
    default:
      throw new Error("Invalid aggregation type.");
  }
}
