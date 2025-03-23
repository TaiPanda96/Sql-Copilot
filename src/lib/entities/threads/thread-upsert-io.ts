import { Messages, Threads } from "@sql-copilot/gen/prisma";
import { ContextWith } from "../../create-context";

/**
 * Upsert a thread and message in the database.
 * If the threadId is provided, the message will be added to the existing thread.
 * If the threadId is not provided, a new thread will be created.
 * @param ctx
 * @param query
 * @param threadId
 * @returns - { thread, messageHistory }
 * @throws
 */
export async function threadUpsertIo(
  ctx: ContextWith<"prisma">,
  {
    query,
    threadId,
  }: {
    query: string;
    threadId?: string;
  }
): Promise<{
  thread:
    | (Threads & {
        messages: Messages[];
      })
    | null;
  messageHistory: string[];
} | null> {
  let thread:
    | (Threads & {
        messages: Messages[];
      })
    | null = null;
  let messageHistory: string[] = [];
  const hasThread = !!threadId;
  if (hasThread) {
    thread = await ctx.prisma.threads.findUnique({
      where: { id: threadId },
      include: { messages: true },
    });

    if (!thread) {
      return null;
    }

    const newMessage = await ctx.prisma.messages.create({
      data: {
        message: query,
        threadId: thread.id,
      },
    });

    messageHistory = thread.messages
      .map((messageObj) => messageObj.message)
      .concat(newMessage.message);

    thread = {
      ...thread,
      messages: [...thread.messages, newMessage],
    };
  } else {
    await ctx.prisma.threads.create({
      data: {
        title: query,
        messages: {
          create: {
            message: query,
          },
        },
      },
    });

    const newThread = await ctx.prisma.threads.findFirst({
      where: { title: query },
      include: { messages: true },
    });

    thread = newThread;
  }

  return { thread, messageHistory };
}
