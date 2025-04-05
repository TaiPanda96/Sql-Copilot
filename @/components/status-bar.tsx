"use client"
import { SheetTabs } from "./sheet-tabs"

export function StatusBar() {
  return (
    <div className="w-full bg-[#c0c0c0] border-t border-[#808080] h-6 flex items-center fixed bottom-0 left-0">
      <div className="win98-button mr-2 py-0 px-2 text-xs h-5 flex items-center ml-1">Start</div>
      <div className="win98-separator mx-2 h-4"></div>
      <div className="text-xs mr-2">Ready</div>

      {/* Sheet tabs now positioned at the left */}
      <SheetTabs />

      <div className="flex-1"></div>
    </div>
  )
}

