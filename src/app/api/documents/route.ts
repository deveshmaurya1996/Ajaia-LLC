import { NextRequest } from "next/server"
import { getUserIdFromRequest } from "@/server/request/get-user-id"
import { documentController } from "@/server/controllers/document.controller"
import { handleApiRoute } from "@/server/http/api-route"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const userId = getUserIdFromRequest(req)
  const filter = url.searchParams.get("filter") ?? undefined
  const take = Number(url.searchParams.get("take") ?? "") || undefined

  return handleApiRoute(() => documentController.listDocuments(userId, filter, take))
}
