import { prisma } from "@/server/db"
import { Prisma } from "@prisma/client"
import uniq from "lodash/uniq"

type DocumentFilter = "mine" | "shared" | "recent"

function unique<T>(items: T[]) {
  return uniq(items)
}

async function getVisibleDocumentIds(userId: string) {
  const [mine, shared] = await Promise.all([
    prisma.document.findMany({
      where: { authorId: userId },
      select: { id: true },
    }),
    prisma.documentShare.findMany({
      where: { userId },
      select: { documentId: true },
    }),
  ])

  return unique([...mine.map((d) => d.id), ...shared.map((s) => s.documentId)])
}

export const documentRepository = {
  async listForDashboard({
    userId,
    filter,
    take = 8,
  }: {
    userId: string
    filter: DocumentFilter
    take?: number
  }) {
    if (filter === "mine") {
      return prisma.document.findMany({
        where: { authorId: userId },
        orderBy: { updatedAt: "desc" },
        take,
        select: {
          id: true,
          title: true,
          templateType: true,
          tags: true,
          healthScore: true,
          updatedAt: true,
        },
      })
    }

    if (filter === "shared") {
      const ids = await getVisibleDocumentIds(userId)
      return prisma.document.findMany({
        where: { id: { in: ids }, authorId: { not: userId } },
        orderBy: { updatedAt: "desc" },
        take,
        select: {
          id: true,
          title: true,
          templateType: true,
          tags: true,
          healthScore: true,
          updatedAt: true,
        },
      })
    }

    const ids = await getVisibleDocumentIds(userId)
    return prisma.document.findMany({
      where: { id: { in: ids } },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        title: true,
        templateType: true,
        tags: true,
        healthScore: true,
        updatedAt: true,
      },
    })
  },

  async getDocumentVisibleToUser(documentId: string, userId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        content: true,
        templateType: true,
        summary: true,
        healthScore: true,
        readingTime: true,
        timeline: true,
        decisions: true,
        tags: true,
        suggestions: true,
        updatedAt: true,
        authorId: true,
        tasks: {
          select: {
            id: true,
            owner: true,
            action: true,
            dueDate: true,
            completed: true,
          },
        },
      },
    })

    if (!doc) return null
    if (doc.authorId === userId) return doc
    const share = await prisma.documentShare.findUnique({
      where: { documentId_userId: { documentId, userId } },
      select: { permission: true },
    })
    if (!share) return null
    return doc
  },

  async createDocument({
    authorId,
    title,
    content,
    templateType,
  }: {
    authorId: string
    title: string
    content: string
    templateType?: string
  }) {
    return prisma.document.create({
      data: { authorId, title, content, templateType },
      select: { id: true },
    })
  },

  async updateDocument({
    documentId,
    title,
    content,
  }: {
    documentId: string
    title?: string
    content?: string
  }) {
    return prisma.document.update({
      where: { id: documentId },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
      },
      select: { id: true },
    })
  },

  async updateDocumentAIResults({
    documentId,
    analysis,
  }: {
    documentId: string
    analysis: {
      title: string
      summary: string
      timeline: Array<{ date: string; event: string }>
      decisions: string[]
      tags: string[]
      suggestions: Array<{ type: "positive" | "warning"; message: string }>
      healthScore: number
      readingTimeMinutes: number
    }
  }) {
    return prisma.document.update({
      where: { id: documentId },
      data: {
        summary: analysis.summary,
        timeline: analysis.timeline as Prisma.InputJsonValue,
        decisions: analysis.decisions as Prisma.InputJsonValue,
        tags: analysis.tags as Prisma.InputJsonValue,
        suggestions: analysis.suggestions as Prisma.InputJsonValue,
        healthScore: analysis.healthScore,
        readingTime: analysis.readingTimeMinutes,
      },
      select: { id: true },
    })
  },

  async deleteDocument(documentId: string) {
    await prisma.documentShare.deleteMany({ where: { documentId } })
    await prisma.extractedTask.deleteMany({ where: { documentId } })
    await prisma.document.delete({ where: { id: documentId } })
  },

  async search({
    userId,
    query,
    take = 10,
  }: {
    userId: string
    query: string
    take?: number
  }) {
    const ids = await getVisibleDocumentIds(userId)
    return prisma.document.findMany({
      where: {
        id: { in: ids },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        title: true,
        summary: true,
        updatedAt: true,
      },
    })
  },
}

