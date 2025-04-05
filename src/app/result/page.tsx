"use client"

import { D3Chart } from "@/components/d3-chart"
import { ExcelToolbar } from "@/components/excel-toolbar"
import { SpreadsheetGrid } from "@/components/spreadsheet-grid"
import { StatusBar } from "@/components/status-bar"
import { CopyIcon } from "@radix-ui/react-icons"
import { useSheets } from "contexts/sheet-context"
import { Download, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ChartConfig } from "types/chart"

export default function ResultPage() {
  const { activeSheet, updateSheetWizardState, navigateToWizardStep } = useSheets()

  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Load wizard state from active sheet
  useEffect(() => {
    if (activeSheet && !isInitialized) {
      const { chartConfig: sheetChartConfig } = activeSheet.wizardState
      if (sheetChartConfig) {
        setChartConfig(sheetChartConfig)
      }
      setIsInitialized(true)
    }
  }, [activeSheet, isInitialized])

  // Reset state when active sheet changes
  useEffect(() => {
    setIsInitialized(false)
    setChartConfig(null)
  }, [activeSheet?.id])

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
    link.setAttribute("download", `${activeSheet?.name}_chart_data.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyAsPNG = async () => {
    if (!chartRef.current) return

    try {
      // Use html-to-image or similar library in a real app
      // For this demo, we'll just show an alert
      alert(
        `Chart for ${activeSheet?.name} copied as PNG! (This would capture the chart as an image in a real implementation)`,
      )
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

  return (
    <main className="min-h-screen win98-spreadsheet-bg pb-6">
      <ExcelToolbar />

      <SpreadsheetGrid rows={30} cols={16}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="win98-window max-w-4xl mx-auto mt-16">
            <div className="win98-title-bar bg-[#000080] text-white">Your Chart is Ready</div>
            <div className="p-4 bg-[#c0c0c0]">
              {chartConfig && (
                <div className="space-y-6">
                  <div ref={chartRef} className="bg-white p-4 win98-window">
                    <D3Chart config={chartConfig} />
                  </div>

                  <div className="space-y-4">
                    <div className="win98-window p-4">
                      <h3 className="font-bold text-lg mb-2">
                        What to Say to{" "}
                        {chartConfig.audience === "executives"
                          ? "Executive Leadership"
                          : chartConfig.audience === "technical"
                            ? "Technical Team"
                            : chartConfig.audience === "general"
                              ? "General Audience"
                              : "Stakeholders"}
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        {getTalkingPointsForAudience(chartConfig.audience).map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="win98-window p-4">
                      <h3 className="font-bold text-lg mb-2">Key Insights</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Sales have consistently increased quarter over quarter</li>
                        <li>Q4 shows the strongest performance at 81K</li>
                        <li>The growth rate accelerated in Q3 with a 35.6% increase from Q2</li>
                        <li>Overall yearly growth trend indicates successful market strategies</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button className="win98-button flex items-center gap-2" onClick={downloadCSV}>
                      <Download className="h-4 w-4" />
                      Download CSV
                    </button>
                    <button className="win98-button flex items-center gap-2" onClick={copyAsPNG}>
                      <CopyIcon className="h-4 w-4" />
                      Copy as PNG
                    </button>
                    <button className="win98-button flex items-center gap-2" onClick={tryDifferentChart}>
                      <RefreshCw className="h-4 w-4" />
                      Try Different Chart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SpreadsheetGrid>

      <StatusBar />
    </main>
  )
}

