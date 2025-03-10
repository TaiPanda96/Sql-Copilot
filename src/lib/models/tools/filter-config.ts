import { zodDecimal } from "../../utils/zod-decimal";
import { z } from "zod";

export enum FieldType {
  STRING = "string",
  DECIMAL = "decimal",
  DATETIME = "datetime",
}

export enum ComparisonType {
  EQUALS = "==",
  NOT_EQUALS = "!=",
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_THAN_OR_EQUAL = ">=",
  LESS_THAN_OR_EQUAL = "<=",
  CONTAINS = "contains",
  IN = "in",
  NOT_IN = "not in",
  BETWEEN = "between",
  IS_BEFORE = "is before",
  IS_AFTER = "is after",
}

export const filterInputSchema = z.object({
  fieldType: z.enum([FieldType.STRING, FieldType.DECIMAL, FieldType.DATETIME]),
  comparison: z.enum([
    ComparisonType.EQUALS,
    ComparisonType.NOT_EQUALS,
    ComparisonType.GREATER_THAN,
    ComparisonType.LESS_THAN,
    ComparisonType.GREATER_THAN_OR_EQUAL,
    ComparisonType.LESS_THAN_OR_EQUAL,
    ComparisonType.CONTAINS,
    ComparisonType.IN,
    ComparisonType.NOT_IN,
    ComparisonType.BETWEEN,
    ComparisonType.IS_BEFORE,
    ComparisonType.IS_AFTER,
  ]),
  value: z.any(),
  inputField: z.string(),
});

export type FilterConfig = z.infer<typeof filterInputSchema>;

export function resolveFilterConfig(filterConfig: FilterConfig) {
  switch (filterConfig.fieldType) {
    case FieldType.STRING:
      return resolveStringFilter(filterConfig);
    case FieldType.DECIMAL:
      return resolveDecimalFilter(filterConfig);
  }
}

function resolveStringFilter(filterConfig: FilterConfig) {
  switch (filterConfig.comparison) {
    case ComparisonType.EQUALS:
      return (input: Record<string, unknown>) => {
        const stringInput = z
          .string()
          .parse(input[filterConfig.inputField as keyof typeof input]);
        return stringInput === filterConfig.value;
      };
    case ComparisonType.NOT_EQUALS:
      return (input: Record<string, unknown>) => {
        const stringInput = z
          .string()
          .parse(input[filterConfig.inputField as keyof typeof input]);
        return stringInput !== filterConfig.value;
      };
    case ComparisonType.CONTAINS:
      return (input: Record<string, unknown>) => {
        const stringInput = z
          .string()
          .parse(input[filterConfig.inputField as keyof typeof input]);
        return stringInput.includes(filterConfig.value as string);
      };
    case ComparisonType.IN:
      return (input: Record<string, unknown>) => {
        const stringInput = z
          .string()
          .parse(input[filterConfig.inputField as keyof typeof input]);
        return (
          Array.isArray(filterConfig.value) &&
          filterConfig.value.includes(stringInput)
        );
      };
    case ComparisonType.NOT_IN:
      return (input: Record<string, unknown>) => {
        const stringInput = z
          .string()
          .parse(input[filterConfig.inputField as keyof typeof input]);
        return (
          Array.isArray(filterConfig.value) &&
          !filterConfig.value.includes(stringInput)
        );
      };
    default:
      throw new Error("Invalid comparison type.");
  }
}

/**
 * Resolve a decimal filter based on the comparison type.
 */
function resolveDecimalFilter(filterConfig: FilterConfig) {
  // First, validate and coerce the configured value
  const decimalValue = zodDecimal.parse(filterConfig.value as unknown);

  switch (filterConfig.comparison) {
    case ComparisonType.GREATER_THAN:
      return (input: Record<string, unknown>) => {
        // Validate the input at runtime before using it
        const decimalInput = zodDecimal.parse(
          input[filterConfig.inputField as keyof typeof input]
        );
        return decimalInput.gt(decimalValue);
      };
    case ComparisonType.LESS_THAN:
      return (input: Record<string, unknown>) => {
        const decimalInput = zodDecimal.parse(
          input[filterConfig.inputField as keyof typeof input]
        );
        return decimalInput.lt(decimalValue);
      };
    case ComparisonType.GREATER_THAN_OR_EQUAL:
      return (input: Record<string, unknown>) => {
        const decimalInput = zodDecimal.parse(
          input[filterConfig.inputField as keyof typeof input]
        );
        return decimalInput.gte(decimalValue);
      };
    case ComparisonType.LESS_THAN_OR_EQUAL:
      return (input: Record<string, unknown>) => {
        const decimalInput = zodDecimal.parse(
          input[filterConfig.inputField as keyof typeof input]
        );
        return decimalInput.lte(decimalValue);
      };
    case ComparisonType.EQUALS:
      return (input: Record<string, unknown>) => {
        const decimalInput = zodDecimal.parse(
          input[filterConfig.inputField as keyof typeof input]
        );
        return decimalInput.eq(decimalValue);
      };
    default:
      throw new Error("Invalid comparison type.");
  }
}
