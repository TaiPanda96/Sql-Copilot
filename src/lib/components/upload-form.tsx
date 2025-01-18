"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaperclipIcon } from 'lucide-react'
import { z } from "zod"
import { useForm } from "./use-form"
import { uploadFileAction } from "@sql-copilot/app/actions"
import { Button } from "shadcn/components/ui/button"
import { cn } from "shadcn/lib/utils"

const formSchema = z.object({
  story: z.string().min(1, "Please provide a story"),
  files: z.array(z.instanceof(File)).min(1, "Please upload at least one file")
})

type FormValues = z.infer<typeof formSchema>

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
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      form.setValue("files", form.values.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFiles = Array.from(e.dataTransfer.files)
    form.setValue("files", [...form.values.files, ...newFiles])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      form.setValue("files", [...form.values.files, ...newFiles])
    }
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-2">
        <Label 
          htmlFor="story" 
          className="text-base font-normal text-gray-900"
        >
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
        <Label className="text-base font-normal text-gray-900">
          Upload your data
        </Label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border border-dashed border-gray-300 rounded-lg py-12 px-6 text-center transition-colors",
            form.values.files.length > 0 && "border-blue-500 bg-blue-50"
          )}
        >
          <Input
            type="file"
            multiple
            accept=".csv,.xlsx,.png,.jpg,.jpeg,.heic"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <Label 
            htmlFor="file-upload" 
            className="cursor-pointer text-gray-600 flex flex-col items-center"
          >
            <PaperclipIcon className="h-6 w-6 mb-2 text-gray-400" />
            <p>Upload data and images</p>
            <p className="text-sm text-gray-500 mt-1">
              Support for CSV, Excel, PNG, JPG, JPEG, and HEIC
            </p>
          </Label>
        </div>
        {form.errors.files && (
          <p className="text-sm text-red-500">{form.errors.files}</p>
        )}
        {form.values.files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {form.values.files.length} file(s) selected
            </p>
          </div>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full h-[52px] bg-[#818CF8] hover:bg-[#6366F1] text-white font-medium text-base rounded-lg"
        disabled={form.loading}
      >
        {form.loading ? "Processing..." : "Generate Visualization"}
      </Button>
    </form>
  )
}

