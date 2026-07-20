import type { NextRequest } from "next/server"

const fallbackUserId = "user_alice"

export function getUserIdFromRequest(req: NextRequest) {
  const headerUserId = req.headers.get("x-user-id")
  return headerUserId ?? fallbackUserId
}

