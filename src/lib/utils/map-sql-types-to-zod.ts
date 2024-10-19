import { z } from "zod";

/**
 * Maps SQL data types to Zod types.
 */
export function mapSqlTypeToZod(sqlType: string): z.ZodType<any> {
  switch (sqlType.toLowerCase()) {
    case "int":
    case "integer":
      return z.number();
    case "varchar":
    case "text":
    case "string":
      return z.string();
    case "boolean":
      return z.boolean();
    case "json":
      return z.object({});
    // Add other type mappings as needed
    default:
      return z.any(); // Default to z.any if type is unknown
  }
}
