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

const FILE_CONFIGS = {
  data: {
    extensions: ["csv", "json", "xls", "xlsx"],
    accept: ".csv,.json,.xls,.xlsx",
    maxSize: 10 * 1024 * 1024,
    label: "Data",
    files: [] as File[],
  },
  image: {
    extensions: ["jpg", "jpeg", "png", "gif"],
    accept: ".jpg,.jpeg,.png,.gif",
    maxSize: 5 * 1024 * 1024,
    label: "Image",
    files: [] as File[],
  },
};

function getFileType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  if (FILE_CONFIGS.data.extensions.includes(extension)) {
    return "data";
  }

  if (FILE_CONFIGS.image.extensions.includes(extension)) {
    return "image";
  }

  return null;
}

export function UploadForm() {
  const form = useForm({
    schema: uploadFileSchema,
    initialValues: {
      story: "",
      url: "",
      fileName: "",
    },
    onValidSubmit: uploadFileAction,
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

        {/* File Preview Section */}

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
      </Stack>
    </form>
  );
}

export interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  children: React.ReactNode;
}
