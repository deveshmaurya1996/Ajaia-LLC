import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { taskRepository } from "@/server/repositories/task.repository"
import { prisma } from "@/server/db"
import { forbidden, handleApiRoute, notFound } from "@/server/http/api-route"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = getUserIdFromRequest(req)
  const { id: taskId } = await context.params
  const payload = await req.json()
  const completed = Boolean(payload.completed)

  return handleApiRoute(async () => {
    const task = await prisma.extractedTask.findUnique({
      where: { id: taskId },
      select: { document: { select: { authorId: true } } },
    })

    if (!task) throw notFound()
    if (task.document.authorId !== userId) throw forbidden()

    await taskRepository.setTaskCompleted(taskId, completed)
    return { ok: true as const }
  })
}
