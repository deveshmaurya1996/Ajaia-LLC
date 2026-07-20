"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { usePatchDocument } from "@/features/documents/hooks/use-document-editor"

export type SaveState = "idle" | "unsaved" | "saving" | "saved"

export function useDocumentSave({
  userId,
  documentId,
  title,
  content,
  ready,
}: {
  userId: string
  documentId: string
  title: string
  content: string
  ready: boolean
}) {
  const lastSavedRef = useRef({ title: "", content: "" })
  const titleRef = useRef(title)
  const contentRef = useRef(content)
  const [saveState, setSaveState] = useState<SaveState>("idle")

  titleRef.current = title
  contentRef.current = content

  const patchMutation = usePatchDocument(userId, documentId)

  const initBaseline = useCallback((nextTitle: string, nextContent: string) => {
    lastSavedRef.current = { title: nextTitle, content: nextContent }
    setSaveState("idle")
  }, [])

  const persistChanges = useCallback(async () => {
    if (!ready) return

    const patch: { title?: string; content?: string } = {}
    if (titleRef.current !== lastSavedRef.current.title) patch.title = titleRef.current
    if (contentRef.current !== lastSavedRef.current.content) patch.content = contentRef.current
    if (Object.keys(patch).length === 0) return

    setSaveState("saving")
    try {
      await patchMutation.mutateAsync(patch)
      lastSavedRef.current = {
        title: titleRef.current,
        content: contentRef.current,
      }
      setSaveState("saved")
    } catch {
      setSaveState("unsaved")
      toast.error("Failed to save document")
    }
  }, [patchMutation, ready])

  const autosaveDebounced = useDebouncedCallback(() => {
    void persistChanges()
  }, 2000)

  const markDirtyAndSchedule = useCallback(
    (next?: { title?: string; content?: string }) => {
      if (!ready) return
      if (next?.title !== undefined) titleRef.current = next.title
      if (next?.content !== undefined) contentRef.current = next.content

      const dirty =
        titleRef.current !== lastSavedRef.current.title ||
        contentRef.current !== lastSavedRef.current.content
      if (!dirty) return
      setSaveState("unsaved")
      autosaveDebounced()
    },
    [autosaveDebounced, ready],
  )

  const saveNow = useCallback(async () => {
    autosaveDebounced.cancel()
    await persistChanges()
  }, [autosaveDebounced, persistChanges])

  useEffect(() => {
    if (saveState !== "saved") return
    const t = window.setTimeout(() => setSaveState("idle"), 2000)
    return () => window.clearTimeout(t)
  }, [saveState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        void saveNow()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [saveNow])

  const isDirty =
    ready &&
    (title !== lastSavedRef.current.title || content !== lastSavedRef.current.content)

  return {
    saveState,
    isDirty,
    isSaving: patchMutation.isPending,
    initBaseline,
    markDirtyAndSchedule,
    saveNow,
  }
}
