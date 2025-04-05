"use client"

import { useState, useEffect } from "react"
import { ExcelToolbar } from "@/components/excel-toolbar"
import { StatusBar } from "@/components/status-bar"
import { SpreadsheetGrid } from "@/components/spreadsheet-grid"
import { Loading } from "@/components/loading"
import type { QuestionStep } from "@/types/chart"
import { useSheets } from "@/contexts/sheet-context"
import { Excel97Header } from "@/components/excel97-header"
import { ChevronRightIcon } from "@radix-ui/react-icons"

export default function QuestionsPage() {
  const { activeSheet, updateSheetWizardState, navigateToWizardStep } = useSheets()

  const [currentStep, setCurrentStep] = useState<QuestionStep>("initial")
  const [storyDetails, setStoryDetails] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load wizard state from active sheet
  useEffect(() => {
    if (activeSheet && !isInitialized) {
      const { currentStep: sheetStep, storyDetails: sheetDetails, isLoading: sheetLoading } = activeSheet.wizardState
      if (sheetStep) setCurrentStep(sheetStep)
      if (sheetDetails) setStoryDetails(sheetDetails || {})
      if (sheetLoading !== undefined) setIsLoading(sheetLoading)
      setIsInitialized(true)
    }
  }, [activeSheet, isInitialized])

  // Reset state when active sheet changes
  useEffect(() => {
    setIsInitialized(false)
    setCurrentStep("initial")
    setStoryDetails({})
    setIsLoading(false)
  }, [activeSheet?.id])

  const handleOptionSelect = (question: string, answer: string) => {
    const updatedStoryDetails = {
      ...storyDetails,
      [question]: answer,
    }

    setStoryDetails(updatedStoryDetails)

    // Move to the next question based on current step
    let nextStep = currentStep
    if (currentStep === "initial") {
      nextStep = "dataContext"
      setCurrentStep(nextStep)
    } else if (currentStep === "dataContext") {
      nextStep = "keyInsight"
      setCurrentStep(nextStep)
    } else if (currentStep === "keyInsight") {
      nextStep = "audience"
      setCurrentStep(nextStep)
    } else if (currentStep === "audience") {
      // Final step - process with LLM
      setIsLoading(true)

      // Update sheet wizard state
      if (activeSheet) {
        updateSheetWizardState(activeSheet.id, {
          currentStep: nextStep,
          storyDetails: updatedStoryDetails,
          isLoading: true,
        })

        // Simulate LLM processing time
        setTimeout(() => {
          // Generate sample chart config
          const sampleConfig = {
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
            title: "Quarterly Sales Performance Exceeds Targets",
            xAxisLabel: "Quarter",
            yAxisLabel: "Sales (thousands)",
            audience:
              updatedStoryDetails["Who is your target audience for this chart?"] === "Executive leadership"
                ? "executives"
                : updatedStoryDetails["Who is your target audience for this chart?"] === "Technical team"
                  ? "technical"
                  : updatedStoryDetails["Who is your target audience for this chart?"] === "General audience"
                    ? "general"
                    : "stakeholders",
            tone: "formal",
          }

          // Update sheet with chart config and navigate to result
          updateSheetWizardState(activeSheet.id, {
            chartConfig: sampleConfig,
            isLoading: false,
            wizardStep: "result",
          })

          navigateToWizardStep("result")
        }, 3000)
      }
    } else {
      // Update sheet wizard state for other steps
      if (activeSheet) {
        updateSheetWizardState(activeSheet.id, {
          currentStep: nextStep,
          storyDetails: updatedStoryDetails,
        })
      }
    }
  }

  const questions = {
    initial: {
      question: "What is the main focus of your data story?",
      options: [
        { label: "Comparing values", description: "Show differences between categories" },
        { label: "Showing trends", description: "Illustrate changes over time" },
        { label: "Displaying composition", description: "Show how parts make up a whole" },
        { label: "Revealing relationships", description: "Demonstrate correlations between variables" },
      ],
    },
    dataContext: {
      question: "What timeframe does your data cover?",
      options: [
        { label: "Point in time", description: "Current snapshot or specific moment" },
        { label: "Short-term period", description: "Days, weeks, or months" },
        { label: "Long-term period", description: "Years or decades" },
        { label: "Comparative periods", description: "Before/after or year-over-year" },
      ],
    },
    keyInsight: {
      question: "What's the key insight you want viewers to take away?",
      options: [
        { label: "Growth or decline", description: "Highlight increasing or decreasing values" },
        { label: "Patterns or anomalies", description: "Show recurring trends or outliers" },
        { label: "Proportional differences", description: "Emphasize relative sizes or shares" },
        { label: "Categorical comparison", description: "Compare performance across categories" },
      ],
    },
    audience: {
      question: "Who is your target audience for this chart?",
      options: [
        { label: "Executive leadership", description: "Focus on high-level insights and decisions" },
        { label: "Technical team", description: "Include detailed data and technical context" },
        { label: "General audience", description: "Accessible to people without domain expertise" },
        { label: "Stakeholders", description: "Highlight impact and relevance to specific groups" },
      ],
    },
  }

  const currentQuestion = questions[currentStep]

  return (
    <div className="flex flex-col h-screen">
      <Excel97Header />
      <ExcelToolbar />

      <SpreadsheetGrid rows={30} cols={16}>
        <div className="flex flex-col items-center justify-center max-h-[70vh] overflow-auto">
          <div className="win98-window max-w-3xl mx-auto">
            <div className="win98-title-bar bg-[#000080] text-white">
              {isLoading ? "Analyzing your story..." : currentQuestion?.question}
            </div>
            <div className="p-4 bg-[#c0c0c0]">
              {isLoading ? (
                <div className="space-y-4">
                  <Loading />
                  <div className="text-center text-sm text-gray-600">
                    <p>Analyzing your story details:</p>
                    <ul className="mt-2 list-disc list-inside">
                      {Object.entries(storyDetails).map(([question, answer]) => (
                        <li key={question}>{answer}</li>
                      ))}
                    </ul>
                    <p className="mt-4">Determining the optimal chart type and visualization...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => (
                    <Option
                      key={index}
                      label={option.label}
                      description={option.description}
                      onClick={() => handleOptionSelect(currentQuestion.question, option.label)}
                    />
                  ))}
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

interface OptionProps {
  label: string
  description: string
  onClick: () => void
}

function Option({ label, description, onClick }: OptionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 win98-button flex items-center justify-between hover:bg-[#d4d0c8]"
    >
      <div>
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-[#000080]" />
    </button>
  )
}

