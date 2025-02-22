"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { getUploadAPIPath } from "@sql-copilot/app/api/upload/path";
import { Button } from "./button";
import { cn } from "shadcn/lib/utils";
import { Paperclip } from "lucide-react";

type AttachmentButtonProps = {
  onAttachment: (attachment: { url: string; fileName: string }) => void;
  /**
   * Optional callback to process the file before upload.
   * Return null to abort the upload.
   */
  onFileChange?: (file: File) => Promise<File | null>;
  /**
   * Optional class names to override the default styling.
   */
  className?: string;
};

export default function AttachmentButton({
  onAttachment,
  onFileChange,
  className,
}: AttachmentButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Optionally process the file before upload.
      let processedFile: File | null = file;
      if (onFileChange) {
        processedFile = await onFileChange(file);
        if (!processedFile) return;
      }

      setIsUploading(true);
      try {
        const blob = await upload(processedFile.name, processedFile, {
          access: "public",
          handleUploadUrl: getUploadAPIPath(),
          multipart: true,
        });
        onAttachment({ url: blob.url, fileName: processedFile.name });
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setIsUploading(false);
        // Reset file input so that the same file can be uploaded again if needed.
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onAttachment, onFileChange]
  );

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        className={cn(
          "border border-gray-300 rounded-md p-2 text-sm",
          isUploading ? "cursor-not-allowed" : "cursor-pointer",
          className
        )}
        IconRight={Paperclip}
      >
        {isUploading ? "Uploading..." : "Attach File"}
      </Button>
    </>
  );
}
