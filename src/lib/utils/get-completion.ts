import OpenAI from "openai";

export function getCompletionContent(
  completion: OpenAI.Chat.Completions.ChatCompletion.Choice
): string {
  return completion.message.content ?? "";
}
