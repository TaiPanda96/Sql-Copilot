'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaperclipIcon } from 'lucide-react'
import { z } from "zod"
import { useForm } from "./use-form"
import { uploadFileAction } from "@sql-copilot/app/actions"
import { Button } from "shadcn/components/ui/button"
import { cn } from "shadcn/lib/utils"
import { useEffect, useState } from 'react'

const FILE_CONFIGS = {
  data: {
    extensions: ['csv', 'xlsx'],
    maxSize: 10 * 1024 * 1024,
    icon: (
      <svg
        className="w-6 h-6 text-excel-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    accept: '.csv,.xlsx',
    label: 'Spreadsheet'
  },
  image: {
    extensions: ['png', 'jpg', 'jpeg', 'heic'],
    maxSize: 5 * 1024 * 1024,
    icon: (
      <svg
        className="w-6 h-6 text-excel-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    accept: '.png,.jpg,.jpeg,.heic',
    label: 'Image'
  }
} as const;

const getFileType = (file: File): 'data' | 'image' | null => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (FILE_CONFIGS.data.extensions.includes(extension as 'csv' | 'xlsx')) return 'data';
  if (FILE_CONFIGS.image.extensions.includes(extension as 'png' | 'jpg' | 'jpeg' | 'heic')) return 'image';
  return null;
};

const formSchema = z.object({
  story: z.string().min(1, "Please provide a story"),
  files: z.array(
    z.custom<File>((file) => {
      if (!(file instanceof File)) return false;
      const fileType = getFileType(file);
      if (!fileType) return false;
      
      const config = FILE_CONFIGS[fileType];
      if (file.size > config.maxSize) return false;
      
      return true;
    }, "Invalid file type or size")
  ).min(1, "Please upload at least one file")
});

type FormValues = z.infer<typeof formSchema>

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const fileType = getFileType(file);
  const config = fileType ? FILE_CONFIGS[fileType] : null;
  const fileSize = (file.size / (1024 * 1024)).toFixed(2);

  useEffect(() => {
    if (fileType === 'image') {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, fileType]);

  if (!config) return null;

  const getThumbnail = () => {
    if (fileType === 'image') {
      return (
        <div className="w-12 h-12 rounded overflow-hidden bg-excel-light border-2 border-excel-gray">
          <img
            src={thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded flex items-center justify-center bg-excel-accent/20 border-2 border-excel-gray">
        {config.icon}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between p-3 bg-excel-light rounded-lg border-2 border-excel-gray hover:border-excel-accent transition-colors">
      <div className="flex items-center space-x-4">
        {getThumbnail()}
        <div className="flex flex-col">
          <span className="text-sm font-excel-bold text-excel-dark truncate max-w-[200px]">
            {file.name}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-excel-dark/70">{config.label}</span>
            <span className="text-xs text-excel-gray">â¢</span>
            <span className="text-xs text-excel-dark/70">{fileSize} MB</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="p-2 text-excel-primary hover:text-excel-dark rounded-lg hover:bg-excel-accent/20 transition-colors"
          title="Download file"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-excel-gray hover:text-red-600 rounded-lg hover:bg-excel-accent/20 transition-colors"
          title="Remove file"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export function UploadForm() {
  const form = useForm<typeof formSchema, void>({
    schema: formSchema,
    initialValues: {
      story: "",
      files: []
    },
    onValidSubmit: async (values) => {
      const formData = new FormData()
      values.files.forEach(file => formData.append("files", file))
      formData.append("story", values.story)
      await uploadFileAction({
        story: values.story,
        files: values.files
      })
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      form.setValue("files", form.values.files)
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFiles = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(newFiles);
    form.setValue("files", [...form.values.files, ...validFiles])
  };

  const validateFiles = (files: File[]) => {
    return files.filter(file => {
      const fileType = getFileType(file);
      if (!fileType) {
        alert(`File "${file.name}" has an unsupported format`);
        return false;
      }

      const config = FILE_CONFIGS[fileType];
      if (file.size > config.maxSize) {
        alert(`File "${file.name}" is too large. Maximum size for ${config.label} is ${config.maxSize / (1024 * 1024)}MB`);
        return false;
      }

      return true;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = validateFiles(newFiles);
      form.setValue("files", [...form.values.files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...form.values.files];
    newFiles.splice(index, 1);
    form.setValue("files", newFiles);
  };

  return (
    <form onSubmit={form.handleSubmit} className="p-6 font-excel">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="story" 
            className="text-base font-excel-bold text-excel-dark"
          >
            What's the TL;DR of your data and who's your audience?
          </Label>
          <Input
            id="story"
            value={form.values.story}
            onChange={(e) => form.setValue("story", e.target.value)}
            placeholder="I want to report Q3 sales to my CEO"
            className="h-[52px] px-4 bg-white border-2 border-excel-gray focus:border-excel-primary focus:ring-0 text-excel-dark placeholder:text-excel-gray/70 rounded-lg"
          />
          {form.errors.story && (
            <p className="text-sm text-red-500 font-excel-bold">{form.errors.story}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-excel-bold text-excel-dark">
            Upload your data
          </Label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed border-excel-accent rounded-lg py-12 px-6 text-center transition-colors bg-excel-light/50",
              form.values.files.length > 0 && "border-excel-primary bg-excel-accent/20"
            )}
          >
            <Input
              type="file"
              multiple
              accept={Object.values(FILE_CONFIGS).map(config => config.accept).join(',')}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Label 
              htmlFor="file-upload" 
              className="cursor-pointer text-excel-dark flex flex-col items-center"
            >
              <PaperclipIcon className="h-6 w-6 mb-2 text-excel-primary" />
              <p className="font-excel-bold">Upload raw data and/or images</p>
              <div className="text-sm text-excel-dark/70 mt-1 space-y-1">
                <p>Data files: {FILE_CONFIGS.data.extensions.join(', ').toUpperCase()} (max {FILE_CONFIGS.data.maxSize / (1024 * 1024)}MB)</p>
                <p>Image files: {FILE_CONFIGS.image.extensions.join(', ').toUpperCase()} (max {FILE_CONFIGS.image.maxSize / (1024 * 1024)}MB)</p>
              </div>
            </Label>
          </div>

          {form.values.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {form.values.files.map((file, index) => (
                <FilePreview
                  key={index}
                  file={file}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-[52px] bg-excel-primary hover:bg-excel-dark text-white font-excel-bold text-base rounded-lg transition-colors duration-200"
          disabled={form.loading}
        >
          {form.loading ? "Processing..." : "Generate Visualization"}
        </Button>
      </div>
    </form>
  );
}