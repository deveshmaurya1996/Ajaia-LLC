import { z } from "zod"

export const documentAnalysisSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  actionItems: z.array(
    z.object({
      owner: z.string().min(1),
      task: z.string().min(1),
      due: z.string().optional(),
    }),
  ),
  timeline: z.array(
    z.object({
      date: z.string().min(1),
      event: z.string().min(1),
    }),
  ),
  decisions: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  suggestions: z.array(
    z.object({
      type: z.enum(["positive", "warning"]),
      message: z.string().min(1),
    }),
  ),
  healthScore: z.number().min(0).max(100),
  readingTimeMinutes: z.number().int().min(1),
})

export type DocumentAnalysisSchema = z.infer<typeof documentAnalysisSchema>

