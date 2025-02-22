import { z } from "zod";

export const postUserInputSchema = z.object({
  userEmail: z.string().optional(),
  threadId: z.string().optional(),
  url: z.string(),
  fileName: z.string().optional(),
  query: z.string(),
});
