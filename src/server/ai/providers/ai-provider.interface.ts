export type Suggestion = {
  type: "positive" | "warning"
  message: string
}

export type ActionItem = {
  owner: string
  task: string
  due?: string
}

export type DocumentAnalysis = {
  title: string
  summary: string
  actionItems: ActionItem[]
  timeline: Array<{ date: string; event: string }>
  decisions: string[]
  tags: string[]
  suggestions: Suggestion[]
  healthScore: number
  readingTimeMinutes: number
}

export interface AIProvider {
  analyze(content: string): Promise<DocumentAnalysis>
  generateTemplate(templateType: string): Promise<{ title: string; content: string }>
  improve?(content: string): Promise<{ suggestions: string[] }>
}

