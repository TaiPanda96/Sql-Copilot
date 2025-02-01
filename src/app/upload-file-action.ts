"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { createContext } from "@sql-copilot/lib/create-context";

export async function uploadFileAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{ success: boolean; fileUrl: string }> {
  const ctx = await createContext(["prisma"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, fileUrl: "" };
  }
  const { url, fileName } = validation.data;

  let outputFileName = fileName;
  if (!fileName) {
    outputFileName = url.split("/").pop() || "file";
  }
  try {
    const newFile = await ctx.prisma.files.create({
      data: {
        name: outputFileName,
        url,
      },
    });

    // IO to store the story and url in the database
    return {
      success: true,
      fileUrl: newFile.url,
    };
  } catch (error) {
    console.error("Error uploading file action:", error);
    return {
      success: false,
      fileUrl: "",
    };
  }
}
