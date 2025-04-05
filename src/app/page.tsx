"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ExcelToolbar } from "@/components/excel-toolbar"
import { StatusBar } from "@/components/status-bar"
import { SpreadsheetGrid } from "@/components/spreadsheet-grid"
import { Input } from "@/components/ui/input"
import { Upload, File } from "lucide-react"
import { useSheets } from "@/contexts/sheet-context"
import { Excel97Header } from "@/components/excel97-header"
import { Cross2Icon } from "@radix-ui/react-icons"

export default function Home() {
  const { activeSheet, updateSheetWizardState, navigateToWizardStep } = useSheets()

  const [story, setStory] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load wizard state from active sheet
  useEffect(() => {
    if (activeSheet && !isInitialized) {
      const { story: sheetStory, files: sheetFiles } = activeSheet.wizardState
      if (sheetStory) setStory(sheetStory)
      if (sheetFiles) setFiles(sheetFiles)
      setIsInitialized(true)
    }
  }, [activeSheet, isInitialized])

  // Reset state when active sheet changes
  useEffect(() => {
    setIsInitialized(false)
    setStory("")
    setFiles([])
  }, [activeSheet?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      // Enforce maximum of 5 files
      const combinedFiles = [...files, ...newFiles].slice(0, 5)
      setFiles(combinedFiles)
      if (activeSheet) {
        updateSheetWizardState(activeSheet.id, { files: combinedFiles })
      }
    }
  }

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value
    setStory(newStory)
    if (activeSheet) {
      updateSheetWizardState(activeSheet.id, { story: newStory })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove)
    setFiles(updatedFiles)
    if (activeSheet) {
      updateSheetWizardState(activeSheet.id, { files: updatedFiles })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeSheet) {
      // Update the wizard step and navigate to questions
      updateSheetWizardState(activeSheet.id, {
        wizardStep: "questions",
        currentStep: "initial",
        storyDetails: {},
        files: files,
      })
      navigateToWizardStep("questions")
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Excel97Header />
      <ExcelToolbar />

      <SpreadsheetGrid>
        <div className="flex flex-col items-center justify-center">
          <div className="win98-window max-w-xl mx-auto">
            <div className="win98-title-bar bg-[#000080] text-white">Let AI build you the perfect chart</div>
            <div className="p-4 bg-[#c0c0c0]">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="story" className="block font-bold text-black">
                    What story do you want to tell and who is your audience?
                  </label>
                  <textarea
                    id="story"
                    placeholder="E.g., I want to show the quarterly sales growth to my executive team..."
                    className="win98-input w-full bg-white fixed-height-textarea"
                    value={story}
                    onChange={handleStoryChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="file" className="block font-bold text-black">
                    Upload data
                  </label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                  {files.length === 0 ? (
                    <div
                      className="win98-input flex items-center justify-center h-24 border-dashed cursor-pointer bg-white"
                      onClick={handleUploadClick}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-[#000080]" />
                        <p className="mt-2 text-sm text-gray-600">
                          Drag and drop up to 5 files (CSV, Excel, JPG, or PNG), or click to browse
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="win98-input p-3 flex flex-col space-y-2 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{files.length} of 5 files selected</span>
                        {files.length < 5 && (
                          <button type="button" onClick={handleUploadClick} className="win98-button text-xs py-1 px-2">
                            Add More
                          </button>
                        )}
                      </div>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-[#000080] mr-2" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file)}
                            className="p-1 hover:bg-[#d4d0c8] rounded-full"
                          >
                            <Cross2Icon className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="win98-button">
                    Generate Chart
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </SpreadsheetGrid>

      <StatusBar />
    </div>
  )
}

