import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { documentController } from "@/server/controllers/document.controller"
import { handleApiRoute, notFound } from "@/server/http/api-route"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = getUserIdFromRequest(req)
  const { id } = await context.params

  return handleApiRoute(async () => {
    const data = await documentController.getDocumentById(userId, id)
    if (!data) throw notFound()
    return data
  })
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = getUserIdFromRequest(req)
  const { id } = await context.params
  const payload = await req.json()

  return handleApiRoute(() => documentController.updateDocumentById(userId, id, payload))
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const userId = getUserIdFromRequest(req)
  const { id } = await context.params

  return handleApiRoute(() => documentController.deleteDocumentById(userId, id))
}
