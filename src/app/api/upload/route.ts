import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { documentAIService } from "@/server/services/document-ai.service"
import { badRequest, handleApiRoute } from "@/server/http/api-route"
import { normalizeTitle } from "@/lib/document-content"

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  const payload = await req.json()
  const content = String(payload?.content ?? "").trim()
  const titleHint = payload?.title ? normalizeTitle(String(payload.title)) : undefined

  return handleApiRoute(async () => {
    if (!content) throw badRequest("Missing content")

    return documentAIService.importDocument({
      authorId: userId,
      content,
      titleHint,
    })
  })
}
