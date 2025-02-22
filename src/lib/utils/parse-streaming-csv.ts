import Papa from "papaparse";

/**
 * Utility function to parse a streaming CSV file.
 * @param stream - The ReadableStream of the CSV file
 * In order to avoid memory issues, we parse the CSV file in chunks.
 * This function uses PapaParse to parse the CSV file.
 */
export async function parseStreamingCsv(
  stream: ReadableStream<Uint8Array> | null
): Promise<unknown> {
  if (!stream) {
    throw new Error("No stream available");
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let csvResult: Record<string, unknown>[] = [];

  const parseChunk = (chunk: string) => {
    Papa.parse(chunk, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        csvResult = csvResult.concat(results.data as Record<string, unknown>[]);
      },
    });
  };

  let { value, done } = await reader.read();
  while (!done) {
    const chunk = decoder.decode(value, { stream: true });
    parseChunk(chunk);
    ({ value, done } = await reader.read());
  }
  parseChunk(decoder.decode()); // flush remaining text

  return csvResult;
}
