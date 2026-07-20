import { z } from "zod"
import { documentAIService } from "@/server/services/document-ai.service"
import { badRequest } from "@/server/http/api-route"

const analyzeSchema = z.object({
  documentId: z.string().min(1),
  content: z.string().min(1),
})

const templateSchema = z.object({
  templateType: z.string().min(1),
})

export const aiController = {
  async analyzeDocument(userId: string, payload: unknown) {
    const parsed = analyzeSchema.safeParse(payload)
    if (!parsed.success) throw badRequest()

    return documentAIService.analyzeAndPersist({
      documentId: parsed.data.documentId,
      userId,
      content: parsed.data.content,
    })
  },

  async createFromTemplate(userId: string, payload: unknown) {
    const parsed = templateSchema.safeParse(payload)
    if (!parsed.success) throw badRequest()

    const doc = await documentAIService.generateTemplateAndCreateDocument({
      authorId: userId,
      templateType: parsed.data.templateType,
    })

    return { documentId: doc.id }
  },
}

