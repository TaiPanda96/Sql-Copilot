import { z } from "zod";
import Papa from "papaparse";
import { camelCase } from "lodash";

const rowSchema = z.record(z.any());

/**
 *
 * @param inputUrl - The URL of the input data
 * @returns An AsyncGenerator for each row of the input data
 */
export async function* streamDataInput(
  inputUrl: string,
  maxSamples?: number
): AsyncGenerator<z.infer<typeof rowSchema>> {
  const readableStream = await fetch(inputUrl);
  if (!readableStream.body) {
    throw new Error("No stream available");
  }
  const reader = readableStream.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let partialChunk = "";
  let count = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    partialChunk += chunk;

    const results = Papa.parse(partialChunk, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: camelCase,
    });

    // Reset partialChunk to store only the last incomplete line
    const lastNewlineIndex = partialChunk.lastIndexOf("\n");
    partialChunk =
      lastNewlineIndex !== -1 ? partialChunk.slice(lastNewlineIndex + 1) : "";

    for (const row of results.data as Record<string, unknown>[]) {
      // Ensure the row is properly formatted
      const transformedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [camelCase(key), value])
      );

      const validation = rowSchema.safeParse(transformedRow);
      if (validation.success) {
        yield validation.data;
        count++;

        if (maxSamples !== undefined && count >= maxSamples) return;
      } else {
        console.log("Skipping invalid row:", validation.error);
      }
    }
  }

  // Process any remaining data in `partialChunk`
  if (partialChunk.trim()) {
    const finalResults = Papa.parse(partialChunk, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: camelCase,
    });

    for (const row of finalResults.data as Record<string, unknown>[]) {
      const transformedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [camelCase(key), value])
      );

      const validation = rowSchema.safeParse(transformedRow);
      if (validation.success) {
        yield validation.data;
        count++;

        if (maxSamples !== undefined && count >= maxSamples) return;
      }
    }
  }
}
