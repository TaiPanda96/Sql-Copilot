import { Prisma } from "@sql-copilot/gen/prisma";
import { isNil } from "@sql-copilot/lib/utils/is-nil";
import { mapSqlTypeToZod } from "@sql-copilot/lib/utils/map-sql-types-to-zod";
import { z } from "zod";

/**
 * Converts a Prisma JSON schema to a Zod schema.
 * Note: the prismaJson will be a special JSON that contains the type of each column.
 */
export function convertPrismaJsonToZod(prismaJson: Prisma.JsonObject) {
  if (!prismaJson || isNil(prismaJson)) {
    return z.object({});
  }

  const dataBaseZodJson = prismaJson as {
    [key: string]: {
      type: string;
    };
  };

  const zodSchema = Object.keys(dataBaseZodJson).reduce((acc, key) => {
    const type = dataBaseZodJson[key as keyof typeof dataBaseZodJson]?.type; // assuming JSON schema contains type info
    return {
      ...acc,
      [key]: mapSqlTypeToZod(type),
    };
  }, {});

  return z.object(zodSchema);
}
