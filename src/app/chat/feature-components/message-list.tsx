"use client";

interface Message {
  id: string;
  text: string;
  sender: "user" | "llm";
}

interface MessageListComponentProps {
  messages: Message[];
}

export default function MessageListComponent({
  messages,
}: MessageListComponentProps) {
  return (
    <div className="flex flex-col space-y-2 p-4 overflow-auto max-h-96">
      {messages.map((message) => RenderMessage(message))}
    </div>
  );
}

function RenderMessage(message: Message) {
  return (
    <div
      key={message.id}
      className={`p-2 rounded-md ${
        message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      {message.text}
    </div>
  );
}
