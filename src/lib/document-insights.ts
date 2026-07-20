import { toPlainText, titleFromSourceText } from "@/lib/document-content"

const TEMPLATE_LINE = /^(owner:\s*task\s*\(due\)|task\s*\(due\)|-\s*$)/i

export function isCopyPasteSummary(summary: string, sourcePlain: string): boolean {
  const s = summary.trim()
  if (!s) return true
  if (/^#{1,6}\s/.test(s) || s.includes(" ## ")) return true
  if (s.includes("## Agenda") || s.includes("## Notes")) return true

  const summaryNorm = toPlainText(s).toLowerCase()
  const sourceNorm = toPlainText(sourcePlain).toLowerCase()
  if (sourceNorm.length > 40 && summaryNorm.length > 40) {
    const prefix = summaryNorm.slice(0, Math.min(50, summaryNorm.length))
    if (sourceNorm.includes(prefix)) return true
  }

  return false
}

function markdownSections(plain: string): string[] {
  return [...plain.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map((m) => m[1].trim())
    .filter(Boolean)
}

function substantiveLines(plain: string): string[] {
  return plain
    .split(/\r?\n/)
    .map((line) => {
      const isHeading = /^#{1,6}\s+/.test(line)
      const text = line
        .replace(/^#{1,6}\s+/, "")
        .replace(/^[-*+]\s+/, "")
        .replace(/^\d+\.\s+/, "")
        .trim()
      return { text, isHeading }
    })
    .filter(({ text, isHeading }) => {
      if (!text || isHeading || TEMPLATE_LINE.test(text)) return false
      if (text.length < 12) return false
      if (/^owner:\s*task\b/i.test(text)) return false
      return /[a-zA-Z]{3,}/.test(text)
    })
    .map(({ text }) => text)
}

export function extractActionItemsFromText(plain: string) {
  const items: Array<{ owner: string; task: string; due?: string }> = []

  for (const line of plain.split(/\r?\n/)) {
    const cleaned = line.replace(/^[-*+]\s+/, "").trim()
    const match = cleaned.match(/^([A-Za-z][A-Za-z\s.'-]{0,30}):\s*(.+?)(?:\s*\(([^)]+)\))?\s*$/i)
    if (!match) continue

    const owner = match[1].trim()
    const task = match[2].trim()
    const due = match[3]?.trim()

    if (/^task$/i.test(task) && /^due$/i.test(due ?? "")) continue
    if (task.length < 2) continue

    items.push({ owner, task, due: due || undefined })
  }

  return items.slice(0, 8)
}

export function buildHeuristicSummary(sourcePlain: string, titleHint?: string): string {
  const title = titleFromSourceText(sourcePlain, titleHint ?? "Document")
  const prose = substantiveLines(sourcePlain)
  const sections = markdownSections(sourcePlain).filter(
    (s) => s.toLowerCase() !== title.toLowerCase(),
  )
  const words = toPlainText(sourcePlain).split(/\s+/).filter(Boolean).length

  if (prose.length > 0) {
    const lead = prose.slice(0, 2).join(" ")
    return toPlainText(lead).slice(0, 320)
  }

  if (sections.length > 0) {
    const names = sections.slice(0, 5).join(", ")
    return `${title} covers ${names}. Fill in each section to build a detailed summary.`
  }

  if (words < 25) {
    return "Document is mostly a template — add notes and action items to generate richer insights."
  }

  return `${title} (${words} words). Key points will appear here as you add substantive content.`
}

export function inferDocumentTags(sourcePlain: string): string[] {
  const lower = sourcePlain.toLowerCase()
  const tags: string[] = []
  if (/meeting|agenda|standup/i.test(lower)) tags.push("Meeting")
  if (/requirement|prd|problem statement/i.test(lower)) tags.push("Product")
  if (/architecture|decision|adr/i.test(lower)) tags.push("Engineering")
  if (/sprint|roadmap/i.test(lower)) tags.push("Planning")
  if (tags.length === 0) tags.push("Docs")
  return tags
}
