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
