"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useSheets, type Sheet } from "@/contexts/sheet-context"

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

  return (
    <div className="flex items-center h-full overflow-hidden">
      {/* Sheet tabs */}
      <div className="flex h-full">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`relative h-full flex items-center cursor-pointer ${
              sheet.active ? "excel98-tab-active" : "excel98-tab-inactive"
            }`}
            onClick={() => activateSheet(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet)}
            onContextMenu={(e) => handleRightClick(e, sheet)}
          >
            {editingId === sheet.id ? (
              <input
                ref={inputRef}
                type="text"
                className="w-16 h-4 px-1 text-xs border border-[#000080] bg-white"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
              />
            ) : (
              <div className="flex items-center px-2">
                <span className="text-xs whitespace-nowrap">{sheet.name}</span>
                {sheet.wizardState.wizardStep !== "landing" && (
                  <div className="ml-1 w-2 h-2 rounded-full bg-[#000080]" title="Chart in progress"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="h-full px-2 text-xs excel98-new-tab" onClick={() => addSheet()}>
        +
      </button>
    </div>
  )
}

