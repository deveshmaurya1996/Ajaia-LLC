import { documentAnalysisSchema } from "../schemas/analysis.schema"
import type { AIProvider, DocumentAnalysis } from "./ai-provider.interface"
import { toAnalysisText, toPlainText, titleFromSourceText } from "@/lib/document-content"

const dueKeywords = [
  "today",
  "tomorrow",
  "yesterday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function estimateReadingTimeMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return clamp(Math.ceil(words / 200), 1, 60)
}

function heuristicAnalyze(content: string): DocumentAnalysis {
  const plain = toAnalysisText(content)
  const title = titleFromSourceText(plain, "Untitled")

  const sentences = plain
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const summary =
    toPlainText(sentences.slice(0, 2).join(" ")).slice(0, 400) ||
    "Summary will appear as you add details."

  const dueRegex = dueKeywords.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const taskRegex = new RegExp(
    `\\b([A-Z][a-zA-Z]+)\\b\\s+(?:will\\s+)?([a-zA-Z]+)\\b.*?\\b(${dueRegex})\\b`,
    "gi",
  )

  const actionItems: DocumentAnalysis["actionItems"] = []
  const timeline: DocumentAnalysis["timeline"] = []
  for (;;) {
    const match = taskRegex.exec(plain)
    if (!match) break
    const owner = match[1]
    const task = match[2]
    const due = match[3]
    actionItems.push({ owner, task, due })
    timeline.push({ date: due, event: task })
  }

  const decisions: string[] = []
  const decisionMatch = plain.match(/Decision[:\\-]\\s*([^\\n.]+)/i)
  if (decisionMatch?.[1]) {
    decisions.push(
      ...decisionMatch[1]
        .split(/,|and/i)
        .map((d) => toPlainText(d))
        .filter(Boolean)
        .slice(0, 5),
    )
  }

  const tags: string[] = []
  const lower = plain.toLowerCase()
  if (lower.includes("postgre")) tags.push("Backend")
  if (lower.includes("sprint")) tags.push("Sprint")
  if (lower.includes("pr")) tags.push("Product")
  if (tags.length === 0) tags.push("Docs")

  const suggestions: DocumentAnalysis["suggestions"] = []
  if (actionItems.length > 0) {
    suggestions.push({ type: "positive", message: `${actionItems.length} action items identified` })
  } else {
    suggestions.push({ type: "warning", message: "Add action verbs to extract tasks automatically" })
  }
  if (!/conclusion/i.test(plain)) {
    suggestions.push({ type: "warning", message: "Missing conclusion" })
  }

  const healthScoreBase = 60
  const healthScore =
    healthScoreBase +
    (actionItems.length > 0 ? 20 : -10) +
    (decisions.length > 0 ? 10 : 0) +
    (suggestions.some((s) => s.type === "warning") ? -10 : 0)

  return {
    title,
    summary,
    actionItems,
    timeline,
    decisions,
    tags,
    suggestions,
    healthScore: clamp(Math.round(healthScore), 0, 100),
    readingTimeMinutes: estimateReadingTimeMinutes(plain),
  }
}

export class NvidiaProvider implements AIProvider {
  async analyze(content: string): Promise<DocumentAnalysis> {
    const plainContent = toAnalysisText(content)
    const apiKey = process.env.NVIDIA_API_KEY
    const baseUrl = process.env.NVIDIA_BASE_URL
    const model = process.env.NVIDIA_MODEL

    if (!apiKey || !baseUrl || !model) {
      return heuristicAnalyze(plainContent)
    }

    const system =
      "You extract structured information from documents for a team knowledge workflow. Return only valid JSON following the schema."

    const user =
      `Analyze the following document content.\n\n` +
      `Return JSON with keys: title, summary, actionItems[{owner,task,due?}], timeline[{date,event}], decisions[string[]], tags[string[]], suggestions[{type,message}[]], healthScore[number 0..100], readingTimeMinutes[number].\n\n` +
      `Document:\n${plainContent}`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        console.warn(`NVIDIA API error ${res.status}, using heuristic fallback`)
        return heuristicAnalyze(plainContent)
      }

      const text = await res.text()
      if (!text.trim()) {
        console.warn("NVIDIA API returned empty body, using heuristic fallback")
        return heuristicAnalyze(plainContent)
      }

      let json: {
        choices?: Array<{ message?: { content?: string } }>
        output?: { choices?: Array<{ message?: { content?: string } }> }
        output_text?: string
      }
      try {
        json = JSON.parse(text)
      } catch {
        console.warn("NVIDIA API returned invalid JSON, using heuristic fallback")
        return heuristicAnalyze(plainContent)
      }

      const raw =
        json?.choices?.[0]?.message?.content ??
        json?.output?.choices?.[0]?.message?.content ??
        json?.output_text ??
        ""

      const extracted = this.extractJson(raw)
      const parsed = documentAnalysisSchema.safeParse(extracted)
      if (!parsed.success) return heuristicAnalyze(plainContent)

      return parsed.data
    } catch (err) {
      console.warn("NVIDIA API request failed, using heuristic fallback", err)
      return heuristicAnalyze(plainContent)
    }
  }

  async generateTemplate(templateType: string): Promise<{ title: string; content: string }> {
    const templates: Record<string, { title: string; content: string }> = {
      blank: { title: "Untitled", content: "# Untitled\n\n" },
      "meeting-notes": {
        title: "Meeting Notes",
        content:
          "# Meeting Notes\n\n## Agenda\n- \n\n## Notes\n- \n\n## Action Items\n- Owner: Task (Due)\n\n## Next Steps\n- ",
      },
      prd: {
        title: "Product Requirements — PRD",
        content:
          "# Product Requirements — PRD\n\n## Problem\n- \n\n## Goals\n- \n\n## Requirements\n- \n\n## Success Metrics\n- ",
      },
    }

    const normalized = templateType.trim().toLowerCase()
    return (
      templates[normalized] ?? {
        title: "New Document",
        content: "# New Document\n\n",
      }
    )
  }

  private extractJson(raw: string): unknown {
    if (!raw) return {}
    try {
      return JSON.parse(raw)
    } catch {
      // fall through
    }

    const start = raw.indexOf("{")
    const end = raw.lastIndexOf("}")
    if (start === -1 || end === -1 || end <= start) return {}

    const slice = raw.slice(start, end + 1)
    try {
      return JSON.parse(slice)
    } catch {
      return {}
    }
  }
}

