import { documentAnalysisSchema } from "../schemas/analysis.schema"
import type { AIProvider, DocumentAnalysis } from "./ai-provider.interface"
import { toAnalysisText, toPlainText, titleFromSourceText } from "@/lib/document-content"
import {
  buildHeuristicSummary,
  extractActionItemsFromText,
  inferDocumentTags,
  isCopyPasteSummary,
} from "@/lib/document-insights"

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
  const summary = buildHeuristicSummary(plain, title)

  const actionItems = extractActionItemsFromText(plain)
  const dueRegex = dueKeywords.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const taskRegex = new RegExp(
    `\\b([A-Z][a-zA-Z]+)\\b\\s+(?:will\\s+)?([a-zA-Z]+)\\b.*?\\b(${dueRegex})\\b`,
    "gi",
  )

  for (;;) {
    const match = taskRegex.exec(plain)
    if (!match) break
    const owner = match[1]
    const task = match[2]
    const due = match[3]
    const exists = actionItems.some((t) => t.owner === owner && t.task === task)
    if (!exists) actionItems.push({ owner, task, due })
  }

  const timeline: DocumentAnalysis["timeline"] = actionItems
    .filter((t) => t.due)
    .map((t) => ({ date: t.due!, event: `${t.owner}: ${t.task}` }))

  const decisions: string[] = []
  const decisionMatch = plain.match(/Decision[:\-]\s*([^\n.]+)/i)
  if (decisionMatch?.[1]) {
    decisions.push(
      ...decisionMatch[1]
        .split(/,|and/i)
        .map((d) => toPlainText(d))
        .filter(Boolean)
        .slice(0, 5),
    )
  }

  const tags = inferDocumentTags(plain)

  const suggestions: DocumentAnalysis["suggestions"] = []
  if (actionItems.length > 0) {
    suggestions.push({ type: "positive", message: `${actionItems.length} action item(s) identified` })
  } else {
    suggestions.push({ type: "warning", message: "Add named owners and due dates for action items" })
  }
  if (substantiveLinesEmpty(plain)) {
    suggestions.push({ type: "warning", message: "Sections are still mostly empty — add meeting notes or details" })
  }

  const healthScoreBase = 55
  const healthScore =
    healthScoreBase +
    (actionItems.length > 0 ? 20 : 0) +
    (decisions.length > 0 ? 10 : 0) +
    (substantiveLinesEmpty(plain) ? -15 : 10) +
    (suggestions.some((s) => s.type === "warning") ? -5 : 5)

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

function substantiveLinesEmpty(plain: string): boolean {
  return !plain
    .split(/\r?\n/)
    .some((line) => {
      const t = line.replace(/^#{1,6}\s+/, "").replace(/^[-*+]\s+/, "").trim()
      return t.length > 12 && !/^owner:\s*task/i.test(t)
    })
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
      "You extract structured insights from documents. Return only valid JSON. " +
      "The summary must be 1-2 original sentences describing what the document is about — " +
      "never copy headings, markdown syntax, or bullet labels verbatim."

    const user =
      `Analyze the document below.\n\n` +
      `Return JSON: title, summary (1-2 sentences, plain English, no # headings), ` +
      `actionItems[{owner,task,due?}], timeline[{date,event}], decisions[string[]], ` +
      `tags[string[]], suggestions[{type,message}[]], healthScore[0-100], readingTimeMinutes.\n\n` +
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

      const result = parsed.data
      if (isCopyPasteSummary(result.summary, plainContent)) {
        result.summary = buildHeuristicSummary(plainContent, result.title)
      }

      return result
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

