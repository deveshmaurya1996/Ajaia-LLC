import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { aiController } from "@/server/controllers/ai.controller"
import { handleApiRoute } from "@/server/http/api-route"

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  const payload = await req.json()

  return handleApiRoute(() => aiController.analyzeDocument(userId, payload))
}
