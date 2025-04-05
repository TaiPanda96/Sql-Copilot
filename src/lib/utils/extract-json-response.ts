import { ChartConfig } from "types/chart";

/**
 * Extracts and validates the JSON stringified data from the LLM response.
 * It detects JSON-like structures, deserializes them, and validates that they match the expected chart data format.
 *
 * The expected response format is:
 * [
 *   {
 *     "type": "BarChart",
 *     "title": "Title of the chart",
 *     "data": [
 *       {
 *         "key1": "value1",
 *         "key2": "value2"
 *       },
 *       {
 *         "key1": "value3",
 *         "key2": "value4"
 *       }
 *     ],
 *     "xKey": "key1",
 *     "yKey": "key2"
 *   }
 * ]
 *
 * @param llmResponse - The response from the LLM as a string
 * @returns The parsed and validated chart data as a JavaScript object
 * @throws An error if the response doesn't contain valid JSON data or if the structure is invalid
 */
export function extractJsonResponse(llmResponse: string): ChartConfig[] {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/; // Capture JSON within ```json ... ```
  let jsonString = "";
  const jsonMatch = llmResponse.match(jsonRegex);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1].trim();
  } else {
    // Fallback: If no markdown block found, try to match any array-like JSON pattern
    const fallbackJsonMatch = llmResponse.match(/\[.*\]/s); // Matches first JSON array
    if (fallbackJsonMatch) {
      jsonString = fallbackJsonMatch[0].trim();
    }
  }

  // Remove any stray markdown markers if still present
  jsonString = jsonString.replace(/```json|```/g, "").trim();

  // If the string doesn't start with '[', try to extract the array substring
  if (!jsonString.startsWith("[")) {
    const startIndex = jsonString.indexOf("[");
    const endIndex = jsonString.lastIndexOf("]");
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      jsonString = jsonString.substring(startIndex, endIndex + 1).trim();
    }
  }

  if (!jsonString || !jsonString.trim() || !jsonString.startsWith("[")) {
    throw new Error("No JSON data found in the response.");
  }

  let chartConfig: ChartConfig[];

  try {
    chartConfig = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse JSON stringified data: ${error}`);
  }

  return chartConfig;
}
