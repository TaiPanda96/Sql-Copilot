import { FilterConfig, resolveFilterConfig } from "./filter-config";

/**
 * Filter, map, and reduce an input stream of items.
 * This is used in the OpenAI tool for analyzing structured data.
 * @param inputStream The input stream to be processed by the tool.
 * @param filterConfig The filter configuration to be applied to the input stream.
 * @param mapFn The map function to be applied to each item in the input stream.
 * @param reduceFn The reduce function to be applied to the mapped items.
 * @param selectFn The select applied to the reduced items.
 * @param initialValue The initial value for the reduce function.
 * @returns The result of the reduce function.
 *
 * @example
 * const result = await filterMapReduceCalcStream(inputData, {
 *   filterConfig: [
 *     { type: "filter", field: "age", operator: ">", value: 18 },
 *     { type
 *   ],
 *   mapFn: (item) => item.salary,
 *   reduceFn: (acc, current) => acc + current,
 *   initialValue: 0,
 * });
 * T generic type for the input stream.
 * U generic type for the result of the reduce function.
 */
export async function filterMapReduceCalcStream<T, U>(
  inputStream: AsyncGenerator<T>,
  {
    filterConfig,
    mapFn,
    reduceFn,
    selectFn,
    initialValue,
  }: {
    filterConfig?: FilterConfig[];
    mapFn?: (item: T) => U;
    reduceFn?: (acc: U, current: U) => U;
    selectFn?: (acc: U) => U;
    initialValue: U;
  }
): Promise<U> {
  if (!filterConfig) {
    return initialValue;
  }
  let acc = initialValue;
  const defaultMapFn = mapFn ?? ((item: T) => item as unknown as U);
  const defaultReduceFn = reduceFn ?? ((acc: U, current: U) => current);
  for (const config of filterConfig) {
    const filterFn = resolveFilterConfig(config);
    if (!filterFn) {
      throw new Error("Invalid filter configuration.");
    }

    for await (const item of inputStream) {
      if (filterFn(item as Record<string, unknown>)) {
        const mappedItem = defaultMapFn(item);
        acc = defaultReduceFn(acc, mappedItem);
      }
    }
  }

  if (selectFn) {
    return selectFn(acc);
  }

  return acc;
}
