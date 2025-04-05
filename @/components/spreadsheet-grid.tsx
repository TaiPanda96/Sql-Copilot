"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSheets } from "@/contexts/sheet-context"

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
  const gridRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i))

  // Generate row numbers (1, 2, 3, ...)
  const rowNumbers = Array.from({ length: rows }, (_, i) => i + 1)

  // Calculate container height and update on resize
  useEffect(() => {
    const updateHeight = () => {
      if (gridRef.current) {
        setContainerHeight(gridRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)

    return () => {
      window.removeEventListener("resize", updateHeight)
    }
  }, [])

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

  // Calculate how many extra rows we need to fill the space
  const rowHeight = 24 // Height of each row in pixels (including borders)
  const headerHeight = 24 // Height of the header row
  const availableHeight = containerHeight - headerHeight
  const visibleRows = Math.max(rows, Math.ceil(availableHeight / rowHeight))
  const extraRows = visibleRows - rows

  // Generate extra row numbers if needed
  const extraRowNumbers = extraRows > 0 ? Array.from({ length: extraRows }, (_, i) => rows + i + 1) : []

  return (
    <div
      ref={gridRef}
      className="flex-grow relative bg-white overflow-hidden"
      style={{ height: "calc(100vh - 100px)" }}
    >
      {/* Content overlay for wizard */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div className="pointer-events-auto content-container no-scroll">{children}</div>
      </div>

      {/* Spreadsheet grid */}
      <div className="absolute inset-0 overflow-hidden">
        <table className="border-collapse table-fixed w-full h-full">
          <colgroup>
            <col style={{ width: "40px" }} />
            {columnHeaders.map((_, i) => (
              <col key={i} style={{ width: "100px" }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {/* Top-left corner cell */}
              <th className="w-10 h-6 bg-[#d4d0c8] border-r border-b border-[#808080] sticky top-0 left-0 z-30"></th>

              {/* Column headers */}
              {columnHeaders.map((header) => (
                <th
                  key={header}
                  className="w-[100px] h-6 bg-[#d4d0c8] border-r border-b border-[#808080] text-xs font-bold sticky top-0 z-20"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Regular rows */}
            {rowNumbers.map((rowNum) => (
              <tr key={rowNum} className="h-6">
                {/* Row header */}
                <th className="w-10 h-6 bg-[#d4d0c8] border-r border-b border-[#808080] text-xs font-bold sticky left-0 z-20">
                  {rowNum}
                </th>

                {/* Cells */}
                {columnHeaders.map((colHeader) => {
                  const cellId = `${colHeader}${rowNum}`
                  const isSelected = selectedCell === cellId

                  return (
                    <td
                      key={cellId}
                      className={`w-[100px] h-6 border-r border-b border-[#e0e0e0] ${
                        isSelected ? "bg-[#e8f0fe] outline outline-1 outline-[#000080]" : "bg-white"
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
                    </td>
                  )
                })}
              </tr>
            ))}

            {/* Extra rows to fill space */}
            {extraRowNumbers.map((rowNum) => (
              <tr key={`extra-${rowNum}`} className="h-6">
                {/* Row header */}
                <th className="w-10 h-6 bg-[#d4d0c8] border-r border-b border-[#808080] text-xs font-bold sticky left-0 z-20">
                  {rowNum}
                </th>

                {/* Cells */}
                {columnHeaders.map((colHeader) => {
                  const cellId = `${colHeader}${rowNum}`
                  const isSelected = selectedCell === cellId

                  return (
                    <td
                      key={cellId}
                      className={`w-[100px] h-6 border-r border-b border-[#e0e0e0] ${
                        isSelected ? "bg-[#e8f0fe] outline outline-1 outline-[#000080]" : "bg-white"
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
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

