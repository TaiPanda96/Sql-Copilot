import { camelCase } from "lodash";
import Papa from "papaparse";

import { z } from "zod";

const rowSchema = z.record(z.any());

export async function* streamDataInput(
  inputUrl: string,
  maxSamples?: number
): AsyncGenerator<z.infer<typeof rowSchema>> {
  const response = await fetch(inputUrl, { next: { revalidate: 0 } });
  if (!response.body) throw new Error("No stream available");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let partialChunk = "";
  let headerLine: string | null = null;
  let count = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    partialChunk += chunk;

    const lines = partialChunk.split("\n");

    // Save the last partial line for next round
    partialChunk = lines.pop() || "";

    for (const line of lines) {
      if (!headerLine) {
        headerLine = line;
        continue;
      }

      const csvToParse = `${headerLine}\n${line}`;
      const parsed = Papa.parse(csvToParse, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: camelCase,
      });

      for (const row of parsed.data as Record<string, unknown>[]) {
        const transformedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [camelCase(key), value])
        );

        const validation = rowSchema.safeParse(transformedRow);
        if (validation.success) {
          yield validation.data;
          count++;
          if (maxSamples && count >= maxSamples) return;
        }
      }
    }
  }

  // Process any leftover line
  if (partialChunk && headerLine) {
    const parsed = Papa.parse(`${headerLine}\n${partialChunk}`, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: camelCase,
    });

    for (const row of parsed.data as Record<string, unknown>[]) {
      const transformedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [camelCase(key), value])
      );

      const validation = rowSchema.safeParse(transformedRow);
      if (validation.success) {
        yield validation.data;
        count++;
        if (maxSamples && count >= maxSamples) return;
      }
    }
  }
}
