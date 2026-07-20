"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useUserStore } from "@/stores/user-store"
import { useDocumentsPage } from "@/features/documents/hooks/use-documents-page"
import { useCommandSearch } from "@/features/search/hooks/use-command-palette"
import { useCommandPaletteStore } from "@/stores/command-palette-store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DocumentList } from "@/components/dashboard/document-list"
import type { DocumentCard } from "@/features/documents/api"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

type Tab = "mine" | "shared"

export default function DocumentsPage() {
  const userId = useUserStore((s) => s.currentUserId)
  const setCommandOpen = useCommandPaletteStore((s) => s.setOpen)
  const [tab, setTab] = useState<Tab>("mine")

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebouncedValue(searchQuery, 200)
  const isSearching = debouncedSearch.trim().length > 0
  const searchQueryResult = useCommandSearch(userId, debouncedSearch.trim(), isSearching)

  const { docsQuery, renameMutation, deleteMutation } = useDocumentsPage(userId, tab)

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const docs = docsQuery.data ?? []
  const searchResults = searchQueryResult.data ?? []
  const listLoading = isSearching ? searchQueryResult.isLoading : docsQuery.isLoading

  useEffect(() => {
    if (renameMutation.isSuccess) setRenameOpen(false)
  }, [renameMutation.isSuccess])

  useEffect(() => {
    if (deleteMutation.isSuccess) setDeleteOpen(false)
  }, [deleteMutation.isSuccess])

  const searchAsDocs: DocumentCard[] = searchResults.map((doc) => ({
    id: doc.id,
    title: doc.title,
    templateType: null,
    tags: [],
    healthScore: null,
    updatedAt: new Date().toISOString(),
  }))

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your documents and items shared with you
        </p>
      </section>

      {!isSearching ? (
        <div className="flex gap-1 border-b border-border/60">
          {(["mine", "shared"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "mine" ? "My documents" : "Shared with me"}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="pl-9 bg-transparent"
        />
        {!searchQuery ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setCommandOpen(true)}
          >
            Ctrl K
          </button>
        ) : null}
      </div>

      {listLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : isSearching && searchResults.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No matches</p>
      ) : (
        <DocumentList
          docs={isSearching ? searchAsDocs : docs}
          badge={tab === "shared" && !isSearching ? "Shared" : undefined}
          renderActions={
            isSearching || tab === "shared"
              ? undefined
              : (doc) => ({
                  onRename: () => {
                    setSelectedDocId(doc.id)
                    setRenameValue(doc.title)
                    setRenameOpen(true)
                  },
                  onDelete: () => {
                    setSelectedDocId(doc.id)
                    setDeleteOpen(true)
                  },
                })
          }
        />
      )}

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Update the document title.</DialogDescription>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedDocId && renameMutation.mutate({ id: selectedDocId, title: renameValue })}
              disabled={renameMutation.isPending}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedDocId && deleteMutation.mutate(selectedDocId)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
