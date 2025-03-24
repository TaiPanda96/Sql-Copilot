import { assertType } from "@sql-copilot/lib/utils/assertions";
import { zodDecimal } from "@sql-copilot/lib/utils/zod-decimal";
import { isBefore, isAfter, isSameDay, parse, isValid } from "date-fns";
import { isNil } from "lodash";
import { z } from "zod";
import { ComparisonType, FieldType } from "../filter-config";
import { AggregationConfig } from "./aggregation-schema";
import Decimal from "decimal.js";

const supportedDateFormats = [
  "yyyy-MM-dd",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  "yyyy/MM/dd",
  "yyyy/MM/dd HH:mm:ss",
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "MM,dd,yyyy",
  "MM dd, yyyy",
  "MM dd yyyy",
  "MM-dd-yyyy HH:mm:ss",
];

export const zodDateParser = z.preprocess((input) => {
  if (!input || typeof input !== "string") return input;

  for (const format of supportedDateFormats) {
    const parsed = parse(input, format, new Date());
    if (isValid(parsed)) return parsed;
  }

  // Try built-in parser as a last resort
  const fallback = new Date(input);
  return isValid(fallback) ? fallback : undefined;
}, z.date());

// Filter utility
export function aggregationFilter<T>(
  data: T[],
  filters: AggregationConfig["filters"]
): T[] {
  if (!filters || filters.length === 0) return data;

  return data.filter((item) => {
    return filters.every((filter) => {
      if (!filter.inputField) return true;
      const value = item[filter.inputField as keyof typeof item];
      if (isNil(value)) return true;
      switch (filter.comparison) {
        case ComparisonType.EQUALS:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return dateToCheck.getTime() === dateToFilter.getTime();
          }

          if (filter.fieldType === FieldType.DECIMAL) {
            const decimalToFilter = zodDecimal.parse(filter.value);
            const decimalToCheck = zodDecimal.parse(value);
            return decimalToCheck.eq(decimalToFilter);
          }
          return value === filter.value;
        case ComparisonType.NOT_EQUALS:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return dateToCheck.getTime() !== dateToFilter.getTime();
          }

          if (filter.fieldType === FieldType.DECIMAL) {
            const decimalToFilter = zodDecimal.parse(filter.value);
            const decimalToCheck = zodDecimal.parse(value);
            return !decimalToCheck.eq(decimalToFilter);
          }

          return value !== filter.value;
        case ComparisonType.CONTAINS:
          return value < filter.value;
        case ComparisonType.IN:
          if (!Array.isArray(filter.value)) return false;

          if (filter.fieldType === FieldType.DATETIME) {
            const dateToCheck = zodDateParser.parse(value);
            return filter.value.some((date) => {
              const dateToFilter = zodDateParser.parse(date);
              return dateToCheck.getTime() === dateToFilter.getTime();
            });
          }

          if (filter.fieldType === FieldType.DECIMAL) {
            const decimalToCheck = zodDecimal.parse(value);
            const decimalToFilter = filter.value
              .map((d) => zodDecimal.parse(d))
              .find((d) => d.eq(decimalToCheck));
            return !!decimalToFilter;
          }
          assertType(filter.value, z.array(z.string()));
          assertType(value, z.string().optional());
          return filter.value.includes(value ?? "");
        case ComparisonType.NOT_IN:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToCheck = zodDateParser.parse(value);
            return !filter.value.some((date: unknown) => {
              const dateToFilter = zodDateParser.parse(date);
              return dateToCheck.getTime() === dateToFilter.getTime();
            });
          }

          if (filter.fieldType === FieldType.DECIMAL) {
            const decimalToCheck = zodDecimal.parse(value);
            const decimalToFilter = filter.value
              .map((d: unknown) => zodDecimal.parse(d))
              .find((d: { eq: (arg0: Decimal) => any }) =>
                d.eq(decimalToCheck)
              );
            return !decimalToFilter;
          }

          assertType(filter.value, z.array(z.string()));
          assertType(value, z.string().optional());
          return !filter.value.includes(value ?? "");
        case ComparisonType.GREATER_THAN:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return isBefore(dateToFilter, dateToCheck);
          }

          if (filter.fieldType === FieldType.DECIMAL) {
            const decimalToFilter = zodDecimal.parse(filter.value);
            const decimalToCheck = zodDecimal.parse(value);
            return decimalToCheck.gt(decimalToFilter);
          }
          assertType(filter.value, z.coerce.number());
          assertType(value, z.coerce.number().optional());
          if (!value) return false;
          return value > filter.value;
        case ComparisonType.GREATER_THAN_OR_EQUAL:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return (
              isAfter(dateToCheck, dateToFilter) ||
              isSameDay(dateToCheck, dateToFilter)
            );
          }
          assertType(filter.value, z.number());
          assertType(value, z.number().optional());
          if (!value) return false;
          return value >= filter.value;
        case ComparisonType.LESS_THAN:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return isBefore(dateToCheck, dateToFilter);
          }
          assertType(filter.value, z.number());
          assertType(value, z.number().optional());
          if (!value) return false;
          return value < filter.value;
        case ComparisonType.LESS_THAN_OR_EQUAL:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value);
            const dateToCheck = zodDateParser.parse(value);
            return (
              isBefore(dateToCheck, dateToFilter) ||
              isSameDay(dateToCheck, dateToFilter)
            );
          }
          assertType(filter.value, z.number());
          assertType(value, z.number().optional());
          if (!value) return false;
          return value <= filter.value;
        case ComparisonType.BETWEEN:
          if (filter.fieldType === FieldType.DATETIME) {
            const dateToFilter = zodDateParser.parse(filter.value[0]);
            const dateToCheck = zodDateParser.parse(value);
            const dateToFilterEnd = zodDateParser.parse(filter.value[1]);
            return (
              isAfter(dateToCheck, dateToFilter) &&
              isBefore(dateToCheck, dateToFilterEnd)
            );
          }
          assertType(filter.value, z.array(z.number()));
          assertType(value, z.number().optional());
          if (!value) return false;
          return value >= filter.value[0] && value <= filter.value[1];
        case ComparisonType.IS_BEFORE:
          const dateToFilter = zodDateParser.parse(filter.value);
          const dateToCheck = zodDateParser.parse(value);
          return isBefore(dateToCheck, dateToFilter);
        case ComparisonType.IS_AFTER:
          const dateToFilterAfter = zodDateParser.parse(filter.value);
          const dateToCheckAfter = zodDateParser.parse(value);
          return isBefore(dateToFilterAfter, dateToCheckAfter);
        default:
          return true;
      }
    });
  });
}

// GroupBy utility
export function groupBy<T>(array: T[], key: string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    if (!item[key as keyof typeof item]) return acc;
    const groupByValue = item[key as keyof typeof item];
    if (!groupByValue) return acc;
    // If the key contains "," then split it and group by each value
    const cleanedKey = groupByValue.toString().trim();
    if (cleanedKey.includes(",") && cleanedKey.split(",").length > 1) {
      const keys = cleanedKey.split(",");
      keys.forEach((k) => {
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
      });
      return acc;
    }
    if (!acc[cleanedKey]) acc[cleanedKey] = [];
    acc[cleanedKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
