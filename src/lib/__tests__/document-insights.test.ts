import { describe, expect, it } from "vitest"
import {
  buildHeuristicSummary,
  extractActionItemsFromText,
  isCopyPasteSummary,
} from "../document-insights"

const MEETING_NOTES = `# Meeting Notes

## Agenda
-

## Notes
-

## Action Items
- Owner: Task (Due)

## Next Steps
- `

describe("document-insights", () => {
  it("builds a section-based summary for empty meeting notes template", () => {
    const summary = buildHeuristicSummary(MEETING_NOTES, "Meeting Notes")
    expect(summary).not.toMatch(/^#/)
    expect(summary).not.toContain("## Agenda")
    expect(summary.toLowerCase()).toContain("agenda")
    expect(summary.toLowerCase()).toContain("meeting notes")
  })

  it("detects copy-pasted markdown as low-quality summary", () => {
    const bad =
      "# Meeting Notes ## Agenda - ## Notes - ## Action Items - Owner: Task (Due) ## Next Steps -"
    expect(isCopyPasteSummary(bad, MEETING_NOTES)).toBe(true)
  })

  it("accepts a real prose summary", () => {
    const good =
      "Team sync covering sprint progress, blockers, and follow-ups for the release."
    expect(isCopyPasteSummary(good, MEETING_NOTES)).toBe(false)
  })

  it("extracts real action items but skips template placeholders", () => {
    const text = `${MEETING_NOTES}
- Alice: Ship API docs (Friday)
- Owner: Task (Due)
`
    const items = extractActionItemsFromText(text)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ owner: "Alice", task: "Ship API docs", due: "Friday" })
  })
})
