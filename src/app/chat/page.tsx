"use client";

import { createChatAction } from "@sql-copilot/app/chat/actions/create-chat-action";
import MessageEditorComponent from "@sql-copilot/app/chat/feature-components/message-editor";
import MessageListComponent from "@sql-copilot/app/chat/feature-components/message-list";
import ChatLayout from "@sql-copilot/app/chat/layout";
import { useState } from "react";

export interface MessageResponse {
  id: string;
  responseMessage: string[];
  sender: "user" | "llm";
}

/**
 * This is the main chat page component.
 * It contains the message list and the message editor.
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  // Function to handle message creation and response
  async function handleSendMessage(message: string) {
    setMessages((prevMessages) =>
      [...prevMessages].concat({
        id: Date.now().toString(),
        responseMessage: [message],
        sender: "user" as const,
      })
    );

    // Get the model response and update messages
    try {
      const { responseMessage } = await createChatAction({ message });
      setMessages((prevMessages) =>
        [...prevMessages].concat({
          id: Date.now().toString(),
          responseMessage: responseMessage as string[],
          sender: "llm" as const,
        })
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  return (
    <ChatLayout>
      <MessageListComponent messages={messages} />
      <MessageEditorComponent onSendMessage={handleSendMessage} />
    </ChatLayout>
  );
}
