"use client"

import type React from "react"

import { ExcelToolbar } from "@/components/excel-toolbar"
import { QuickChartsLogo } from "@/components/quick-charts-logo"
import { SpreadsheetGrid } from "@/components/spreadsheet-grid"
import { StatusBar } from "@/components/status-bar"
import { Input } from "@/components/ui/input"
import { Cross2Icon } from "@radix-ui/react-icons"
import { useSheets } from "contexts/sheet-context"
import { File, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const { activeSheet, updateSheetWizardState, navigateToWizardStep } = useSheets()

  const [story, setStory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load wizard state from active sheet
  useEffect(() => {
    if (activeSheet && !isInitialized) {
      const { story: sheetStory, file: sheetFile } = activeSheet.wizardState
      if (sheetStory) setStory(sheetStory)
      if (sheetFile) setFile(sheetFile)
      setIsInitialized(true)
    }
  }, [activeSheet, isInitialized])

  // Reset state when active sheet changes
  useEffect(() => {
    setIsInitialized(false)
    setStory("")
    setFile(null)
  }, [activeSheet?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0]
      setFile(newFile)
      if (activeSheet) {
        updateSheetWizardState(activeSheet.id, { file: newFile })
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

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (activeSheet) {
      updateSheetWizardState(activeSheet.id, { file: null })
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
      })
      navigateToWizardStep("questions")
    }
  }

  return (
    <main className="min-h-screen win98-spreadsheet-bg pb-6">
      <ExcelToolbar />

      <SpreadsheetGrid rows={30} cols={16}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center mb-8 mt-16">
            <QuickChartsLogo size="large" className="mb-4" />
            <h1 className="text-2xl font-bold text-[#000080]">Quick Charts</h1>
            <p className="text-sm text-gray-600">Version 1.0</p>
          </div>

          <div className="win98-window max-w-3xl mx-auto">
            <div className="win98-title-bar bg-[#000080] text-white">Let AI build you the perfect chart</div>
            <div className="p-4 bg-[#c0c0c0]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="story" className="block font-bold text-black">
                    What story do you want to tell and who is your audience?
                  </label>
                  <textarea
                    id="story"
                    placeholder="E.g., I want to show the quarterly sales growth to my executive team..."
                    className="win98-input h-32 w-full bg-white"
                    value={story}
                    onChange={handleStoryChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="file" className="block font-bold text-black">
                    Upload data (optional)
                  </label>
                  {!file ? (
                    <div
                      className="win98-input flex items-center justify-center h-32 border-dashed cursor-pointer bg-white"
                      onClick={handleUploadClick}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-[#000080]" />
                        <p className="mt-2 text-sm text-gray-600">
                          Drag and drop your CSV or Excel file, or click to browse
                        </p>
                        <Input
                          ref={fileInputRef}
                          id="file"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="win98-input p-4 flex items-center justify-between bg-white">
                      <div className="flex items-center">
                        <File className="h-8 w-8 text-[#000080] mr-3" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button type="button" onClick={handleRemoveFile} className="p-1 hover:bg-[#d4d0c8] rounded-full">
                        <Cross2Icon className="h-5 w-5 text-gray-600" />
                      </button>
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
    </main>
  )
}

