import { z } from "zod";

export const createTableSchemaInput = z.object({
  columns: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
    })
  ),
  schemaName: z.string(),
});
