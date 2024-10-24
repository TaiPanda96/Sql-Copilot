"use client";

import { createChatAction } from "@sql-copilot/app/chat/actions/create-chat-action";
import MessageEditorComponent from "@sql-copilot/app/chat/feature-components/message-editor";
import MessageListComponent from "@sql-copilot/app/chat/feature-components/message-list";
import ChatLayout from "@sql-copilot/app/chat/layout";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "llm";
}

/**
 * This is the main chat page component.
 * It contains the message list and the message editor.
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to handle message creation and response
  async function handleSendMessage(message: string) {
    // Add user message to the list
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user" as const,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Get the model response and update messages
    try {
      const { responseMessage } = await createChatAction({ message });
      const llmMessage = {
        id: Date.now().toString(),
        text: responseMessage ?? "I'm sorry, I don't understand.",
        sender: "llm" as const,
      };
      setMessages((prevMessages) => [...prevMessages, llmMessage]);
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
