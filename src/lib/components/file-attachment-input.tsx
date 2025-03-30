"use client";

import { upload } from "@vercel/blob/client";
import React, { useState } from "react";
import { getUploadAPIPath } from "@sql-copilot/app/api/upload/path";
import { Button } from "./button";
import { cn } from "shadcn/lib/utils";
import { Trash2Icon, FileIcon } from "lucide-react";
import { Stack } from "./stack";
import { Inline } from "./inline";
import { Text } from "./text";
import { RenderAnimationContainer } from "./render-animation-container";
import { useDropZone } from "../hooks/use-drop-zone";
import { LoaderCircle } from "./loading-circle";

type FileAttachmentInputProps = {
  className?: string;
  onChange: (
    files: { url: string; fileName: string; fileSize: number }[]
  ) => void;
};

export function FileAttachmentInput({
  className,
  onChange,
}: FileAttachmentInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<
    { url: string; fileName: string; fileSize: number }[]
  >([]);

  const handleFilesUpload = async (files: File[]) => {
    setIsUploading(true);
    const uploadedFiles: { url: string; fileName: string; fileSize: number }[] =
      [];

    for (const file of files) {
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: getUploadAPIPath(),
          multipart: true,
        });

        uploadedFiles.push({
          url: blob.url,
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }

    setAttachments((prev) => [...prev, ...uploadedFiles]);
    onChange([...attachments, ...uploadedFiles]);
    setIsUploading(false);
  };

  const {
    dropZoneRef,
    fileInputRef,
    isDragging,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  } = useDropZone({
    onDrop: handleFilesUpload,
    multiple: true,
    accept: [".csv", ".json", "image/png", "image/jpeg", "application/pdf"],
  });

  const handleRemoveFile = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    onChange(newAttachments);
  };

  // If the user clicks on the drop zone, open the file input dialog.
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Stack gap={2}>
      {/* Drag & Drop Area */}
      <div
        ref={dropZoneRef}
        onDrag={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "border border-gray-500 p-4 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm",
          isDragging && "border-blue-500",
          className
        )}
      >
        Drag & drop files here, or click to browse.
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {isUploading && <LoaderCircle />}

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <RenderAnimationContainer>
          {attachments.map(({ fileName }, index) => (
            <Inline
              key={index}
              gap={2}
              justify="between"
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <Inline gap={4} justify="left">
                <FileIcon className="text-white" />
                <Text value={fileName} color="light" />
              </Inline>
              <Button
                onClick={() => handleRemoveFile(index)}
                variant="solid"
                IconRight={Trash2Icon}
                className="p-2"
              />
            </Inline>
          ))}
        </RenderAnimationContainer>
      )}
    </Stack>
  );
}
