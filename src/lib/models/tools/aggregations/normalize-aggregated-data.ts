/**
 * Utility function to convert the aggregated data into a normalized format compatible with ChartConfig
 * @param result
 * @param xKey
 * @param yKey
 *
 * If normalizeData is true, the data will be expressed as a percentage for PieChart
 * @param normalizeData
 */
export function normalizeAggregatedData(
  result: unknown,
  xKey: string,
  yKey: string,
  expressAsPercent = false
): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result;
  if (typeof result === "object" && result !== null) {
    if (expressAsPercent) {
      // The data needs to be expressed as a percentage for PieChart
      const total = Object.values(result).reduce((acc, curr) => acc + curr, 0);
      return Object.entries(result).map(([x, y]) => ({
        [xKey]: x,
        [yKey]: (y / total) * 100,
      }));
    }

    return Object.entries(result).map(([x, y]) => ({
      [xKey]: x,
      [yKey]: y,
    }));
  }
  return [];
}
