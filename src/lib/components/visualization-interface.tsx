"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "./use-form";
import { uploadFileSchema } from "@sql-copilot/app/upload-file-input";
import { uploadFileAction } from "@sql-copilot/app/upload-file-action";
import { FileUploadInput } from "./file-upload-input";
import { Inline } from "./inline";
import { Stack } from "./stack";
import { Button } from "./button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "shadcn/lib/utils";
import { Text } from "./text";
import { ChartType, DynamicChart } from "./dynamic-chart";
import { getResponseAction } from "@sql-copilot/app/get-llm-response-action";
import { camelCase } from "lodash";

export default function VisualizationInterface() {
  const [config, setconfig] = useState<{
    type: "BarChart" | "LineChart" | "PieChart";
    title: string;
    data: Array<{ [key: string]: any }>;
    xKey: string;
    yKey: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    schema: uploadFileSchema,
    initialValues: {
      story: "",
      url: "",
      fileName: "",
    },
    onValidSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Upload the file
        const { success, fileUrl } = await uploadFileAction(values);

        if (!success) {
          setError("Error uploading file");
          return;
        }

        // Step 2: Get the visualization
        const serverconfig = await getResponseAction({
          url: fileUrl,
          story: values.story,
        });

        if (!serverconfig.success) {
          setError("Error getting visualization");
          return;
        }
        setconfig(serverconfig.chartConfig);
        setLoading(false);
      } catch (error) {
        return { success: false, fileUrl: "" };
      }
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-6 bg-white rounded-lg p-6 shadow-sm"
    >
      {/* Story Input Section */}
      <Stack gap={6}>
        <Label htmlFor="story" className="text-base font-normal text-gray-900">
          What's the TL;DR of your data and who's your audience?
        </Label>
        <Input
          id="story"
          value={form.values.story}
          onChange={(e) => form.setValue("story", e.target.value)}
          placeholder="I want to report Q3 sales to my CEO"
          className="h-[52px] px-4 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg"
        />
        {form.errors.story && (
          <p className="text-sm text-red-500">{form.errors.story}</p>
        )}

        <FileUploadInput
          error={form.errors.url}
          onChange={({ url }) => {
            form.setValue("url", url);
          }}
        />

        <Inline>
          <Button
            type="submit"
            label="Visualize"
            disabled={form.loading}
            variant="input"
            className="border-gray-200 text-gray-900 "
          >
            {form.loading ? "Processing..." : "Visualize"}
          </Button>
        </Inline>

        {error && <p className="text-red-500">{error}</p>}

        {form.errors.url && (
          <p className="text-sm text-red-500">{form.errors.url}</p>
        )}

        {loading && (
          <Inline>
            <Text value="Visualizing..." />
            <LoaderCircle className={cn("animate-spin")} />
          </Inline>
        )}

        {config && !loading && (
          <DynamicChart
            chartConfig={{
              ...config,
              type: config.type as ChartType,
              data: config.data.map((item) => {
                const newItem: { [key: string]: any } = {};
                Object.keys(item).forEach((key) => {
                  newItem[camelCase(key)] = item[key];
                });
                return newItem;
              }),
              xKey: camelCase(config.xKey),
              yKey: camelCase(config.yKey),
            }}
          />
        )}
      </Stack>
    </form>
  );
}

interface LLMconfigChatProps {
  config: string;
}

/**
 * TODO: Enable Additional Chat Features With a Form Input to re-run the LLM
 * This is currently read-only and does not allow users to re-run the LLM with new inputs.
 */
export function LLMconfigChat({ config }: LLMconfigChatProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">AI config</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto max-h-96">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
          {config || "No config available."}
        </p>
      </div>
    </div>
  );
}
