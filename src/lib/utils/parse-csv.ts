import Papa, { ParseResult } from "papaparse";

export const parseCSV = async (
  fileContent: string
): Promise<ParseResult<unknown>[]> => {
  return Papa.parse(fileContent, { header: true, dynamicTyping: true })
    .data as ParseResult<unknown>[];
};
