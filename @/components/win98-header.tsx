import Link from "next/link"
import { QuickChartsLogo } from "./quick-charts-logo"

export function Win98Header() {
  return (
    <header className="w-full bg-[#c0c0c0] border-b border-[#808080]">
      <div className="container mx-auto">
        <div className="win98-toolbar py-1 px-2">
          <Link href="/" className="flex items-center space-x-2 mr-4">
            <QuickChartsLogo size="small" />
            <span className="font-bold text-black">Quick Charts</span>
          </Link>

          <div className="win98-separator"></div>

          <div className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="12" height="12" fill="white" stroke="black" />
              <path d="M4 8H12" stroke="black" />
              <path d="M4 4H12" stroke="black" />
              <path d="M4 12H12" stroke="black" />
            </svg>
          </div>

          <div className="win98-toolbar-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="12" height="12" fill="white" stroke="black" />
              <rect x="4" y="8" width="3" height="4" fill="#5B9BD5" />
              <rect x="9" y="4" width="3" height="8" fill="#ED7D31" />
            </svg>
          </div>

          <div className="win98-separator"></div>

          <div className="flex-1"></div>

          <div className="win98-cell-reference px-4">A1</div>
        </div>
      </div>
    </header>
  )
}

