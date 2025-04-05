"use client"

import { useState, useEffect } from "react"

export function Loading() {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("Analyzing data...")

  useEffect(() => {
    const steps = [
      { progress: 20, text: "Extracting key data points..." },
      { progress: 40, text: "Identifying patterns and trends..." },
      { progress: 60, text: "Determining optimal visualization..." },
      { progress: 80, text: "Generating chart and insights..." },
      { progress: 95, text: "Finalizing presentation..." },
    ]

    let currentStep = 0

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress)
        setStatusText(steps[currentStep].text)
        currentStep++
      } else {
        clearInterval(interval)
        setProgress(100)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="text-base font-bold">{statusText}</div>
      <div className="w-full h-5 win98-window p-0 overflow-hidden">
        <div
          className="h-full bg-[#000080]"
          style={{ width: `${progress}%`, transition: "width 0.5s ease-in-out" }}
        ></div>
      </div>
      <div className="win98-window p-2 mt-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin mr-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1V4" stroke="black" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 12V15" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M3 3L5 5" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M11 11L13 13" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <path d="M1 8H4" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <path d="M12 8H15" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M3 13L5 11" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M11 5L13 3" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm">Please wait...</span>
        </div>
      </div>
    </div>
  )
}

