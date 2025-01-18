"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "shadcn/components/ui/button";

export function ChatInterface() {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle chat submission and AI interaction
    setInput("");
  };

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          className="
            flex-1
            py-2
            px-4
            bg-white
            border
            border-gray-200
            rounded-lg
            focus:outline-none
            focus:ring-2
            focus:ring-brand-600
            focus:border-transparent
          "
          placeholder="Ask a follow up or tell us what adjustments you want to make..."
        />
        <Button type="submit" size="icon">
          <SendHorizontal
            className="
            w-6
            h-6
            text-gray-500
            hover:text-gray-900
            transition
          "
          />
        </Button>
      </form>
    </div>
  );
}
