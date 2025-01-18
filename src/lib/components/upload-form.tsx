"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "./use-form";
import {
  uploadFileAction,
  uploadFileSchema,
} from "@sql-copilot/app/upload-file-action";
import { Button } from "shadcn/components/ui/button";
import { FileUploadInput } from "./file-upload-input";

export function UploadForm() {
  const form = useForm<typeof uploadFileSchema, void>({
    schema: uploadFileSchema,
    initialValues: {
      story: "",
      url: "",
      fileName: "",
    },
    onValidSubmit: async (uploadFileInput) => {
      try {
        await uploadFileAction(uploadFileInput);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      className="space-y-6 bg-white rounded-lg p-6 shadow-sm"
    >
      <div className="space-y-2">
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
      </div>
      <div className="space-y-2">
        <FileUploadInput
          onChange={({ url, fileName }) => {
            form.setValue("url", url);
            form.setValue("fileName", fileName);
          }}
        />
      </div>
      <Button
        type="submit"
        className="w-full h-[52px] bg-[#818CF8] hover:bg-[#6366F1] text-white font-medium text-base rounded-lg"
        disabled={form.loading}
      >
        {form.loading ? "Processing..." : "Generate Visualization"}
      </Button>
    </form>
  );
}
