"use client";

import { SendIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "shadcn/components/ui/button";
import { cn } from "shadcn/lib/utils";
import { chatResponseAction } from "../actions/create-chat-response-action";

interface MessageEditorProps {
  currentUser: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  } | null;
  onSendMessage: (message: string) => void;
}

export default function MessageEditorComponent({
  currentUser,
  onSendMessage,
}: MessageEditorProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles sending a message. This function is called when the user clicks the send button.
   */
  async function handleSendMessage() {
    if (!text.trim().length) {
      setLoading(false);
    }

    // Set loading
    setLoading(true);

    try {
      if (text.trim().length > 0) {
        const response = await chatResponseAction({
          message: text,
          userEmail: currentUser?.email as string,
        });
        onSendMessage(text);
        setText("");
      }

      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }

      const messageList = document.querySelector(".message-list");

      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }

      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex items-center w-full max-w-lg p-4 rounded-md shadow-md dark:bg-gray-300">
      <textarea
        className={cn(
          "w-full h-20 resize-none",
          "focus:outline-none",
          "p-2.5 text-sm text-gray-700 rounded-lg border-gray-300 focus:ring-gray-500 focus:border-gray-500",
          "dark:bg-gray-300 border-white dark:placeholder-gray-700 dark:text-gray-800 dark:focus:ring-gray-500 dark:focus:border-gray-500"
        )}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask SQL Copilot a Question"
      />
      {loading ? (
        <Button variant="ghost" disabled />
      ) : (
        <Button
          variant="ghost"
          onClick={handleSendMessage}
          className="text-gray"
        >
          <SendIcon className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
