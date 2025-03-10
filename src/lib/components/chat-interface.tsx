"use client";

import { useState } from "react";
import { Button, buttonVariants } from "./button";
import { FileIcon, SendIcon, XIcon } from "lucide-react";
import { DynamicChart, ChartType } from "./dynamic-chart";
import { camelCase } from "lodash";
import { Messages, Threads } from "@sql-copilot/gen/prisma";
import { Stack } from "./stack";
import { Inline } from "./inline";
import AttachmentButton from "./attachment-button";
import { cn } from "shadcn/lib/utils";
import { LoaderCircle } from "./loading-circle";
import { RenderAnimationContainer } from "./render-animation-container";
import { MessageList } from "./message-list";
import { postUserChartQueryAction } from "@sql-copilot/app/quick-chart/post-user-chart-query-action";
import { Text } from "./text";

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
      const response = await postUserChartQueryAction({
        query,
        url,
        threadId: thread?.id,
        userEmail: user.email || "",
        chartType: "BarChart",
        title: "Title of the chart",
        xKey: "key1",
        yKey: "key2",
      });

      if (!response.success) {
        setLoading(false);
        setError(`${response.message}`);
        return;
      }

      // Update or set the thread if it's the first message.
      if (!thread) {
        setThread(response.thread);
      }
      setMessages(response.thread?.messages || []);
      setChartConfig(response.chartConfig);
      setQuery("");
    } catch (error) {
      console.error("Error posting query:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={4}>
      <Stack gap={4}>
        <Text value="Project Files" bold color="light" size="lg" />
        {url && (
          <RenderAnimationContainer>
            <Inline gap={2}>
              <FileIcon className="text-white" />
              <Text value={url} color="light" />
              <Button
                onClick={() => setFileUrl("")}
                variant="solid"
                IconRight={XIcon}
                className={cn(
                  "p-2",
                  buttonVariants({
                    disabled: false,
                    loading: false,
                    noPadding: true,
                    variant: "solid",
                  })
                )}
                value="Remove File"
              />
            </Inline>
          </RenderAnimationContainer>
        )}
        <Stack gap={2}>
          <Text value="Chart Type" color="light" />
          <div className="dropdown">
            <select
              className="overflow-x-auto p-2 text-white bg-inherit border rounded-lg border-gray-500"
              onChange={(e) => {
                if (chartConfig) {
                  setChartConfig({
                    ...chartConfig,
                    type: e.target.value as
                      | "BarChart"
                      | "LineChart"
                      | "PieChart",
                  });
                }
              }}
            >
              <option value="BarChart">Bar Chart</option>
              <option value="LineChart">Line Chart</option>
              <option value="PieChart">Pie Chart</option>
            </select>
          </div>
        </Stack>
      </Stack>
      <div className="flex-1 overflow-y-auto">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          {messages.length
            ? messages.map((msg) => (
                <MessageList key={msg.id} message={msg.message} />
              ))
            : null}
        </div>
        {loading && <LoaderCircle />}
        {/* Visualization */}
        {chartConfig && !loading && (
          <RenderAnimationContainer>
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
          </RenderAnimationContainer>
        )}

        <Stack gap={4}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full h-36 p-2 text-white bg-inherit border rounded-lg border-gray-500"
          />

          <Inline gap={4} justify="between">
            <Text value="Prompts to Get Started" bold color="light" size="lg" />
            <Inline gap={2} justify="right">
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
                variant="solid"
              >
                {loading ? "Processing..." : "Send"}
              </Button>
            </Inline>
          </Inline>

          <div className="flex justify-between">
            <Inline gap={4} justify="left">
              <Button
                variant="outline"
                value={"I'd like to create a quick chart for my uploaded data."}
                onClick={() =>
                  setQuery(
                    `I'd like to create a quick chart for my uploaded data.`
                  )
                }
                className={cn(
                  "p-3 text-white bg-gray-500 border rounded-lg border-gray-700",
                  buttonVariants({
                    disabled: false,
                    loading: false,
                    noPadding: true,
                    variant: "ghost",
                  })
                )}
                label="I'd like to create a quick chart for my uploaded data."
              />
              <Button
                variant="outline"
                value={"I'd like to filter my data then create a chart."}
                onClick={() =>
                  setQuery(`I'd like to filter my data then create a chart.`)
                }
                className={cn(
                  "p-3 text-white bg-gray-500 border rounded-lg border-gray-700",
                  buttonVariants({
                    disabled: false,
                    loading: false,
                    noPadding: true,
                    variant: "ghost",
                  })
                )}
                label="I'd like to filter my data before chart creation."
              />
              <Button
                variant="outline"
                value={"I'd like to join two datasets and create a chart."}
                onClick={() =>
                  setQuery(`I'd like to join two datasets and create a chart.`)
                }
                className={cn(
                  "p-3 text-white bg-gray-500 border rounded-lg border-gray-700",
                  buttonVariants({
                    disabled: false,
                    loading: false,
                    noPadding: true,
                    variant: "ghost",
                  })
                )}
                label="I'd like to join two datasets and create a chart."
              />
            </Inline>
          </div>
        </Stack>
      </div>
    </Stack>
  );
}
