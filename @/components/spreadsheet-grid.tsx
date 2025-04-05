"use client"

import { useSheets } from "contexts/sheet-context"
import type React from "react"
import { useEffect, useState } from "react"

interface SpreadsheetGridProps {
  children: React.ReactNode
  rows?: number
  cols?: number
}

interface CellData {
  value: string
  formula?: string
}

export function SpreadsheetGrid({ children, rows = 30, cols = 16 }: SpreadsheetGridProps) {
  const { activeSheet, updateSheetWizardState } = useSheets()
  const [cellData, setCellData] = useState<Record<string, CellData>>({})
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i))

  // Generate row numbers (1, 2, 3, ...)
  const rowNumbers = Array.from({ length: rows }, (_, i) => i + 1)

  // Load cell data from active sheet
  useEffect(() => {
    if (activeSheet?.wizardState.cellData) {
      setCellData(activeSheet.wizardState.cellData)
    } else {
      setCellData({})
    }
  }, [activeSheet])

  // Save cell data to active sheet
  const saveCellData = (newCellData: Record<string, CellData>) => {
    if (activeSheet) {
      updateSheetWizardState(activeSheet.id, { cellData: newCellData })
    }
  }

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId)
    setEditValue(cellData[cellId]?.value || "")
    setIsEditing(true)
  }

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleCellBlur = () => {
    if (selectedCell && isEditing) {
      const newCellData = {
        ...cellData,
        [selectedCell]: { value: editValue },
      }
      setCellData(newCellData)
      saveCellData(newCellData)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return

    if (e.key === "Enter") {
      handleCellBlur()

      // Move to the cell below
      const colIndex = selectedCell.charCodeAt(0) - 65
      const rowIndex = Number.parseInt(selectedCell.substring(1)) - 1

      if (rowIndex < rows - 1) {
        const nextCell = `${String.fromCharCode(65 + colIndex)}${rowIndex + 2}`
        setSelectedCell(nextCell)
        setEditValue(cellData[nextCell]?.value || "")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      handleCellBlur()

      // Move to the next cell
      const colIndex = selectedCell.charCodeAt(0) - 65
      const rowIndex = Number.parseInt(selectedCell.substring(1)) - 1

      if (colIndex < cols - 1) {
        const nextCell = `${String.fromCharCode(65 + colIndex + 1)}${rowIndex + 1}`
        setSelectedCell(nextCell)
        setEditValue(cellData[nextCell]?.value || "")
      } else if (rowIndex < rows - 1) {
        // Move to the first cell of the next row
        const nextCell = `A${rowIndex + 2}`
        setSelectedCell(nextCell)
        setEditValue(cellData[nextCell]?.value || "")
      }
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setSelectedCell(null)
    }
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="min-w-full min-h-full relative">
        {/* Top-left corner cell */}
        <div className="sticky top-0 left-0 z-30">
          <div className="w-10 h-6 bg-[#d4d0c8] border-r border-b border-[#808080]"></div>
        </div>

        {/* Column headers */}
        <div className="sticky top-0 z-20 flex ml-10">
          {columnHeaders.map((header) => (
            <div
              key={header}
              className="flex-shrink-0 w-16 h-6 bg-[#d4d0c8] border-r border-b border-[#808080] flex items-center justify-center text-xs font-bold"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Row headers and cells grid */}
        <div className="flex">
          {/* Row headers */}
          <div className="sticky left-0 z-20">
            {rowNumbers.map((number) => (
              <div
                key={number}
                className="w-10 h-6 bg-[#d4d0c8] border-r border-b border-[#808080] flex items-center justify-center text-xs font-bold"
              >
                {number}
              </div>
            ))}
          </div>

          {/* Cells grid */}
          <div className="relative">
            {rowNumbers.map((row) => (
              <div key={`row-${row}`} className="flex">
                {columnHeaders.map((col) => {
                  const cellId = `${col}${row}`
                  const isSelected = selectedCell === cellId

                  return (
                    <div
                      key={cellId}
                      className={`w-16 h-6 border-r border-b border-[#e0e0e0] flex items-center ${isSelected ? "bg-[#e8f0fe] outline outline-1 outline-[#000080]" : ""
                        }`}
                      onClick={() => handleCellClick(cellId)}
                    >
                      {isSelected && isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleCellChange}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          className="w-full h-full px-1 text-xs border-none outline-none bg-white"
                          autoFocus
                        />
                      ) : (
                        <div className="px-1 text-xs truncate w-full">{cellData[cellId]?.value || ""}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Overlay for the wizard content */}
        <div className="absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}

