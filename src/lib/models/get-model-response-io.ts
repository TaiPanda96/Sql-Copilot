import { ContextWith } from "../create-context";
import {
  assertIsChatCompletion,
  assertIsOpenAiClient,
} from "../utils/assertions";
import { getCompletionContent } from "../utils/get-completion";
import { OpenAiClient } from "./llms/open-ai/get-open-ai-client";

export async function* getModelResponseIo(
  ctx: ContextWith<"model" | "prisma">,
  {
    query,
    content,
    prompt,
    messageHistory = [],
  }: {
    query: string;
    content: string;
    prompt: string;
    messageHistory?: string[];
  }
) {
  const { getModelClient } = ctx.model;
  const model = getModelClient() as OpenAiClient;
  assertIsOpenAiClient(model);

  let messageContext: {
    role: "user" | "system";
    content: string;
  }[] = [];
  if (Array.isArray(messageHistory) && messageHistory.length > 0) {
    messageContext = messageHistory.map((message) => ({
      role: "user",
      content: message,
    }));
  }

  const streamResponse = await model?.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "system",
        content,
      },
      ...messageContext,
      {
        role: "user",
        content: query,
      },
    ],
    max_tokens: 4096,
    n: 1,
  });

  if (!streamResponse) {
    throw new Error("Failed to get a response from the model.");
  }

  assertIsChatCompletion(streamResponse);

  if (streamResponse.choices && streamResponse.choices.length > 0) {
    for (const choice of streamResponse.choices) {
      yield getCompletionContent(choice);
    }
  } else {
    throw new Error("Failed to get a response from the model.");
  }
}
