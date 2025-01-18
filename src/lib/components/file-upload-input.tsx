import { upload } from "@vercel/blob/client";
import { useCallback, useState } from "react";
import { BaseFileInputProps, FileInput } from "./file-input";
import { getUploadAPIPath } from "@sql-copilot/app/api/upload/path";

type FileUploadInputProps = BaseFileInputProps & {
  onChange: (value: { url: string; fileName: string }) => void;
  /**
   * This allows processing of the file before it is uploaded. A `null`
   * value will presponse will prevent the upload.
   */
  onFileChange?: (file: File) => Promise<File | null>;
};

export function FileUploadInput({
  onChange,
  onFileChange,
  ...props
}: FileUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const handleChange = useCallback(
    async (value: { file: File }) => {
      if (onFileChange) {
        const processedFile = await onFileChange(value.file);
        if (!processedFile) {
          return;
        }
        value.file = processedFile;
      }

      setIsUploading(true);
      const blob = await upload(value.file.name, value.file, {
        access: "public",
        handleUploadUrl: getUploadAPIPath(),
        multipart: true,
      });
      setIsUploading(false);
      setFileName(value.file.name);
      onChange({ url: blob.url, fileName: value.file.name });
    },
    [onChange, onFileChange]
  );

  return (
    <FileInput
      {...props}
      useDataURI={false}
      onChange={handleChange}
      fileName={fileName}
      loading={isUploading}
    />
  );
}
