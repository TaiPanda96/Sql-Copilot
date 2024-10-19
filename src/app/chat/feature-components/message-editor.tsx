"use client";
import SendMessageActionButton from "@sql-copilot/app/chat/feature-components/send-message-action-button";
import { useState } from "react";
import { cn } from "shadcn/lib/utils";

interface MessageEditorProps {}

export default function MessageEditorComponent({}: MessageEditorProps) {
  const [text, setText] = useState("");
  return (
    <div className="flex items-center w-full max-w-lg p-4 rounded-md shadow-md dark:bg-gray-700">
      <textarea
        className={cn(
          "w-full h-20 resize-none",
          "p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500",
          "dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        )}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask SQL Copilot a Question"
      />
      <SendMessageActionButton message={text} />
    </div>
  );
}
