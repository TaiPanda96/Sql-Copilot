"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { createChatAction } from "@sql-copilot/app/chat/actions/create-chat-action";
import MessageEditorComponent from "@sql-copilot/app/chat/components/MessageEditor";
import MessageListComponent from "@sql-copilot/app/chat/components/MessageList";
import { Logout } from "@sql-copilot/lib/components/log-out";
import SideBarNav from "@sql-copilot/lib/components/side-bar-nav";
import { Stack } from "@sql-copilot/lib/components/stack";
import { redirect } from "next/navigation";
import { useState } from "react";

export interface MessageResponse {
  id: string;
  responseMessage: string[];
  sender: "user" | "llm";
}

const breadcrumbs = [
  { href: "/chat/schemas", label: "Data Definitions" },
  { href: "/chat/threads", label: "Conversations" },
];

/**
 * This is the main chat page component.
 * It contains the message list and the message editor.
 */
export default function ChatPage() {
  const { user, isLoading, isAuthenticated } = useKindeAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect(`${process.env.KINDE_SITE_URL}`);
  }

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
      const { responseMessage } = await createChatAction({
        message,
        userEmail: user?.email as string,
      });
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
    <div className="flex h-screen">
      <SideBarNav
        breadcrumbs={breadcrumbs}
        currentUser={
          user
            ? {
                email: user.email,
                name: user.given_name,
              }
            : null
        }
      />
      <Logout />
      <div className="flex-1 flex items-center justify-center">
        <Stack gap={6} className="w-full max-w-lg">
          <MessageListComponent currentUser={user} messages={messages} />
          <MessageEditorComponent
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        </Stack>
      </div>
    </div>
  );
}
