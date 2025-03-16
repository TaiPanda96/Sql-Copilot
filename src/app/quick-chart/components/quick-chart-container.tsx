"use client";

import { useState } from "react";
import { Button, buttonVariants } from "../../../lib/components/button";
import { SendIcon } from "lucide-react";
import { Messages, Threads } from "@sql-copilot/gen/prisma";
import { Stack } from "../../../lib/components/stack";
import { Inline } from "../../../lib/components/inline";
import AttachmentButton from "../../../lib/components/attachment-button";
import { cn } from "shadcn/lib/utils";
import { quickChartUploadAction } from "@sql-copilot/app/quick-chart/actions/quick-chart-upload-action";
import { Text } from "../../../lib/components/text";
import { FileAttachmentInput } from "../../../lib/components/file-attachment-input";
import { SelectInput } from "../../../lib/components/select-input";
import { QuickChartVisualization } from "./quick-chart-visualization";
import { TextInput } from "@sql-copilot/lib/components/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { RenderAnimationContainer } from "@sql-copilot/lib/components/render-animation-container";

export default function QuickChartContainer({
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
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<
    {
      url: string;
      fileName: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<{
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<{ [key: string]: any }>;
    xKey: string;
    yKey: string;
  } | null>(null);
  const [thread, setThread] = useState<
    | (Threads & {
        messages: Messages[];
      })
    | null
  >(null);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  /**
   * This function handles the form submission.
   * It posts the user query to the server and updates the state.
   */
  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    if (!user) {
      setLoading(false);
      setError("User not found.");
      return;
    }
    try {
      const response = await quickChartUploadAction({
        query,
        attachments,
        threadId: thread?.id,
        userEmail: user.email || "",
      });

      if (!response.success) {
        setLoading(false);
        setError(`${response.message}`);
        return;
      }
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

  /**
   * Hook to handle file uploads.
   * This hook sets the attachments state with the file URL and name.
   */
  function handleUploadUrl({
    url,
    fileName,
  }: {
    url: string;
    fileName: string;
  }) {
    setAttachments([...attachments, { url, fileName }]);
  }

  return (
    <Stack gap={8}>
      <Stack gap={4} align="center">
        <h1 className="text-3xl text-white">Quick Chart</h1>
        <Text
          value="Welcome to Quick Chart! Ask a question about your data to get started."
          color="light"
        />
      </Stack>
      <Inline gap={4} align="top" justify="between">
        <QuickChartVisualization
          chartConfig={chartConfig}
          loading={loading}
          messages={messages}
          error={error}
        />
        <Stack gap={0} className="flex-grow">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="h-48 p-4 text-white rounded-lg bg-[#525252] shadow-lg"
          />
          <Stack gap={0} className="shadow-md rounded-md bg-[#3b3b3b] p-1">
            <Inline gap={2} justify="left">
              <AttachmentButton
                onAttachment={handleUploadUrl}
                className={cn(
                  "p-2",
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
                className={
                  (cn(
                    buttonVariants({
                      disabled: loading,
                      loading,
                      noPadding: true,
                      variant: "solid",
                    })
                  ),
                  "size-2")
                }
              >
                {loading ? "Processing..." : "Send"}
              </Button>
            </Inline>
          </Stack>
        </Stack>
        <Stack
          gap={4}
          className="bg-[#525252] rounded-lg shadow-sm flex-grow p-3"
        >
          <Inline gap={4} justify="between">
            <Text value="Project Files" bold color="light" size="lg" />
          </Inline>

          <FileAttachmentInput
            onChange={setAttachments}
            className="bg-[#525252]"
          />

          <Inline gap={2}>
            <Text value="More Chart Options" className="text-white text-sm" />
            <Checkbox
              checked={showAdditionalOptions}
              onCheckedChange={() => setShowAdditionalOptions((prev) => !prev)}
              className={cn("p-2", "text-white", "rounded-md")}
            />
          </Inline>

          {showAdditionalOptions && (
            <RenderAnimationContainer>
              <SelectInput
                label={"Chart Type"}
                onChange={(chartTypeOption) => {
                  if (chartConfig) {
                    setChartConfig({
                      ...chartConfig,
                      type: chartTypeOption.target.value as
                        | "BarChart"
                        | "LineChart"
                        | "PieChart",
                    });
                  }
                }}
                className="bg-[#525252] border-gray-500 p-2"
                options={[
                  { value: "BarChart", label: "Bar Chart" },
                  { value: "LineChart", label: "Line Chart" },
                  { value: "PieChart", label: "Pie Chart" },
                ]}
              />
              <TextInput
                label="Chart Title"
                className="border border-gray-500 p-3 overflow-x-auto rounded-lg cursor-pointer bg-inherit hover:bg-gray-700 text-gray-300 text-sm"
                value={chartConfig?.title}
                onChange={(value) => {
                  if (chartConfig) {
                    setChartConfig({
                      ...chartConfig,
                      title: value,
                    });
                  }
                }}
              />
              <TextInput
                label="X Axis"
                className="border border-gray-500 p-3 overflow-x-auto rounded-lg cursor-pointer bg-inherit hover:bg-gray-700 text-gray-300 text-sm"
                value={chartConfig?.xKey}
                onChange={(value) => {
                  if (chartConfig) {
                    setChartConfig({
                      ...chartConfig,
                      xKey: value,
                    });
                  }
                }}
              />
              <TextInput
                label="Y Axis"
                className="border border-gray-500 p-3 overflow-x-auto rounded-lg cursor-pointer bg-inherit hover:bg-gray-700 text-gray-300 text-sm"
                value={chartConfig?.yKey}
                onChange={(value) => {
                  if (chartConfig) {
                    setChartConfig({
                      ...chartConfig,
                      yKey: value,
                    });
                  }
                }}
              />
            </RenderAnimationContainer>
          )}
        </Stack>
      </Inline>
    </Stack>
  );
}
