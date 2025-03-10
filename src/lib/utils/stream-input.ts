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

  // Yield AsyncGenerator for each row
  let { value, done } = await reader.read();
  while (!done) {
    const chunk = decoder.decode(value, { stream: true });

    // Parse the CSV chunk
    const results = Papa.parse(partialChunk + chunk, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: camelCase,
    });

    // Store unprocessed part (last incomplete row)
    partialChunk = chunk.slice(chunk.lastIndexOf("\n") + 1);

    for (const row of (results.data as Record<string, unknown>[]).map(
      (row: Record<string, unknown>) => {
        const transformedRow = Object.entries(row).map(([key, value]) => {
          return {
            [camelCase(key)]: value,
          };
        });
        const validation = z.record(z.any()).safeParse(transformedRow);
        return validation.success ? validation.data : null;
      }
    )) {
      if (row) yield row as z.AnyZodObject;
      if (maxSamples !== undefined && count >= maxSamples) return;
      count++;
    }
    ({ value, done } = await reader.read());
  }

  // Parse the remaining chunk
  if (partialChunk) {
    const finalResults = Papa.parse(partialChunk, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: camelCase,
    });

    for (const row of finalResults.data as Record<string, unknown>[]) {
      const validation = z.record(z.any()).safeParse(row);
      if (validation.success) {
        yield validation.data;
        count++;
      }

      if (maxSamples !== undefined && count >= maxSamples) return;
    }
  }
}
