import { Prisma } from "@sql-copilot/gen/prisma";
import { ContextWith } from "@sql-copilot/lib/create-context";

export interface CreateTableSchemaInputData {
  schemaSlug: string;
  schemaName: string;
  rawSqlSchema: string;
  zodValidationConfig: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  valid_at?: Date | string;
  expired_at?: Date | string | null;
  schemaDefinition: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Create a new table schema.
 * Input Data:
 *
 */
export async function createTableSchemaIo(
  ctx: ContextWith<"prisma">,
  inputData: CreateTableSchemaInputData
) {
  const tableSchema = await ctx.prisma.tableSchema.create({
    data: {
      ...inputData,
      validAt: new Date(),
    },
  });

  return { tableSchemaId: tableSchema.id };
}
