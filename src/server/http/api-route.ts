import { NextResponse } from "next/server"

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "HttpError"
    this.status = status
  }
}

export function notFound(message = "Not found") {
  return new HttpError(404, message)
}

export function badRequest(message = "Invalid payload") {
  return new HttpError(400, message)
}

export function forbidden(message = "Not allowed") {
  return new HttpError(403, message)
}

function statusFromMessage(message: string) {
  if (message === "Not found" || message === "Document not found") return 404
  if (message === "Invalid payload") return 400
  if (message === "Not allowed") return 403
  return 500
}

export async function handleApiRoute<T>(handler: () => Promise<T>) {
  try {
    const data = await handler()
    return NextResponse.json(data ?? {})
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : "Internal server error"
    const status = statusFromMessage(message)
    if (status >= 500) {
      console.error(error)
    }
    return NextResponse.json({ error: message }, { status })
  }
}
