"use server";

import { Threads } from "@sql-copilot/gen/prisma";
import {
  UseFormFieldError,
  validateActionInput,
} from "@sql-copilot/lib/components/use-form-action";
import { createContext } from "@sql-copilot/lib/create-context";
import { getQueryResponseIo } from "@sql-copilot/lib/large-language-models/open-ai/get-open-ai-client";
import { z } from "zod";

/**
 * Create a Schema for a new chat. This is used for client-side validation.
 */

const createChatSchema = z.object({
  message: z.string().min(1),
  userEmail: z.string().email(),
});

/**
 * The result of creating a chat.
 */
type CreateChatResult = {
  success: true;
  messageId: string;
  responseMessage?: string[];
};

type CreateChatResultWithErrors<TSchema extends z.AnyZodObject> =
  | {
      success: false;
      error: UseFormFieldError<TSchema>;
      responseMessage?: string;
    }
  | {
      success: false;
      errors: { message: string };
      responseMessage?: string;
    };

/**
 * Server-side action to create a chat message.
 * A message is stored in the database and can be retrieved later.
 */
export async function createChatAction(
  input: z.input<typeof createChatSchema>
): Promise<
  CreateChatResult | CreateChatResultWithErrors<typeof createChatSchema>
> {
  const parsed = createChatSchema.safeParse(input);
  const ctx = await createContext(["prisma", "model"]);

  if (!parsed.success) {
    return {
      success: false,
      errors: {
        message: parsed.error.errors.map((err) => err.message).join(", "),
      },
    };
  }

  const validation = validateActionInput(input, createChatSchema);
  if (!validation.success) {
    return {
      success: false,
      error: validation.errors,
    };
  }

  const user = await ctx.prisma.user.findUnique({
    where: { email: input.userEmail },
  });

  const messageObj = await ctx.prisma.messages.create({
    data: {
      message: input.message,
      userId: user ? user.id : undefined,
    },
  });

  let thread: Threads;
  const existingThread = await ctx.prisma.threads.findFirst({
    where: { userId: messageObj.userId },
    include: { messages: true },
  });

  /**
   * Create a new thread if one does not exist.
   */
  if (existingThread) {
    thread = await ctx.prisma.threads.update({
      where: { id: existingThread.id },
      data: {
        messages: {
          connect: { id: messageObj.id },
        },
      },
    });
  } else {
    thread = await ctx.prisma.threads.create({
      data: {
        title: `Chat with ${messageObj.userId}`,
        userId: messageObj.userId,
        messages: {
          connect: { id: messageObj.id },
        },
      },
    });
  }

  /**
   * Collect the messages in the thread and pass as messages to the LLM.
   */
  const response = getQueryResponseIo(ctx, {
    query: input.message,
    messageHistory: existingThread?.messages.map((m) => m.message) || [],
  });

  const messageResponse: string[] = [];
  for await (const message of response) {
    messageResponse.push(message);
  }

  return {
    success: true,
    messageId: messageObj.id,
    responseMessage: messageResponse,
  };
}
