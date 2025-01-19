"use client";

import { useForm } from "./use-form";
import { uploadFileAction } from "@sql-copilot/app/upload-file-action";
import { FileUploadInput } from "./file-upload-input";
import { Stack } from "./stack";
import { Inline } from "./inline";
import { Button } from "./button";
import { Upload } from "lucide-react";
import { TextInput } from "./text-input";
import { useRouter } from "next/navigation";
import { uploadFileSchema } from "@sql-copilot/app/upload-file-input";

export function UploadForm() {
  const router = useRouter();
  const form = useForm({
    schema: uploadFileSchema,
    initialValues: {
      story: "",
      url: "",
      fileName: "",
    },
    onValidSubmit: uploadFileAction,
    onSuccess(data) {
      router.push("/");
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Stack gap={6} className="max-w-lg mx-auto">
        <FileUploadInput
          onChange={({ url }) => {
            form.setValue("url", url);
          }}
          error={form.errors.url}
        />
        <TextInput
          value={form.values.story}
          onChange={(story) => {
            form.setValue("story", story);
          }}
          error={form.errors.story}
        />
        <Inline align="center">
          <Button
            type="submit"
            label="Upload"
            loading={form.loading}
            disabled={!form.isValid}
            variant="ghost"
            IconRight={Upload}
            iconClassName="
              text-gray-500
              hover:text-gray-900
              transition
            "
          />
        </Inline>
      </Stack>
    </form>
  );
}
