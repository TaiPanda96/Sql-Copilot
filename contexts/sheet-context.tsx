"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { ChartConfig, QuestionStep } from "@/types/chart"

export interface SheetWizardState {
  // Landing page state
  story?: string
  file?: File | null

  // Questions page state
  currentStep?: QuestionStep
  storyDetails?: Record<string, string>
  isLoading?: boolean

  // Result page state
  chartConfig?: ChartConfig | null

  // Wizard progress
  wizardStep?: "landing" | "questions" | "result"

  // Cell data
  cellData?: Record<string, { value: string; formula?: string }>
}

export interface Sheet {
  id: string
  name: string
  active: boolean
  wizardState: SheetWizardState
}

interface SheetContextType {
  sheets: Sheet[]
  activeSheet: Sheet | null
  addSheet: (name?: string) => void
  activateSheet: (id: string) => void
  renameSheet: (id: string, newName: string) => void
  removeSheet: (id: string) => void
  updateSheetWizardState: (id: string, state: Partial<SheetWizardState>) => void
  navigateToWizardStep: (step: "landing" | "questions" | "result") => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null)

  // Initialize with a default sheet
  useEffect(() => {
    if (sheets.length === 0) {
      const defaultSheet: Sheet = {
        id: "1",
        name: "Sheet1",
        active: true,
        wizardState: {
          wizardStep: "landing",
        },
      }
      setSheets([defaultSheet])
      setActiveSheet(defaultSheet)
    }
  }, [sheets.length])

  // Navigate to the correct page based on the active sheet's wizard step
  useEffect(() => {
    if (activeSheet?.wizardState.wizardStep) {
      const currentPath = pathname || "/"
      const targetPath = getPathForWizardStep(activeSheet.wizardState.wizardStep)

      // Only navigate if we're on a different page
      if (currentPath !== targetPath) {
        router.push(targetPath)
      }
    }
  }, [activeSheet, pathname, router])

  const getPathForWizardStep = (step: "landing" | "questions" | "result"): string => {
    switch (step) {
      case "landing":
        return "/"
      case "questions":
        return "/questions"
      case "result":
        return "/result"
      default:
        return "/"
    }
  }

  const addSheet = (name?: string) => {
    const newId = (sheets.length + 1).toString()
    const newSheet: Sheet = {
      id: newId,
      name: name || `Sheet${newId}`,
      active: false,
      wizardState: {
        wizardStep: "landing",
      },
    }

    // Deactivate all current sheets
    const updatedSheets = sheets.map((sheet) => ({
      ...sheet,
      active: false,
    }))

    // Add and activate the new sheet
    setSheets([...updatedSheets, { ...newSheet, active: true }])
    setActiveSheet({ ...newSheet, active: true })
  }

  const activateSheet = (id: string) => {
    const updatedSheets = sheets.map((sheet) => ({
      ...sheet,
      active: sheet.id === id,
    }))

    const newActiveSheet = updatedSheets.find((sheet) => sheet.id === id)

    setSheets(updatedSheets)
    setActiveSheet(newActiveSheet || null)
  }

  const renameSheet = (id: string, newName: string) => {
    const updatedSheets = sheets.map((sheet) => (sheet.id === id ? { ...sheet, name: newName } : sheet))

    setSheets(updatedSheets)
    if (activeSheet?.id === id) {
      setActiveSheet({ ...activeSheet, name: newName })
    }
  }

  const removeSheet = (id: string) => {
    // Don't remove if it's the only sheet
    if (sheets.length <= 1) return

    const updatedSheets = sheets.filter((sheet) => sheet.id !== id)

    // If we're removing the active sheet, activate the first one
    if (activeSheet?.id === id) {
      const newActiveSheet = updatedSheets[0]
      updatedSheets[0] = { ...newActiveSheet, active: true }
      setActiveSheet(updatedSheets[0])
    }

    setSheets(updatedSheets)
  }

  const updateSheetWizardState = (id: string, state: Partial<SheetWizardState>) => {
    const sheet = sheets.find((s) => s.id === id)
    if (!sheet) return

    const updatedSheets = sheets.map((sheet) =>
      sheet.id === id
        ? {
            ...sheet,
            wizardState: { ...sheet.wizardState, ...state },
          }
        : sheet,
    )

    setSheets(updatedSheets)
    if (activeSheet?.id === id) {
      setActiveSheet({
        ...activeSheet,
        wizardState: { ...activeSheet.wizardState, ...state },
      })
    }
  }

  const navigateToWizardStep = (step: "landing" | "questions" | "result") => {
    if (!activeSheet) return

    updateSheetWizardState(activeSheet.id, { wizardStep: step })
    router.push(getPathForWizardStep(step))
  }

  return (
    <SheetContext.Provider
      value={{
        sheets,
        activeSheet,
        addSheet,
        activateSheet,
        renameSheet,
        removeSheet,
        updateSheetWizardState,
        navigateToWizardStep,
      }}
    >
      {children}
    </SheetContext.Provider>
  )
}

export function useSheets() {
  const context = useContext(SheetContext)
  if (context === undefined) {
    throw new Error("useSheets must be used within a SheetProvider")
  }
  return context
}

