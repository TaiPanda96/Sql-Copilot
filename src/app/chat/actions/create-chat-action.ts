"use server";

import {
  UseFormFieldError,
  validateActionInput,
} from "@sql-copilot/lib/components/use-form-action";
import { createContext } from "@sql-copilot/lib/create-context";
import { z } from "zod";

/**
 * Create a Schema for a new chat. This is used for client-side validation.
 */

const createChatSchema = z.object({
  message: z.string().min(1),
});

/**
 * The result of creating a chat.
 */
type CreateChatResult = {
  success: true;
  tableSchemaId?: string;
  messageId?: string;
};

type CreateChatResultWithErrors<TSchema extends z.AnyZodObject> =
  | {
      success: false;
      error: UseFormFieldError<TSchema>;
    }
  | {
      success: false;
      errors: { message: string };
    };

/**
 * Server-side action to create a chat message.
 * A message is stored in the database and can be retrieved later.
 */
export async function createMessageAction(
  input: z.input<typeof createChatSchema>
): Promise<
  CreateChatResult | CreateChatResultWithErrors<typeof createChatSchema>
> {
  const parsed = createChatSchema.safeParse(input);
  const ctx = await createContext(["prisma"]);

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

  const message = await ctx.prisma.messageSchema.create({
    data: {
      message: input.message,
    },
  });

  return {
    success: true,
    messageId: message.id,
  };
}
