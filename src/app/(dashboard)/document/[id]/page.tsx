"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Editor } from "@tiptap/react"

import { useUserStore } from "@/stores/user-store"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { EditorToolbar } from "@/components/editor/editor-toolbar"
import { AIAssistantSidebar } from "@/components/ai/ai-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { mockUsers } from "@/stores/user-store"
import { Save, Share2 } from "lucide-react"
import { useAutoAnalyze } from "@/features/ai/hooks/use-auto-analyze"
import {
  useDocumentById,
} from "@/features/documents/hooks/use-document-editor"
import { useDocumentSave } from "@/features/documents/hooks/use-document-save"
import { cn } from "@/lib/utils"

function SaveStatus({ state, isDirty }: { state: string; isDirty: boolean }) {
  if (state === "saving") {
    return <span className="text-xs text-muted-foreground">Saving…</span>
  }
  if (state === "saved") {
    return <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>
  }
  if (isDirty || state === "unsaved") {
    return <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>
  }
  return <span className="text-xs text-muted-foreground">Auto-save on</span>
}

export default function DocumentPage() {
  const params = useParams<{ id: string }>()
  const userId = useUserStore((s) => s.currentUserId)
  const documentId = params.id

  const [editor, setEditor] = useState<Editor | null>(null)

  const docQuery = useDocumentById(userId, documentId)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [shareOpen, setShareOpen] = useState(false)
  const [toUserId, setToUserId] = useState<string | null>(null)

  const docReady = Boolean(docQuery.data)

  const { saveState, isDirty, isSaving, initBaseline, markDirtyAndSchedule, saveNow } =
    useDocumentSave({
      userId,
      documentId,
      title,
      content,
      ready: docReady,
    })

  useEffect(() => {
    if (!docQuery.data) return
    const nextTitle = docQuery.data.title ?? ""
    const nextContent = docQuery.data.content ?? ""
    setTitle(nextTitle)
    setContent(nextContent)
    initBaseline(nextTitle, nextContent)
  }, [docQuery.data, initBaseline])

  const summary = docQuery.data?.summary ?? null
  const healthScore = docQuery.data?.healthScore ?? null
  const timeline = docQuery.data?.timeline
  const decisions = docQuery.data?.decisions
  const tags = docQuery.data?.tags
  const suggestions = docQuery.data?.suggestions
  const tasks = docQuery.data?.tasks ?? []
  const readingTime = docQuery.data?.readingTime ?? null
  const isOwner = docQuery.data?.authorId === userId

  useAutoAnalyze({
    userId,
    documentId,
    content,
    enabled: docReady,
  })

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden px-4 max-lg:h-auto max-lg:overflow-visible md:px-8">
      <div className="grid min-h-0 flex-1 gap-6 max-lg:flex-none lg:grid-cols-12 lg:gap-8">
        <div className="flex min-h-0 flex-col max-lg:min-h-[calc(100vh-8rem)] lg:col-span-8">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 py-3">
            <Input
              value={title}
              onChange={(e) => {
                const next = e.target.value
                setTitle(next)
                markDirtyAndSchedule({ title: next })
              }}
              placeholder="Untitled"
              className="max-w-xl border-0 bg-transparent px-0 text-xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            />
            <div className="flex shrink-0 items-center gap-2">
              <SaveStatus state={saveState} isDirty={isDirty} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => void saveNow()}
                disabled={isSaving || (!isDirty && saveState !== "unsaved")}
                title="Save (Ctrl+S)"
              >
                <Save className={cn("size-4 mr-1", isSaving && "animate-pulse")} />
                Save
              </Button>
              {isOwner ? (
                <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
                  <Share2 className="size-4 mr-1" />
                  Share
                </Button>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 py-2">
            <EditorToolbar editor={editor} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            {docQuery.isLoading || !docQuery.data ? (
              <div className="h-full min-h-[200px] animate-pulse rounded-xl border border-border/50 bg-muted/40" />
            ) : (
              <TiptapEditor
                documentId={documentId}
                initialContent={docQuery.data.content ?? ""}
                contentFormat={docQuery.data.contentFormat ?? "html"}
                onEditorReady={setEditor}
                onChange={(html) => {
                  setContent(html)
                  markDirtyAndSchedule({ content: html })
                }}
              />
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto pb-4 lg:col-span-4">
          <AIAssistantSidebar
            documentId={documentId}
            healthScore={healthScore}
            summary={summary}
            tasks={tasks}
            timeline={timeline}
            decisions={decisions}
            tags={tags}
            suggestions={suggestions}
            readingTime={readingTime}
          />
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share document</DialogTitle>
            <DialogDescription>Choose a person to share with. Permission is editor.</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-2">
            {mockUsers
              .filter((u) => u.id !== userId)
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setToUserId(u.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                    toUserId === u.id
                      ? "bg-primary/10 border-primary/50"
                      : "bg-white/40 dark:bg-black/30 border-border/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{u.name}</div>
                    <Badge variant={toUserId === u.id ? "secondary" : "outline"}>Editor</Badge>
                  </div>
                </button>
              ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!toUserId) return
                try {
                  const res = await fetch(`/api/documents/${documentId}/share`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-user-id": userId,
                    },
                    body: JSON.stringify({ toUserId, permission: "editor" }),
                  })
                  if (!res.ok) throw new Error("Share failed")
                  toast.success("Shared")
                  setShareOpen(false)
                  setToUserId(null)
                } catch {
                  toast.error("Share failed")
                }
              }}
              disabled={!toUserId}
            >
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

