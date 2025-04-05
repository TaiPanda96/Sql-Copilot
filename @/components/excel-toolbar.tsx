import Link from "next/link"
import { QuickChartsLogo } from "./quick-charts-logo"

export function ExcelToolbar() {
  return (
    <div className="w-full">
      {/* Menu Bar */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 flex items-center">
        <div className="flex space-x-4">
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">File</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Edit</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">View</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Insert</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Format</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Tools</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Data</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Window</span>
          <span className="text-sm hover:bg-[#000080] hover:text-white px-1">Help</span>
        </div>
      </div>

      {/* Icon Toolbar */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] px-1 py-1 flex items-center">
        <div className="flex space-x-1">
          {/* New */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="10" height="12" fill="white" stroke="black" />
              <path d="M5 1V3" stroke="black" />
              <path d="M8 1V3" stroke="black" />
              <path d="M11 1V3" stroke="black" />
            </svg>
          </button>

          {/* Open */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 14V3H7L8 5H14V14H2Z" fill="#FFC000" stroke="black" />
            </svg>
          </button>

          {/* Save */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="2" width="10" height="12" fill="#5B9BD5" stroke="black" />
              <rect x="5" y="2" width="6" height="4" fill="white" stroke="black" />
              <rect x="6" y="9" width="4" height="3" fill="white" stroke="black" />
            </svg>
          </button>

          {/* Print */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="9" width="8" height="5" fill="white" stroke="black" />
              <rect x="3" y="4" width="10" height="5" fill="#808080" stroke="black" />
              <rect x="5" y="2" width="6" height="2" fill="white" stroke="black" />
              <circle cx="11" cy="6" r="1" fill="#00FF00" />
            </svg>
          </button>

          <div className="win98-separator mx-1"></div>

          {/* Cut */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L12 12" stroke="black" strokeWidth="1.5" />
              <path d="M4 12L12 4" stroke="black" strokeWidth="1.5" />
              <circle cx="4" cy="12" r="2" fill="#ED7D31" stroke="black" />
              <circle cx="12" cy="4" r="2" fill="#ED7D31" stroke="black" />
            </svg>
          </button>

          {/* Copy */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="7" width="6" height="6" fill="white" stroke="black" />
              <rect x="7" y="3" width="6" height="6" fill="white" stroke="black" />
            </svg>
          </button>

          {/* Paste */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="10" height="10" fill="white" stroke="black" />
              <path d="M5 7H11" stroke="black" />
              <path d="M5 9H11" stroke="black" />
              <path d="M5 11H11" stroke="black" />
            </svg>
          </button>

          <div className="win98-separator mx-1"></div>

          {/* Chart */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="12" height="12" fill="white" stroke="black" />
              <rect x="4" y="10" width="2" height="2" fill="#5B9BD5" />
              <rect x="7" y="8" width="2" height="4" fill="#ED7D31" />
              <rect x="10" y="6" width="2" height="6" fill="#70AD47" />
            </svg>
          </button>

          {/* Dollar Sign */}
          <button className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" fill="#70AD47" stroke="black" />
              <text x="5" y="12" fontSize="11" fontWeight="bold" fill="white">
                $$
              </text>
            </svg>
          </button>

          <div className="win98-separator mx-1"></div>

          {/* Zoom */}
          <div className="flex items-center bg-white border border-[#808080] h-6 px-1">
            <span className="text-xs">100%</span>
            <span className="ml-1">▼</span>
          </div>

          {/* Help */}
          <button className="win98-toolbar-button ml-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" fill="#5B9BD5" stroke="black" />
              <text x="6" y="12" fontSize="10" fontWeight="bold" fill="white">
                ?
              </text>
            </svg>
          </button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] px-1 py-1 flex items-center">
        <div className="win98-cell-reference w-16 mr-2 flex items-center justify-between">
          <span className="text-xs">A1</span>
          <span className="text-xs">▼</span>
        </div>

        <div className="win98-input flex-1 h-6 flex items-center">
          <span className="text-xs px-1">=</span>
        </div>

        <div className="flex items-center ml-2">
          <Link href="/" className="flex items-center space-x-1">
            <QuickChartsLogo size="small" />
            <span className="text-xs font-bold">Quick Charts</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

