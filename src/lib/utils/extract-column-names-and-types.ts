import { mapSqlTypeToZod } from "@sql-copilot/lib/utils/map-sql-types-to-zod";
import { UserSqlDataValidationInput } from "@sql-copilot/lib/validate-user-query-io.ts";
import { AST } from "node-sql-parser";

/**
 * Extracts column names and types from a parsed SQL query.
 */
export function extractColumnNamesAndTypes(
  parsedSqlQuery: AST | AST[],
): UserSqlDataValidationInput {
  const columnNames: string[] = [];
  const columnTypes: string[] = [];

  if (Array.isArray(parsedSqlQuery)) {
    parsedSqlQuery.forEach((query) => {
      extractColumnNamesAndTypesFromQuery(query, columnNames, columnTypes);
    });
  } else {
    extractColumnNamesAndTypesFromQuery(
      parsedSqlQuery,
      columnNames,
      columnTypes,
    );
  }

  // Create a Zod object with column names and types
  return columnNames.reduce((acc, columnName, index) => {
    return {
      ...acc,
      [columnName]: mapSqlTypeToZod(columnTypes[index]),
    };
  }, {});
}

/**
 * Extracts column names and types from a single SQL query.
 */
function extractColumnNamesAndTypesFromQuery(
  query: AST,
  columnNames: string[],
  columnTypes: string[],
) {
  if (query.type === "select") {
    query.columns.forEach((column: any) => {
      if (column.expr.type === "column_ref") {
        columnNames.push(column.expr.column);
        columnTypes.push("string"); // Default to string type
      }
    });
  }

  // Add other query types as needed
  return { columnNames, columnTypes };
}
