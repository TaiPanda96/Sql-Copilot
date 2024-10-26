"use client";

import { MessageResponse } from "@sql-copilot/app/chat/page";
import { Inset } from "@sql-copilot/lib/components/inset";
import { SectionCard } from "@sql-copilot/lib/components/section-card";
import { Stack } from "@sql-copilot/lib/components/stack";
import { Text } from "@sql-copilot/lib/components/text-input";

interface MessageListComponentProps {
  messages: MessageResponse[];
}

export default function MessageListComponent({
  messages,
}: MessageListComponentProps) {
  return (
    <div className="flex flex-col space-y-2 p-4 overflow-auto max-h-96">
      {messages.map((message) => MessageResponseList(message))}
    </div>
  );
}

/**
 * Component to render a list of messages.
 * This will render the message response in a card.
 * If the message is from the user, it will be blue.
 * If the message is from the LLM, it will be gray.
 * If the message is a SQL query, it will be rendered in a code block.
 */
function MessageResponseList(message: MessageResponse) {
  return (
    <SectionCard
      className={`p-2 rounded-md ${
        message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      {message.responseMessage.map((msg, idx) => (
        <Stack key={idx} gap={2}>
          {CodeBlockResponse(msg)}
        </Stack>
      ))}
    </SectionCard>
  );
}

/**
 * Utility function to check if the message response is a SQL query.
 * If so, it will optionally render the code block.
 *
 * This utility function will only detect ```sql``` queries.
 */
function isSQLQuery(messageResponse: string) {
  const containsSqlWithTripleBackticks = /```sql/.test(messageResponse);
  return containsSqlWithTripleBackticks;
}

/**
 * Component to render a code block with a copy button for SQL queries.
 */
function CodeBlockResponse(messageResponse: string) {
  const isSQL = isSQLQuery(messageResponse);

  return isSQL ? (
    <Stack gap={4}>
      <Text value="SQL Query" bold />
      <Inset>
        <pre className="overflow-auto">
          <code className="text-sm text-gray-800">{messageResponse}</code>
        </pre>
      </Inset>
    </Stack>
  ) : (
    <Text value={messageResponse} />
  );
}
