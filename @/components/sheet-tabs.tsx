"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { Sheet, useSheets } from "contexts/sheet-context"
import type React from "react"
import { useRef, useState } from "react"

export function SheetTabs() {
  const { sheets, activeSheet, addSheet, activateSheet, renameSheet, removeSheet } = useSheets()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingId(sheet.id)
    setEditingName(sheet.name)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingId && editingName.trim()) {
        renameSheet(editingId, editingName.trim())
        setEditingId(null)
      }
    } else if (e.key === "Escape") {
      setEditingId(null)
    }
  }

  const handleBlur = () => {
    if (editingId && editingName.trim()) {
      renameSheet(editingId, editingName.trim())
    }
    setEditingId(null)
  }

  const handleRightClick = (e: React.MouseEvent, sheet: Sheet) => {
    e.preventDefault()
    // In a real app, you would show a context menu here
    if (window.confirm(`Delete sheet "${sheet.name}"?`)) {
      removeSheet(sheet.id)
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
    <div className="flex items-center h-full">
      {/* Navigation buttons */}
      <button className="win98-toolbar-button h-full px-1" onClick={navigateToPreviousSheet}>
        <ChevronLeftIcon className="h-3 w-3" />
      </button>
      <button className="win98-toolbar-button h-full px-1" onClick={navigateToNextSheet}>
        <ChevronRightIcon className="h-3 w-3" />
      </button>

      {/* Sheet tabs */}
      <div className="flex h-full">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`relative h-full flex items-center px-2 border-r border-[#808080] cursor-pointer ${sheet.active ? "bg-white" : "bg-[#d4d0c8]"
              }`}
            onClick={() => activateSheet(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet)}
            onContextMenu={(e) => handleRightClick(e, sheet)}
          >
            {editingId === sheet.id ? (
              <input
                ref={inputRef}
                type="text"
                className="w-16 h-5 px-1 text-xs border border-[#000080] bg-white"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
              />
            ) : (
              <div className="flex items-center">
                <span className="text-xs">{sheet.name}</span>
                {sheet.wizardState.wizardStep !== "landing" && (
                  <div className="ml-1 w-2 h-2 rounded-full bg-[#000080]" title="Chart in progress"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="h-full px-2 text-xs bg-[#d4d0c8] border-r border-[#808080] hover:bg-[#e6e6e6]"
        onClick={() => addSheet()}
      >
        +
      </button>
    </div>
  )
}

