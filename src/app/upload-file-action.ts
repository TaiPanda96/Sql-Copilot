"use server";

import { validateActionInput } from "@sql-copilot/lib/components/use-form-action";
import { z } from "zod";
import { uploadFileSchema } from "./upload-file-input";
import { createContext } from "@sql-copilot/lib/create-context";
import { assertType } from "@sql-copilot/lib/utils/assertions";
import { User } from "@sql-copilot/gen/prisma";

export async function uploadFileAction(
  input: z.input<typeof uploadFileSchema>
): Promise<{ success: boolean; fileUrl: string; threadId?: string }> {
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

  let user: User | null = null;
  const hasUserEmail = !!input.userEmail;
  if (hasUserEmail) {
    assertType(validation.data.userEmail, z.string());
    user = await ctx.prisma.user.findUnique({
      where: { email: validation.data.userEmail },
    });
    if (!user) {
      return { success: false, fileUrl: "" };
    }
  }

  const existingFile = await ctx.prisma.files.findFirst({
    where: { url },
  });

  if (existingFile) {
    return {
      success: true,
      fileUrl: existingFile.url,
    };
  }

  const thread = await ctx.prisma.threads.create({
    data: {
      userId: user?.id,
      title: validation.data.query,
    },
  });

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
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      fileUrl: "",
    };
  }
}
