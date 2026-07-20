import { describe, it, expect } from "vitest"
import { documentAnalysisSchema } from "../../../server/ai/schemas/analysis.schema"

describe("documentAnalysisSchema", () => {
  it("accepts a valid analysis payload", () => {
    const input = {
      title: "Sprint Planning Meeting",
      summary: "Team aligned on the sprint plan.",
      actionItems: [
        { owner: "Rahul", task: "Deploy", due: "Tomorrow" },
        { owner: "Devesh", task: "Review", due: "Friday" },
      ],
      timeline: [
        { date: "Tomorrow", event: "Deploy" },
        { date: "Friday", event: "Review" },
      ],
      decisions: ["Use PostgreSQL"],
      tags: ["Sprint", "Backend"],
      suggestions: [
        { type: "positive", message: "Action items identified" },
        { type: "warning", message: "Missing conclusion" },
      ],
      healthScore: 92,
      readingTimeMinutes: 4,
    }

    const result = documentAnalysisSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("rejects invalid payloads", () => {
    const input = {
      // missing required keys
      title: "",
    }

    const result = documentAnalysisSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

