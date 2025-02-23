"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { createContext } from "@sql-copilot/lib/create-context";
import { assertType } from "@sql-copilot/lib/utils/assertions";
import { User, Threads } from "@sql-copilot/gen/prisma";

/**
 *
 * @param input
 * @param input.url - The URL of the file to upload
 * @param input.fileName - The name of the file to upload
 * @param input.query - The query to associate with the file
 * @param input.userEmail - The email of the user to associate with the file
 * @returns { success: boolean, fileUrl: string, threadId: string }
 */
export async function uploadFileAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{ success: boolean; fileUrl: string; thread: Threads | null }> {
  const ctx = await createContext(["prisma"]);
  const validation = validateActionInput(input, uploadFileSchema);
  if (!validation.success) {
    return { success: false, fileUrl: "", thread: null };
  }

  const { url, fileName } = validation.data;

  let outputFileName = fileName;
  if (!fileName) {
    outputFileName = url.split("/").pop() || "file";
  }

  let user: User | null = null;
  const hasUserEmail = !!input.userEmail;
  if (hasUserEmail) {
    assertType(validation.data.userEmail, z.string());
    user = await ctx.prisma.user.findUnique({
      where: { email: validation.data.userEmail },
    });
    if (!user) {
      return { success: false, fileUrl: "", thread: null };
    }
  }

  const thread = await ctx.prisma.threads.create({
    data: {
      userId: user?.id,
      title: validation.data.query,
      files: {
        create: {
          name: outputFileName,
          url,
          user: hasUserEmail ? { connect: { id: user?.id } } : undefined,
        },
      },
    },
  });

  const existingFile = await ctx.prisma.files.findFirst({
    where: { url },
  });

  if (existingFile) {
    return {
      success: true,
      fileUrl: existingFile.url,
      thread: thread,
    };
  }

  try {
    const newFile = await ctx.prisma.files.create({
      data: {
        name: outputFileName,
        url,
        user: hasUserEmail ? { connect: { id: user?.id } } : undefined,
      },
    });
    return {
      success: true,
      fileUrl: newFile.url,
      thread: thread,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      fileUrl: "",
      thread: null,
    };
  }
}
