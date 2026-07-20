"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiCreateFromTemplate } from "@/features/documents/api"

export function useCreateDocument(userId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateType: string) => apiCreateFromTemplate(userId, templateType),
    onSuccess: async ({ documentId }) => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      router.push(`/document/${documentId}`)
    },
    onError: () => toast.error("Could not create document"),
  })
}
