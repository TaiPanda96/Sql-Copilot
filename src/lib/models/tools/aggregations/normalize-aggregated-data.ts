/**
 * Utility function to convert the aggregated data into a normalized format compatible with ChartConfig
 * @param result
 * @param xKey
 * @param yKey
 *
 */
export function normalizeAggregatedData(
  result: unknown,
  xKey: string,
  yKey: string
): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result;
  if (typeof result === "object" && result !== null) {
    return Object.entries(result).map(([x, y]) => ({
      [xKey]: x,
      [yKey]: y,
    }));
  }
  return [];
}
