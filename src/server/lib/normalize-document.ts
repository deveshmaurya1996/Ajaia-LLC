import {
  normalizeTitle,
  normalizeStoredContent,
  sanitizeAnalysisList,
  sanitizeAnalysisText,
  toAnalysisText,
} from "@/lib/document-content"
import { buildHeuristicSummary, isCopyPasteSummary } from "@/lib/document-insights"
import type { DocumentAnalysis } from "@/server/ai/providers/ai-provider.interface"

type DocumentRecord = {
  id: string
  title: string
  content: string
  summary: string | null
  healthScore: number | null
  readingTime: number | null
  timeline: unknown
  decisions: unknown
  tags: unknown
  suggestions: unknown
  templateType: string | null
  updatedAt: Date
  authorId: string
  tasks?: unknown
}

export function normalizeDocumentRecord<T extends DocumentRecord>(doc: T) {
  const { body, format } = normalizeStoredContent(doc.content)

  return {
    ...doc,
    title: normalizeTitle(doc.title),
    content: body,
    contentFormat: format,
    summary: doc.summary ? sanitizeAnalysisText(doc.summary) : null,
    decisions: sanitizeJsonStringList(doc.decisions),
    tags: sanitizeJsonStringList(doc.tags),
    suggestions: sanitizeJsonSuggestions(doc.suggestions),
  }
}

function sanitizeJsonStringList(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return sanitizeAnalysisList(value.filter((v): v is string => typeof v === "string"))
}

function sanitizeJsonSuggestions(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value
    .filter((s): s is { type: string; message: string } => {
      return Boolean(s && typeof s === "object" && "message" in s)
    })
    .map((s) => ({
      type: s.type === "warning" ? "warning" : "positive",
      message: sanitizeAnalysisText(String(s.message)),
    }))
    .filter((s) => s.message.length > 0)
}

export function sanitizeAnalysisResult(
  analysis: DocumentAnalysis,
  sourcePlain?: string,
): DocumentAnalysis {
  const plain = sourcePlain ?? ""
  let summary = sanitizeAnalysisText(analysis.summary)
  if (plain && isCopyPasteSummary(summary, plain)) {
    summary = buildHeuristicSummary(plain, analysis.title)
  }

  return {
    ...analysis,
    title: sanitizeAnalysisText(analysis.title),
    summary,
    decisions: sanitizeAnalysisList(analysis.decisions),
    tags: sanitizeAnalysisList(analysis.tags),
    timeline: analysis.timeline.map((t) => ({
      date: sanitizeAnalysisText(t.date),
      event: sanitizeAnalysisText(t.event),
    })),
    actionItems: analysis.actionItems.map((t) => ({
      owner: sanitizeAnalysisText(t.owner),
      task: sanitizeAnalysisText(t.task),
      due: t.due ? sanitizeAnalysisText(t.due) : undefined,
    })),
    suggestions: analysis.suggestions.map((s) => ({
      type: s.type,
      message: sanitizeAnalysisText(s.message),
    })),
  }
}

export function plainTextForAnalysis(content: string): string {
  return toAnalysisText(content)
}
