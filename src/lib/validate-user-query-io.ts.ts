import { Prisma } from "@sql-copilot/gen/prisma";
import { ContextWith } from "@sql-copilot/lib/create-context";
import { convertPrismaJsonToZod } from "@sql-copilot/lib/utils/convert-prisma-json-to-zod";
import { extractColumnNamesAndTypes } from "@sql-copilot/lib/utils/extract-column-names-and-types";
import { AST, Parser } from "node-sql-parser";
import { z } from "zod";

export interface UserSqlDataValidationInput {
  [columnName: string]: z.ZodType<any>;
}

/**
 * A JSON object that represents the schema of a database.
 * The keys are column names and the values are objects with a `type` key that represents the data type of the column.
 * Example:
 * {
 *  "id": {
 *   "type": "int"
 * },
 */
export interface ZodDataBaseJson {
  [key: string]: {
    type: string;
  };
}

/**
 * Converts a user's SQL query to a Zod object that can be used to validate the query against a schema.
 */
export function parseUserSqlQueryToZodInputData(
  sqlQuery: string,
): UserSqlDataValidationInput {
  let parsedQuery: AST | AST[] = [];
  const parser = new Parser();

  try {
    parsedQuery = parser.astify(sqlQuery);
  } catch (err) {
    throw new Error(`Error parsing SQL query: ${err}`);
  }

  // Extract columns and types from the parsed query
  return extractColumnNamesAndTypes(parsedQuery);
}

export async function validateUserQueryIo(
  ctx: ContextWith<"prisma">,
  {
    schemaName,
    sqlQuery,
  }: {
    schemaName: string;
    sqlQuery: string;
  },
) {
  const tableSchema = await ctx.prisma.tableSchema.findFirstOrThrow({
    where: {
      schemaName,
      expiredAt: null,
    },
  });

  if (!tableSchema.zodValidationConfig) {
    throw new Error("No schema validation config found for this table.");
  }

  // Convert SQL query to Zod object
  const zodInputDataSchema = parseUserSqlQueryToZodInputData(sqlQuery);

  // Convert `zodValidationConfig` to a Zod schema object
  const validationZodSchema = convertPrismaJsonToZod(
    tableSchema.zodValidationConfig as Prisma.JsonObject,
  );

  for (const [name] of Object.keys(zodInputDataSchema)) {
    // Validate Key exists in schema
    if (!validationZodSchema[name as keyof typeof validationZodSchema]) {
      throw new Error(`Column ${name} not found in schema.`);
    }
  }
  // Validate the query against the schema
  const validationResult = validationZodSchema.safeParse(zodInputDataSchema);
  return validationResult.success;
}
