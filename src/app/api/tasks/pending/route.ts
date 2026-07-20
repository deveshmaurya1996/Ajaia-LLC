import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { documentController } from "@/server/controllers/document.controller"
import { handleApiRoute } from "@/server/http/api-route"

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)

  return handleApiRoute(() => documentController.pendingTasks(userId))
}
