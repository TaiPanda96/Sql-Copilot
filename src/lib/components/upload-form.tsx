"use client";

import { useForm } from "./use-form";
import {
  uploadFileAction,
  uploadFileSchema,
} from "@sql-copilot/app/upload-file-action";
import { Button } from "shadcn/components/ui/button";
import { FileUploadInput } from "./file-upload-input";
import { Stack } from "./stack";
import { Inline } from "./inline";
import { cn } from "shadcn/lib/utils";
import { Input } from "@/components/ui/input";

export function UploadForm() {
  const form = useForm<typeof uploadFileSchema, void>({
    schema: uploadFileSchema,
    initialValues: {
      story: "",
      url: "",
      fileName: "",
    },
    onValidSubmit: async (values) => {
      await uploadFileAction(values);
    },
  });

  return (
    <Stack gap={6}>
      <form onSubmit={form.handleSubmit}>
        <Stack gap={6}>
          <Input
            id="story"
            value={form.values.story}
            onChange={(e) => form.setValue("story", e.target.value)}
            placeholder="I want to report Q3 sales to my CEO"
            className="h-[52px] px-4 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-lg"
          />
          <div
            className={cn(
              "border border-gray-250 rounded-lg py-12 px-6 text-center transition-colors"
            )}
          >
            <FileUploadInput
              error={form.errors.url}
              onChange={({ url }) => {
                form.setValue("url", url);
              }}
            />
          </div>
          <Inline>
            <Button type="submit" />
          </Inline>
        </Stack>
      </form>
    </Stack>
  );
}
