/**
 * Controller for the aggregationCalc tool.
 * This is used in the OpenAI tool for analyzing structured data.
 * It takes:
 * - fileStream: The file stream to be processed by the tool.
 * - query: The query string to be processed by the tool.
 * The controller will call a generic streamDataInput function to process the file stream.
 * Then, it will call the aggregationCalc function to generate an aggregation from structured data based on AggregationType.
 * The controller will return the aggregation result.
 * @example
 * inputUrl: z.string().describe("The URL of the input data"),
       query: z.string().describe("A SQL query to filter the data"),
       aggregationSchema: aggregationSchema.describe(
         "The aggregation schema the data should be grouped by"
       ),
 *
 */
import { z } from "zod";
import { aggregationSchema } from "./aggregation-schema";
import { aggregationCalc, AggregationCalcOutput } from "./aggregation-calc";
import { streamDataInput } from "@sql-copilot/lib/utils/stream-input";

export type AggregationInput = {
  inputUrl: string;
  aggregationSchema: z.infer<typeof aggregationSchema>;
};

export async function aggregationCalcController({
  inputUrl,
  aggregationSchema,
}: AggregationInput): Promise<AggregationCalcOutput> {
  // Creates a readable stream that reads data from the input URL
  const inputDataRows = streamDataInput(inputUrl);

  const aggregationResult = await aggregationCalc(
    inputDataRows,
    aggregationSchema
  );

  if (!aggregationResult) {
    throw new Error("No aggregation result returned. Please check your input.");
  }

  return aggregationResult;
}
