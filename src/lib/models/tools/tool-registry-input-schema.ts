import { ToolRegistryType } from "@sql-copilot/lib/models/tools/tool-registry";
import { z } from "zod";

export const toolRegistryInputSchema = z.object({
  tool: z
    .nativeEnum(ToolRegistryType)
    .describe("The tool to execute based on the ToolRegistryType"),
  params: z.record(z.any()).describe("The parameters for the tool"),
});

export type ToolRegistryInput = z.infer<typeof toolRegistryInputSchema>;
