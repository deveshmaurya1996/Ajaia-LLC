"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  apiDeleteDocument,
  apiGetDocuments,
  apiRenameDocument,
} from "@/features/documents/api"

export function useDocumentsPage(userId: string, filter: "mine" | "shared" = "mine") {
  const queryClient = useQueryClient()

  const docsQuery = useQuery({
    queryKey: ["documents", filter, userId],
    queryFn: () => apiGetDocuments({ userId, filter }),
  })

  const renameMutation = useMutation({
    mutationFn: (payload: { id: string; title: string }) =>
      apiRenameDocument(userId, payload.id, payload.title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Title updated")
    },
    onError: () => toast.error("Rename failed"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteDocument(userId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Document deleted")
    },
    onError: () => toast.error("Delete failed"),
  })

  return { docsQuery, renameMutation, deleteMutation }
}
