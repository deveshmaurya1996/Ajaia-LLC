import { prisma } from "@/server/db"

export const shareRepository = {
  async upsertShare({
    documentId,
    userId,
    permission = "editor",
  }: {
    documentId: string
    userId: string
    permission?: string
  }) {
    return prisma.documentShare.upsert({
      where: { documentId_userId: { documentId, userId } },
      create: { documentId, userId, permission },
      update: { permission },
      select: { id: true },
    })
  },
}

