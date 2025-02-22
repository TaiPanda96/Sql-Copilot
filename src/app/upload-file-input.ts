import { z } from "zod";

export const uploadFileSchema = z.object({
  url: z.string(),
  fileName: z.string().optional(),
  query: z.string(),
  userEmail: z.string().nullable(),
});
