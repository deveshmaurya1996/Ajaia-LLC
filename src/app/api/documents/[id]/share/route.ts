import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { shareController } from "@/server/controllers/share.controller"
import { handleApiRoute } from "@/server/http/api-route"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const fromUserId = getUserIdFromRequest(req)
  const payload = await req.json()
  const { id } = await context.params

  return handleApiRoute(() =>
    shareController.shareDocument(fromUserId, {
      documentId: id,
      toUserId: payload.toUserId,
      permission: payload.permission,
    }),
  )
}
