import { z } from "zod"
import { shareService } from "@/server/services/share.service"
import { badRequest } from "@/server/http/api-route"

const shareSchema = z.object({
  documentId: z.string().min(1),
  toUserId: z.string().min(1),
  permission: z.enum(["editor"]).optional(),
})

export const shareController = {
  async shareDocument(fromUserId: string, payload: unknown) {
    const parsed = shareSchema.safeParse(payload)
    if (!parsed.success) throw badRequest()

    return shareService.shareDocument({
      fromUserId,
      documentId: parsed.data.documentId,
      toUserId: parsed.data.toUserId,
      permission: parsed.data.permission,
    })
  },
}

