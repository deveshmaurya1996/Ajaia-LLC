"use client"

import { useMutation, useQuery } from "@tanstack/react-query"

import type { DocumentContentFormat } from "@/lib/document-content"

export type DocFromApi = {
  id: string
  title: string
  content: string
  contentFormat?: DocumentContentFormat
  authorId: string
  summary: string | null
  healthScore: number | null
  readingTime: number | null
  timeline: unknown
  decisions: unknown
  tags: unknown
  suggestions: unknown
  tasks: Array<{
    id: string
    owner: string
    action: string
    dueDate: string | null
    completed: boolean
  }>
}

async function apiGetDocument(userId: string, id: string): Promise<DocFromApi> {
  const res = await fetch(`/api/documents/${id}`, {
    headers: { "x-user-id": userId },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to load document")
  return res.json()
}

async function apiPatchDocument(
  userId: string,
  id: string,
  payload: { title?: string; content?: string },
) {
  const res = await fetch(`/api/documents/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Update failed")
  return res.json()
}

export function useDocumentById(userId: string, documentId: string) {
  return useQuery({
    queryKey: ["document", documentId, userId],
    queryFn: () => apiGetDocument(userId, documentId),
  })
}

export function usePatchDocument(userId: string, documentId: string) {
  return useMutation({
    mutationFn: (payload: { title?: string; content?: string }) =>
      apiPatchDocument(userId, documentId, payload),
  })
}

