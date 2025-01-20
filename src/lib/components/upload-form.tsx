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
import { getResponseAction } from "@sql-copilot/app/get-llm-response-action";
import { DynamicVisualization } from "./dynamic-visualization";
import { LoaderCircle } from "lucide-react";
import { cn } from "shadcn/lib/utils";
import { Text } from "./text";
import { SectionCard } from "./section-card";

export function VisualizationInterface() {
  const [reactComponent, setReactComponent] = useState<string | null>(null);
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
        const llmCodeResponse = await getResponseAction({
          url: fileUrl,
          story: values.story,
        });

        if (!llmCodeResponse.success) {
          setError("Error getting visualization");
          return;
        }

        // Step 3: Set the visualization
        setReactComponent(llmCodeResponse.llmResponse);
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

        <SectionCard
          title="Visualization"
          className="p-4 bg-gray-50 border-t border-gray-200"
        >
          {loading && (
            <Inline>
              <Text value="Visualizing..." />
              <LoaderCircle className={cn("animate-spin")} />
            </Inline>
          )}
          {reactComponent && !loading && (
            <DynamicVisualization componentCode={reactComponent ?? ""} />
          )}
        </SectionCard>
      </Stack>
    </form>
  );
}
