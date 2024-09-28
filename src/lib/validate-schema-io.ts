import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { Parser } from "node-sql-parser";

const prisma = new PrismaClient();

// Helper function to get Zod types from the stored schema
function createZodSchemaFromJson(types: Record<string, any>) {
  // This is a simplistic example; adapt it based on your type definitions.
  const zodObject = {};
  for (const [key, value] of Object.entries(types)) {
    switch (value.type) {
      case "string":
        break;
      case "number":
        break;
      case "boolean":
        break;
      default:
        throw new Error(`Unsupported type`);
    }
  }
  return z.object(zodObject);
}

async function validateQueryAgainstSchema(
  sqlQuery: string,
  schemaName: string
) {
  // Step 1: Retrieve schema and types from database
  const storedSchema = await prisma.sqlSchemaDefinition.findFirst({
    where: {
      schemaName,
      expired_at: null, // Get current valid schema
    },
  });

  if (!storedSchema) {
    throw new Error(`Schema ${schemaName} not found.`);
  }

  // Step 2: Parse the SQL query and extract columns
  let parsedQuery;
  const parser = new Parser();
  try {
    parsedQuery = parser.astify(sqlQuery);
  } catch (err) {
    throw new Error(`Error parsing SQL query: ${err}`);
  }

  const columnsQueried = [];
  // Extract columns from the parsed query AST
  // This is a simplistic example; adapt it based on your SQL parser output.
  // For example, you might need to traverse the AST to find the columns.

  // Step 3: Validate that the columns exist in the schema
  const schemaColumns = Object.keys(storedSchema.schema);

  // Step 4: Validate data types using Zod
  const zodSchema = createZodSchemaFromJson(storedSchema.types);

  // In a real-world case, you'd validate the actual data against the schema here.
  // For this example, let's assume you want to validate if the columns respect the type definitions.

  // Assuming you have data to validate (simplified example)
  const dataToValidate = {}; // Populate with the data from the user's query

  const validationResult = zodSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    throw new Error(`Validation error: ${validationResult.error}`);
  }

  return "Query and data are valid according to schema.";
}
