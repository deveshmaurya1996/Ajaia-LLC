import { prisma } from "@/server/db"
import { documentRepository } from "@/server/repositories/document.repository"
import { taskRepository } from "@/server/repositories/task.repository"
import { getAIProvider } from "@/server/ai/providers"
import type { DocumentAnalysis } from "@/server/ai/providers/ai-provider.interface"
import { notFound } from "@/server/http/api-route"
import {
  plainTextForAnalysis,
  sanitizeAnalysisResult,
} from "@/server/lib/normalize-document"
import { normalizeTitle } from "@/lib/document-content"

export const documentAIService = {
  async analyzeAndPersist({
    documentId,
    userId,
    content,
  }: {
    documentId: string
    userId: string
    content: string
  }) {
    const doc = await documentRepository.getDocumentVisibleToUser(documentId, userId)
    if (!doc) throw notFound()

    const provider = getAIProvider()
    const analysis = sanitizeAnalysisResult(
      (await provider.analyze(plainTextForAnalysis(content))) as DocumentAnalysis,
    )

    await taskRepository.replaceExtractedTasks(documentId, analysis.actionItems)
    await documentRepository.updateDocumentAIResults({
      documentId,
      analysis,
    })

    await prisma.activity.create({
      data: {
        type: "ai_analyzed",
        documentId,
        userId,
        metadata: { healthScore: analysis.healthScore },
      },
    })

    return analysis
  },

  async generateTemplateAndCreateDocument({
    authorId,
    templateType,
  }: {
    authorId: string
    templateType: string
  }) {
    const provider = getAIProvider()
    const { title, content } = await provider.generateTemplate(templateType)
    const doc = await documentRepository.createDocument({
      authorId,
      title,
      content,
      templateType,
    })
    return doc
  },

  async importDocument({
    authorId,
    content,
    titleHint,
  }: {
    authorId: string
    content: string
    titleHint?: string
  }) {
    const doc = await documentRepository.createDocument({
      authorId,
      title: normalizeTitle(titleHint?.trim() || "Imported document"),
      content,
    })

    await prisma.activity.create({
      data: {
        type: "imported",
        documentId: doc.id,
        userId: authorId,
        metadata: { imported: true },
      },
    })

    return { documentId: doc.id }
  },
}

