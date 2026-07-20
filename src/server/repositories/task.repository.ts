import { prisma } from "@/server/db"
import type { ActionItem } from "@/server/ai/providers/ai-provider.interface"

export const taskRepository = {
  async replaceExtractedTasks(documentId: string, tasks: ActionItem[]) {
    await prisma.extractedTask.deleteMany({ where: { documentId } })
    if (tasks.length === 0) return

    await prisma.extractedTask.createMany({
      data: tasks.map((t) => ({
        documentId,
        owner: t.owner,
        action: t.task,
        dueDate: t.due,
        completed: false,
      })),
    })
  },

  async setTaskCompleted(taskId: string, completed: boolean) {
    await prisma.extractedTask.update({
      where: { id: taskId },
      data: { completed },
    })
  },

  async listPendingTasksForUser(userId: string) {
    return prisma.extractedTask.findMany({
      where: { completed: false, document: { authorId: userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        owner: true,
        action: true,
        dueDate: true,
        documentId: true,
        document: { select: { title: true } },
      },
      take: 20,
    })
  },
}

