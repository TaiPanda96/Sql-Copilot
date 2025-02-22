import { parseStreamingCsv } from "../utils/parse-streaming-csv";

/**
 * Fetches and parses the file content from a URL.
 * Supports JSON, CSV, Images (PNG, JPEG, WebP, GIF, TIFF), and PDFs.
 */
export async function processFileInputs(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const contentType = response.headers.get("Content-Type");
    switch (contentType) {
      case "application/json":
        return await response.json(); // Parse JSON files
      case "text/csv":
        return await parseStreamingCsv(response.body); // Parse CSV files
      case "image/png":
      case "image/jpeg":
      case "image/webp":
      case "image/gif":
      case "image/tiff":
        return await convertImageToBase64(response);
      default:
        throw new Error(
          "Unsupported file type. Supported types: JSON, CSV, PDF, PNG, JPEG, WebP, GIF, TIFF."
        );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error parsing file from URL: ${error.message}`);
    } else {
      throw new Error("Error parsing file from URL: unknown error");
    }
  }
}

/**
 * Converts an image to a Base64-encoded string.
 */
async function convertImageToBase64(response: Response): Promise<string> {
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error("Error converting image to Base64."));
    };
    reader.readAsDataURL(blob);
  });
}
