"use client"

import { useState, useEffect, useRef } from "react"
import { ExcelToolbar } from "@/components/excel-toolbar"
import { StatusBar } from "@/components/status-bar"
import { SpreadsheetGrid } from "@/components/spreadsheet-grid"
import { D3Chart } from "@/components/d3-chart"
import type { ChartConfig } from "@/types/chart"
import { Download, RefreshCw, Share2, Link } from "lucide-react"
import { useSheets } from "@/contexts/sheet-context"
import { Excel97Header } from "@/components/excel97-header"
import { CopyIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"

export default function ResultPage() {
  const { activeSheet, updateSheetWizardState, navigateToWizardStep } = useSheets()

  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const [forceRender, setForceRender] = useState(0)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  // Load wizard state from active sheet
  useEffect(() => {
    if (activeSheet && !isInitialized) {
      const { chartConfig: sheetChartConfig } = activeSheet.wizardState
      if (sheetChartConfig) {
        setChartConfig(sheetChartConfig)
      } else {
        // Create a default chart config if none exists
        const defaultConfig: ChartConfig = {
          type: "bar",
          data: {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            datasets: [
              {
                label: "Sales",
                data: [65, 59, 80, 81],
                backgroundColor: "#5b9bd5",
              },
            ],
          },
          title: "Quarterly Sales Performance",
          xAxisLabel: "Quarter",
          yAxisLabel: "Sales (thousands)",
          audience: "general",
          tone: "formal",
        }
        setChartConfig(defaultConfig)

        // Save the default config to the sheet
        if (activeSheet) {
          updateSheetWizardState(activeSheet.id, { chartConfig: defaultConfig })
        }
      }
      setIsInitialized(true)

      // Force a re-render after a short delay to ensure proper dimensions
      setTimeout(() => {
        setForceRender((prev) => prev + 1)
      }, 100)
    }
  }, [activeSheet, isInitialized, updateSheetWizardState])

  // Reset state when active sheet changes
  useEffect(() => {
    setIsInitialized(false)
    setChartConfig(null)
    setShowShareOptions(false)
  }, [activeSheet?.id])

  // Force another re-render after component mount to ensure proper dimensions
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender((prev) => prev + 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const downloadCSV = () => {
    if (!chartConfig) return

    const { labels, datasets } = chartConfig.data
    const csvContent = [
      ["Category", ...datasets.map((ds) => ds.label)].join(","),
      ...labels.map((label, i) => [label, ...datasets.map((ds) => ds.data[i])].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${activeSheet?.name || "chart"}_data.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyAsPNG = async () => {
    if (!chartRef.current) return

    try {
      // Show Excel97-styled notification instead of alert
      setShowCopyNotification(true)
      setShowShareOptions(false)

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowCopyNotification(false)
      }, 3000)
    } catch (error) {
      console.error("Error copying chart as PNG:", error)
    }
  }

  const tryDifferentChart = () => {
    // Go back to the landing page to start over
    if (activeSheet) {
      updateSheetWizardState(activeSheet.id, { wizardStep: "landing" })
      navigateToWizardStep("landing")
    }
  }

  const getTalkingPointsForAudience = (audience: string) => {
    switch (audience) {
      case "executives":
        return [
          "Emphasize that Q4 sales exceeded targets by 15%, demonstrating successful execution of our growth strategy",
          "Highlight the 35.6% growth from Q2 to Q3 as evidence that our mid-year adjustments were effective",
          "Frame the consistent quarter-over-quarter growth as validation of our annual business plan",
          "Connect these results to ROI and suggest strategic investments for the coming year",
        ]
      case "technical":
        return [
          "Present the detailed growth rates between quarters: -9.2% (Q1-Q2), +35.6% (Q2-Q3), and +1.3% (Q3-Q4)",
          "Discuss the statistical significance of the Q2-Q3 jump and potential causal factors",
          "Explain the data collection methodology and any adjustments made to the raw numbers",
          "Suggest areas for deeper data analysis to understand the performance drivers",
        ]
      case "general":
        return [
          "Explain that our sales have been growing throughout the year, with particularly strong results in the second half",
          "Point out that we ended the year strong with our best quarter ever",
          "Mention that the growth shows our products are being well-received in the market",
          "Share that these results position us well for continued success next year",
        ]
      case "stakeholders":
        return [
          "Emphasize that the consistent growth pattern demonstrates stability and effective management",
          "Highlight that Q4 performance exceeded projections, indicating strong market position",
          "Note that the acceleration in Q3 shows our ability to adapt to market conditions",
          "Connect these results to long-term value creation and sustainable growth",
        ]
      default:
        return [
          "Highlight the consistent quarter-over-quarter growth trend",
          "Emphasize the strong Q4 performance at 81K",
          "Point out the significant growth acceleration in Q3",
          "Connect these results to overall business success",
        ]
    }
  }

  const getAudienceTitle = (audience: string) => {
    switch (audience) {
      case "executives":
        return "Executive Leadership"
      case "technical":
        return "Technical Team"
      case "general":
        return "General Audience"
      case "stakeholders":
        return "Stakeholders"
      default:
        return "General Audience"
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Excel97Header />
      <ExcelToolbar />

      <SpreadsheetGrid rows={30} cols={16}>
        <div className="flex items-center justify-center h-full">
          <div className="win98-window max-w-4xl mx-auto no-scroll-container">
            <div className="win98-title-bar bg-[#000080] text-white">Your Chart is Ready</div>
            <div className="p-4 bg-[#c0c0c0] no-scroll-content">
              {chartConfig && (
                <div className="space-y-4">
                  {/* Fixed height chart container with explicit dimensions */}
                  <div
                    ref={chartRef}
                    className="bg-white p-2 win98-window"
                    style={{
                      height: "250px",
                      width: "100%",
                      overflow: "hidden", // Prevent any overflow issues
                      position: "relative", // Ensure positioning context
                    }}
                    key={`chart-container-${forceRender}`} // Force re-render with key change
                  >
                    <D3Chart config={chartConfig} />
                  </div>

                  {/* Vertical layout for audience text and key insights */}
                  <div className="space-y-3">
                    <div className="win98-window p-3">
                      <h3 className="font-bold text-sm mb-1">
                        What to Say to {getAudienceTitle(chartConfig.audience)}
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs">
                        {getTalkingPointsForAudience(chartConfig.audience).map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="win98-window p-3">
                      <h3 className="font-bold text-sm mb-1">Key Insights</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs">
                        <li>Sales have consistently increased quarter over quarter</li>
                        <li>Q4 shows the strongest performance at 81K</li>
                        <li>The growth rate accelerated in Q3 with a 35.6% increase from Q2</li>
                        <li>Overall yearly growth trend indicates successful market strategies</li>
                      </ul>
                    </div>
                  </div>

                  {/* Enhanced share button functionality - repositioned */}
                  <div className="flex flex-col gap-2">
                    {/* Share button row */}
                    <div className="flex gap-2 relative">
                      <button
                        className="win98-button flex items-center gap-1 text-xs bg-[#000080] text-white"
                        onClick={copyAsPNG}
                      >
                        <CopyIcon className="h-3 w-3" />
                        Copy as PNG
                      </button>

                      <div className="relative">
                        <button
                          className="win98-button flex items-center gap-1 text-xs"
                          onClick={() => setShowShareOptions(!showShareOptions)}
                        >
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>

                        {showShareOptions && (
                          <div className="absolute left-0 mt-1 win98-window bg-[#c0c0c0] p-1 z-10">
                            <button
                              className="win98-button flex items-center gap-1 text-xs w-full mb-1"
                              onClick={downloadCSV}
                            >
                              <Download className="h-3 w-3" />
                              Download CSV
                            </button>
                            <button
                              className="win98-button flex items-center gap-1 text-xs w-full mb-1"
                              onClick={() => {
                                alert("Email sharing would be implemented here")
                                setShowShareOptions(false)
                              }}
                            >
                              <EnvelopeClosedIcon className="h-3 w-3" />
                              Email Chart
                            </button>
                            <button
                              className="win98-button flex items-center gap-1 text-xs w-full"
                              onClick={() => {
                                alert("Link copied to clipboard")
                                setShowShareOptions(false)
                              }}
                            >
                              <Link className="h-3 w-3" />
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Try Different Chart button in second row */}
                    <div>
                      <button className="win98-button flex items-center gap-1 text-xs" onClick={tryDifferentChart}>
                        <RefreshCw className="h-3 w-3" />
                        Try Different Chart
                      </button>
                    </div>
                  </div>

                  {/* Excel97-styled notification */}
                  {showCopyNotification && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                      <div className="win98-window" style={{ maxWidth: "320px" }}>
                        <div className="win98-title-bar bg-[#000080] text-white flex justify-between items-center px-1 py-1">
                          <div className="text-xs font-bold">Quick Charts</div>
                          <button
                            className="text-xs px-1 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#808080]"
                            onClick={() => setShowCopyNotification(false)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="p-3 bg-[#c0c0c0] flex">
                          <div className="mr-3">
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 32 32"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#000000" />
                              <path d="M10 16L14 20L22 12" stroke="#000080" strokeWidth="2" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm">Chart for {activeSheet?.name || "Sheet1"} copied as PNG!</p>
                          </div>
                        </div>
                        <div className="bg-[#c0c0c0] p-2 flex justify-end border-t border-[#808080]">
                          <button className="win98-button text-xs px-4" onClick={() => setShowCopyNotification(false)}>
                            OK
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SpreadsheetGrid>

      <StatusBar />
    </div>
  )
}

