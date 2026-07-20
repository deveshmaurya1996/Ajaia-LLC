import { prisma } from "@/server/db"
import { shareRepository } from "@/server/repositories/share.repository"
import { forbidden, notFound } from "@/server/http/api-route"

export const shareService = {
  async shareDocument({
    fromUserId,
    documentId,
    toUserId,
    permission = "editor",
  }: {
    fromUserId: string
    documentId: string
    toUserId: string
    permission?: string
  }) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, authorId: true },
    })

    if (!doc) throw notFound("Document not found")
    if (doc.authorId !== fromUserId) throw forbidden()

    await shareRepository.upsertShare({
      documentId,
      userId: toUserId,
      permission,
    })

    await prisma.activity.create({
      data: {
        type: "shared",
        documentId,
        userId: fromUserId,
        metadata: { toUserId, permission },
      },
    })

    return { ok: true as const }
  },
}

