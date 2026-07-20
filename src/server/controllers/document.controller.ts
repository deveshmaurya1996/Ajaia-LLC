import { z } from "zod"
import { documentService } from "@/server/services/document.service"
import { documentRepository } from "@/server/repositories/document.repository"
import { badRequest, forbidden, notFound } from "@/server/http/api-route"
import { normalizeDocumentRecord } from "@/server/lib/normalize-document"
import { normalizeTitle } from "@/lib/document-content"

const filterSchema = z.enum(["mine", "shared", "recent"])

const updateDocumentSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().min(0).optional(),
  })
  .refine((v) => v.title !== undefined || v.content !== undefined, "Nothing to update")

export const documentController = {
  async listDocuments(userId: string, filter: string | undefined, take?: number) {
    const parsed = filterSchema.safeParse(filter)
    const resolvedFilter = parsed.success ? parsed.data : "recent"
    const resolvedTake = typeof take === "number" ? take : undefined

    return documentService.listDocuments({
      userId,
      filter: resolvedFilter,
      take: resolvedTake,
    })
  },

  async pendingTasks(userId: string) {
    return documentService.getPendingTasks(userId)
  },

  async search(userId: string, query: string) {
    if (!query.trim()) return []
    return documentService.searchDocuments({ userId, query })
  },

  async getDocumentById(userId: string, documentId: string) {
    const doc = await documentRepository.getDocumentVisibleToUser(documentId, userId)
    if (!doc) return null

    const normalized = normalizeDocumentRecord(doc)
    if (normalized.title !== doc.title || normalized.content !== doc.content) {
      await documentRepository.updateDocument({
        documentId,
        title: normalized.title,
        content: normalized.content,
      })
    }

    return normalized
  },

  async updateDocumentById(userId: string, documentId: string, payload: unknown) {
    const parsed = updateDocumentSchema.safeParse(payload)
    if (!parsed.success) throw badRequest()

    const doc = await documentRepository.getDocumentVisibleToUser(documentId, userId)
    if (!doc) throw notFound()

    return documentRepository.updateDocument({
      documentId,
      title: parsed.data.title !== undefined ? normalizeTitle(parsed.data.title) : undefined,
      content: parsed.data.content,
    })
  },

  async deleteDocumentById(userId: string, documentId: string) {
    const doc = await documentRepository.getDocumentVisibleToUser(documentId, userId)
    if (!doc) throw notFound()
    if (doc.authorId !== userId) throw forbidden("Only the owner can delete this document")

    await documentRepository.deleteDocument(documentId)
    return { ok: true as const }
  },
}

