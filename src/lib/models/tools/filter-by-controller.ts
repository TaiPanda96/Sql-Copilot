import { z } from "zod";
import { filterInputSchema, resolveFilterConfig } from "./filter-config";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-input";

export type FilterByInput = {
  inputUrl: string;
  filterInputSchema: z.infer<typeof filterInputSchema>;
};

export async function filterByController({
  inputUrl,
  filterInputSchema,
}: FilterByInput): Promise<Record<string, unknown>[]> {
  const inputDataRows = streamDataInput(inputUrl);
  const filteredOutputResult = [];
  const filterFn = resolveFilterConfig(filterInputSchema);
  for await (const row of inputDataRows) {
    if (filterFn && filterFn(row as unknown as Record<string, unknown>)) {
      filteredOutputResult.push(row as unknown as Record<string, unknown>);
    }
  }
  return filteredOutputResult;
}
