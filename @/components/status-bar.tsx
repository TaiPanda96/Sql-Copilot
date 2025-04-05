"use client"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { SheetTabs } from "./sheet-tabs"
import { useSheets } from "@/contexts/sheet-context"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"

export function StatusBar() {
  const { sheets, activeSheet, activateSheet } = useSheets()

  const navigateToFirstSheet = () => {
    if (sheets.length > 0) {
      activateSheet(sheets[0].id)
    }
  }

  const navigateToLastSheet = () => {
    if (sheets.length > 0) {
      activateSheet(sheets[sheets.length - 1].id)
    }
  }

  const navigateToPreviousSheet = () => {
    if (!activeSheet) return

    const activeIndex = sheets.findIndex((sheet) => sheet.id === activeSheet.id)
    if (activeIndex > 0) {
      activateSheet(sheets[activeIndex - 1].id)
    }
  }

  const navigateToNextSheet = () => {
    if (!activeSheet) return

    const activeIndex = sheets.findIndex((sheet) => sheet.id === activeSheet.id)
    if (activeIndex < sheets.length - 1) {
      activateSheet(sheets[activeIndex + 1].id)
    }
  }

  return (
    <div className="w-full bg-[#c0c0c0] border-t border-[#808080] flex flex-col">
      {/* Sheet tabs row */}
      <div className="flex items-center h-6 border-b border-[#808080]">
        <div className="flex items-center h-full">
          {/* Navigation buttons */}
          <button className="win98-toolbar-button h-full px-1" title="Start" onClick={navigateToFirstSheet}>
            <ChevronsLeft className="h-3 w-3" />
          </button>
          <button className="win98-toolbar-button h-full px-1" title="Previous Sheet" onClick={navigateToPreviousSheet}>
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
          <button className="win98-toolbar-button h-full px-1" title="Next Sheet" onClick={navigateToNextSheet}>
            <ChevronRightIcon className="h-3 w-3" />
          </button>
          <button className="win98-toolbar-button h-full px-1" title="End" onClick={navigateToLastSheet}>
            <ChevronsRight className="h-3 w-3" />
          </button>
        </div>

        {/* Sheet tabs */}
        <SheetTabs />
      </div>

      {/* Status row */}
      <div className="flex items-center h-5 px-2">
        <div className="win98-button mr-2 py-0 px-2 text-xs h-4 flex items-center">Start</div>
        <div className="win98-separator mx-2 h-3"></div>
        <div className="text-xs">Ready</div>
      </div>
    </div>
  )
}

