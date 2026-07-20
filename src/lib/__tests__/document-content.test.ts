import { describe, expect, it } from "vitest"
import {
  normalizeStoredContent,
  normalizeTitle,
  prepareImportedText,
  sanitizeAnalysisText,
} from "../document-content"

const SAMPLE_MD = `# 🦈 Bull Shark Projects — Full Implementation Context

> **Generated for development handoff.**

## Overview

- Item one
- **Bold text**`

describe("document-content", () => {
  it("prepares markdown import with plain title", () => {
    const payload = prepareImportedText(SAMPLE_MD, "bull-shark.md")
    expect(payload.content).toContain("# 🦈 Bull Shark")
    expect(payload.title).toBe("🦈 Bull Shark Projects — Full Implementation Context")
    expect(payload.title).not.toContain("Generated")
  })

  it("detects markdown vs html for TipTap", () => {
    expect(normalizeStoredContent(SAMPLE_MD).format).toBe("markdown")
    expect(normalizeStoredContent("<h1>Title</h1><p>Body</p>").format).toBe("html")
  })

  it("repairs legacy broken HTML into markdown", () => {
    const broken =
      "<p># 🦈 Bull Shark Projects</p><p>&gt; **Generated handoff.**</p>"
    const { body, format } = normalizeStoredContent(broken)
    expect(format).toBe("markdown")
    expect(body).toContain("# 🦈 Bull Shark Projects")
    expect(body).toContain("> **Generated handoff.**")
  })

  it("strips blockquote pollution from titles", () => {
    expect(
      normalizeTitle(
        "🦈 Bull Shark Projects — Full Implementation Context > **Generated IT",
      ),
    ).toBe("🦈 Bull Shark Projects — Full Implementation Context")
  })

  it("sanitizes analysis text", () => {
    expect(sanitizeAnalysisText("> **Generated**")).toBe("Generated")
  })
})
