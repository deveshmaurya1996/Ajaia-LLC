"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiCreateFromTemplate, apiSearch } from "@/features/documents/api"
import { useQuery } from "@tanstack/react-query"

export function useCommandSearch(userId: string, query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["command-search", userId, query],
    queryFn: () => apiSearch(userId, query),
    enabled,
  })
}

export function useCreateTemplateDocument(userId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (templateType: string) => apiCreateFromTemplate(userId, templateType),
    onSuccess: ({ documentId }) => router.push(`/document/${documentId}`),
    onError: () => toast.error("Could not create document"),
  })
}
