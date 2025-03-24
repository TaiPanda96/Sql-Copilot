import { isString } from "lodash";
import { aggregationFilter, groupBy } from "./aggregation-filter";
import { AggregationConfig, AggregationType } from "./aggregation-schema";
import { z } from "zod";

export function aggregateData<T>(
  data: T[],
  config: AggregationConfig
): unknown {
  const filteredData = aggregationFilter(data, config.filters);
  console.log("releaseYear sample:", filteredData.slice(0, 20));
  switch (config.type) {
    case AggregationType.NoAggregation:
      return filteredData;

    case AggregationType.HistogramBin: {
      const binField = config.binField;
      const binSize = config.binSize ?? 10;
      if (!binField) {
        throw new Error("binField is required for HistogramBin aggregation.");
      }

      // Compute min/max if not defined
      const values = filteredData
        .map((item) => Number(item[binField as keyof T]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) return [];

      const minValue = config.binStart ?? Math.min(...values);
      // Compute bins
      const bins: Record<string, number> = {};
      for (const val of values) {
        if (isNaN(val)) continue;
        const binFloor =
          Math.floor((val - minValue) / binSize) * binSize + minValue;
        const binCeil = binFloor + binSize;
        const binLabel = `${binFloor} - ${binCeil}`;
        bins[binLabel] = (bins[binLabel] || 0) + 1;
      }

      // Return sorted bin labels
      return Object.entries(bins)
        .sort(([a], [b]) => {
          const aStart = parseFloat(a.split(" - ")[0]);
          const bStart = parseFloat(b.split(" - ")[0]);
          return aStart - bStart;
        })
        .map(([range, count]) => ({
          range,
          count,
        }));
    }

    case AggregationType.Count:
      return filteredData.length;

    case AggregationType.Sum:
      return filteredData.reduce((sum, item) => {
        if (!config.sumField) return sum;
        return sum + Number(item[config.sumField as keyof typeof item]);
      }, 0);

    case AggregationType.Average:
      const avgField = config.avgField!;
      const total = filteredData.reduce((sum, item) => {
        const value = Number(item[avgField as keyof typeof item]);
        if (isNaN(value)) return sum;
        return sum + value;
      }, 0);
      return filteredData.length ? total / filteredData.length : 0;

    case AggregationType.Min:
      return Math.min(
        ...filteredData.map((item) => {
          if (!config.minField) return 0;
          return Number(item[config.minField as keyof typeof item]);
        })
      );

    case AggregationType.Max:
      return Math.max(
        ...filteredData.map((item) => {
          if (!config.maxField) return 0;
          return Number(item[config.maxField as keyof typeof item]);
        })
      );

    case AggregationType.GroupBy:
      if (!config.groupByField) return {};
      return groupBy(filteredData, config.groupByField);

    case AggregationType.GroupByCount: {
      if (!config.groupByField) return {};
      const groups = groupBy(filteredData, config.groupByField);
      return Object.fromEntries(
        Object.entries(groups).map(([key, group]) => [key, group.length])
      );
    }

    case AggregationType.GroupBySum: {
      if (!config.groupByField) return;
      const groups = groupBy(filteredData, config.groupByField);
      return Object.fromEntries(
        Object.entries(groups).map(([key, group]) => [
          key,
          group.reduce((sum, item) => {
            if (!config.groupBySumField) return sum;
            return (
              sum + Number(item[config.groupBySumField as keyof typeof item])
            );
          }, 0),
        ])
      );
    }

    case AggregationType.GroupByMax: {
      if (!config.groupByField) return;
      const groups = groupBy(filteredData, config.groupByField);
      return Object.fromEntries(
        Object.entries(groups).map(([key, group]) => [
          key,
          Math.max(
            ...group.map((item) => {
              if (!config.groupByMaxField) return 0;
              if (!isString(item[config.groupByMaxField as keyof typeof item]))
                return 0;
              const groupByMaxField = z.coerce
                .number()
                .parse(item[config.groupByMaxField as keyof typeof item]);
              return groupByMaxField;
            })
          ),
        ])
      );
    }

    case AggregationType.GroupBySelect: {
      const groups = groupBy(filteredData, config.groupByField!);
      const entries = Object.entries(groups);
      const sliced = entries.slice(
        config.groupBySelect!.from - 1,
        config.groupBySelect!.to
      );
      return Object.fromEntries(sliced);
    }

    default:
      throw new Error(`Unsupported aggregation type: ${config.type}`);
  }
}
