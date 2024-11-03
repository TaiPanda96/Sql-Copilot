"use client";

import { MessageResponse } from "@sql-copilot/app/chat/page";
import { Inset } from "@sql-copilot/lib/components/inset";
import { SectionCard } from "@sql-copilot/lib/components/section-card";
import { Stack } from "@sql-copilot/lib/components/stack";
import { Text } from "@sql-copilot/lib/components/text";
import React, { ReactNode, useEffect, useRef } from "react";

interface MessageListComponentProps {
  messages: MessageResponse[];
}

/**
 * Component to render a list of messages.
 * When new messages appear, the component will scroll to the bottom.
 * the message ref is used to scroll to the bottom of the message list.
 * the useEffect hook is used to scroll to the bottom whenever the messages change.
 */
export default function MessageListComponent({
  messages,
}: MessageListComponentProps) {
  const messageListRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={messageListRef}
      className="flex flex-col space-y-2 p-4 overflow-auto max-h-96 scroll-smooth"
    >
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
        message.sender === "user" ? "bg-gray-700 text-white" : "bg-gray-200"
      }`}
    >
      {message.responseMessage.map((msg, idx) => (
        <Stack key={idx} gap={2}>
          {CodeBlockResponse(msg, message.sender)}
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

function CodeBlockResponse(messageResponse: string, sender: "user" | "llm") {
  const isSQL = isSQLQuery(messageResponse);

  /**
   * Extract the ```sql``` code block from the message response.
   */
  let sqlCodeBlock;
  let remainingText = "";
  if (isSQL) {
    sqlCodeBlock = messageResponse.match(/```sql([\s\S]*?)```/);
    /**
     * Get the remaining text explanations from the message response that isn't
     * part of the SQL code block.
     */
    if (sqlCodeBlock) {
      // Extract the SQL block and remaining text
      const [sqlBlock] = sqlCodeBlock;
      const splitMessage = messageResponse.split(sqlBlock);
      remainingText = splitMessage[1];
    } else {
      return (
        <Stack gap={4}>
          <Inset className="bg-red-100 text-red-600 p-2 rounded-md">
            <Text value="Failed to extract SQL code block." />
          </Inset>
        </Stack>
      );
    }

    return (
      <Stack gap={4}>
        {remainingText && (
          <p className="overflow-auto">
            {FormattedText({ text: remainingText, sender })}
          </p>
        )}
        <Inset>
          <pre className="overflow-auto max-h-64 overflow-x-auto bg-gray-100 p-4 rounded-md shadow-sm">
            <code className="text-sm text-gray-800">{sqlCodeBlock[1]}</code>
          </pre>
        </Inset>
      </Stack>
    );
  } else {
    return <Text value={FormattedText({ text: messageResponse, sender })} />;
  }
}

/**
 * Component to parse and render formatted text with headings and lists.
 */
function FormattedText({
  text,
  sender,
}: {
  text: string;
  sender: "user" | "llm";
}) {
  const lines = text.trim().split("\n");
  const elements: ReactNode[] = [];

  const senderColor = sender === "user" ? "text-white-500" : "text-gray-700";

  for (const line of lines) {
    if (line.startsWith("###")) {
      elements.push(
        <h3 key={line} className={`text-lg font-semibold ${senderColor} mb-2`}>
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("-")) {
      // Convert bullets into a list
      elements.push(
        <li key={line} className={`ml-4 list-disc ${senderColor} mb-1`}>
          {line.replace("- ", "")}
        </li>
      );
    } else {
      elements.push(
        <p key={line} className={`${senderColor} mb-2`}>
          {line}
        </p>
      );
    }
  }
  // Wrap the list items in a <ul> if there are any
  return (
    <div>
      {elements.some((el) => React.isValidElement(el) && el.type === "li") ? (
        <ul>{elements}</ul>
      ) : (
        elements
      )}
    </div>
  );
}
