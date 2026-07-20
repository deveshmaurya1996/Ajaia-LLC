const SUPPORTED_EXTENSIONS = ["txt", "md", "markdown", "docx"] as const

export const IMPORT_FORMAT_LABEL = ".txt, .md, .docx"

export type DocumentContentFormat = "markdown" | "html"

export function isSupportedImportFile(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
}

function htmlToPlainText(html: string): string {
  if (!html?.trim()) return ""

  if (typeof document !== "undefined") {
    const el = document.createElement("div")
    el.innerHTML = html
    return (el.textContent ?? el.innerText ?? "").trim()
  }

  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  )
}

function toPlainText(value: string): string {
  return stripInlineMarkdown(htmlToPlainText(value))
    .replace(/^>\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function toAnalysisText(content: string): string {
  const { body } = normalizeStoredContent(content)
  return body.startsWith("<") ? htmlToPlainText(body) : body
}

function titleFromSourceText(text: string, fallback = "Untitled"): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading?.[1]) return stripInlineMarkdown(heading[1]).trim().slice(0, 120)
  }

  const first = lines[0]
  if (first && !first.startsWith(">")) {
    return stripInlineMarkdown(first.replace(/^#+\s*/, "")).trim().slice(0, 120)
  }

  return fallback
}

export function normalizeTitle(title: string, fallback = "Untitled"): string {
  let plain = toPlainText(title)
  plain = plain.split(/\s>\s|\n>/)[0]?.trim() ?? plain
  plain = plain.replace(/^>\s+/, "").replace(/^#+\s*/, "").trim()
  plain = stripInlineMarkdown(plain)
  return (plain.split(/\n/)[0]?.trim() ?? plain).slice(0, 120) || fallback
}

function isBrokenMarkdownHtml(html: string): boolean {
  return /<p>\s*(#{1,6}|&gt;|>|\*|\*\*)/.test(html)
}

function legacyBrokenHtmlToMarkdown(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  )
}

/** Pick TipTap load mode: @tiptap/markdown vs HTML. Repairs legacy bad imports. */
export function normalizeStoredContent(content: string): {
  body: string
  format: DocumentContentFormat
} {
  const trimmed = content.trim()
  if (!trimmed) return { body: "<p></p>", format: "html" }

  if (trimmed.startsWith("<") && isBrokenMarkdownHtml(trimmed)) {
    return { body: legacyBrokenHtmlToMarkdown(trimmed), format: "markdown" }
  }

  if (!trimmed.startsWith("<")) {
    return { body: trimmed, format: "markdown" }
  }

  return { body: trimmed, format: "html" }
}

export function prepareImportedText(rawText: string, filename: string) {
  const fallbackTitle = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
  const source = rawText.trim()
  return {
    title: normalizeTitle(titleFromSourceText(source, fallbackTitle), fallbackTitle),
    content: source,
  }
}

export function prepareImportedDocx(html: string, filename: string) {
  const fallbackTitle = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
  const title = normalizeTitle(
    titleFromSourceText(htmlToPlainText(html), fallbackTitle),
    fallbackTitle,
  )
  return { title, content: html.trim() || "<p></p>" }
}

export function sanitizeAnalysisText(text: string): string {
  return toPlainText(text)
}

export function sanitizeAnalysisList(items: string[]): string[] {
  return items.map(sanitizeAnalysisText).filter(Boolean)
}

// Used by heuristic AI title extraction
export { titleFromSourceText, htmlToPlainText, toPlainText }
