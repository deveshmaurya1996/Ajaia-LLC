"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useAutoAnalyze({
  userId,
  documentId,
  content,
  enabled,
}: {
  userId: string
  documentId: string
  content: string
  enabled: boolean
}) {
  const queryClient = useQueryClient()
  const lastAnalyzedContentRef = useRef<string>("")

  useEffect(() => {
    if (!enabled) return
    const trimmed = content.trim()
    if (!trimmed) return

    const t = window.setTimeout(async () => {
      if (lastAnalyzedContentRef.current === content) return
      lastAnalyzedContentRef.current = content

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ documentId, content }),
      })

      if (!res.ok) return

      await queryClient.invalidateQueries({ queryKey: ["document", documentId, userId] })
    }, 3000)

    return () => window.clearTimeout(t)
  }, [content, documentId, enabled, queryClient, userId])
}

