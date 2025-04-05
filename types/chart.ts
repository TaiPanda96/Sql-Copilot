export type ChartType = "bar" | "line" | "pie" | "scatter" | "area" | "donut" | "radar" | "bubble"

export type Audience = "executives" | "technical" | "general" | "stakeholders"

export type ChartTone = "formal" | "casual" | "technical" | "creative"

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

export interface ChartConfig {
  type: ChartType
  data: ChartData
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  audience: Audience
  tone: ChartTone
}

export interface UserInput {
  story: string
  audience: Audience
  dataFile?: File
}

export type QuestionStep =
  | "initial" // Main focus of data story
  | "dataContext" // Timeframe
  | "keyInsight" // Key takeaway
  | "audience" // Who will view it
  | "processing" // LLM processing
  | "result" // Final result

