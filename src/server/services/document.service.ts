import { documentRepository } from "@/server/repositories/document.repository"
import { taskRepository } from "@/server/repositories/task.repository"

export const documentService = {
  async listDocuments({
    userId,
    filter,
    take = 8,
  }: {
    userId: string
    filter: "mine" | "shared" | "recent"
    take?: number
  }) {
    return documentRepository.listForDashboard({ userId, filter, take })
  },

  async getPendingTasks(userId: string) {
    const tasks = await taskRepository.listPendingTasksForUser(userId)
    return tasks.map((t) => ({
      id: t.id,
      owner: t.owner,
      task: t.action,
      dueDate: t.dueDate,
      documentId: t.documentId,
      documentTitle: t.document?.title ?? "",
    }))
  },

  async searchDocuments({ userId, query }: { userId: string; query: string }) {
    return documentRepository.search({ userId, query })
  },
}

