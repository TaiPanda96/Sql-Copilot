"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";

export async function uploadFileAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{ success: boolean }> {
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false };
  }
  const { url, fileName, story } = validation.data;

  let outputFileName = fileName;
  if (!fileName.length) {
    outputFileName = url.split("/").pop() || "file";
  }
  try {
    // Process the file here
    console.log("Processing file:", { url, fileName, story });

    // IO to store the story and url in the database
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error processing files:", error);
    return {
      success: false,
    };
  }
}
