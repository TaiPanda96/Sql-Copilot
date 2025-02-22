"use client";

import { useState } from "react";
import { Button, buttonVariants } from "./button";
import { FileIcon, SendIcon } from "lucide-react";
import { DynamicChart, ChartType } from "./dynamic-chart";
import { camelCase } from "lodash";
import { postUserQueryAction } from "@sql-copilot/app/post-user-query-action";
import { Messages, Threads } from "@sql-copilot/gen/prisma";
import { Stack } from "./stack";
import { Inline } from "./inline";
import AttachmentButton from "./attachment-button";
import { cn } from "shadcn/lib/utils";

export default function ChatInterface({
  user,
}: {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
}) {
  // State variables for conversation and visualization
  const [query, setQuery] = useState("");
  const [url, setFileUrl] = useState("");
  const [chartConfig, setChartConfig] = useState<{
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<{ [key: string]: any }>;
    xKey: string;
    yKey: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<
    | (Threads & {
        messages: Messages[];
      })
    | null
  >(null);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Unified handler for both initial queries and follow-up messages.
  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);

    // If there is no user, return early.
    if (!user) {
      setLoading(false);
      setError("User not found.");
      return;
    }

    try {
      const response = await postUserQueryAction({
        query,
        url: url,
        threadId: thread?.id,
        userEmail: user.email || "",
      });

      if (!response.success) {
        setLoading(false);
        setError(`Error posting query: ${response.message}`);
        return;
      }

      // Update the chart configuration from the LLM response.
      setChartConfig(response.chartConfig);

      // Update or set the thread if it's the first message.
      if (!thread) {
        setThread(response.thread);
      }

      // Update the conversation history.
      setMessages(response.thread?.messages || []);

      // Clear the input and file attachment for subsequent messages.
      setQuery("");
      setFileUrl("");
    } catch (error) {
      console.error("Error posting query:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation & Visualization Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Conversation history */}
        {error && <p className="text-red-500">{error}</p>}
        <div>
          {messages.length
            ? messages.map((msg) => (
                <Message key={msg.id} message={msg.message} />
              ))
            : null}
        </div>

        {/* Visualization */}
        {chartConfig && (
          <DynamicChart
            chartConfig={{
              ...chartConfig,
              type: chartConfig.type as ChartType,
              data: chartConfig.data.map((item) => {
                const newItem: { [key: string]: any } = {};
                Object.keys(item).forEach((key) => {
                  newItem[camelCase(key)] = item[key];
                });
                return newItem;
              }),
              xKey: camelCase(chartConfig.xKey),
              yKey: camelCase(chartConfig.yKey),
            }}
          />
        )}
      </div>

      {/* Unified Toolbar */}
      <Stack className="border-gray-800 rounded p-6" gap={4}>
        {/* Query / Follow-Up Input */}
        {url && (
          <Stack gap={2} align="left">
            <Inline gap={2} align="center">
              <FileIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600 truncate">
                {url.split("/").pop()}
              </span>
            </Inline>
          </Stack>
        )}
        <Inline gap={4} justify="between" align="top">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full h-24 p-2 text-gray-800 bg-gray-100 border border-gray-200 rounded-md"
          />

          <Stack gap={2}>
            {/* File Upload */}
            <AttachmentButton
              onAttachment={(fileUrl) => setFileUrl(fileUrl.url)}
              className={cn(
                buttonVariants({
                  disabled: false,
                  loading: false,
                  noPadding: true,
                  variant: "solid",
                })
              )}
            />

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              IconRight={SendIcon}
            >
              {loading ? "Processing..." : "Send"}
            </Button>
          </Stack>
        </Inline>
      </Stack>
    </div>
  );
}

function Message({ message }: { message: string }) {
  return (
    <div className="p-2 bg-gray-100 rounded-md mb-2">
      <p className="text-sm text-gray-800">{message}</p>
    </div>
  );
}
