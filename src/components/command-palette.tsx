"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Search } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { mockUsers, useUserStore, type MockUser } from "@/stores/user-store"
import { useCommandPaletteStore } from "@/stores/command-palette-store"
import {
  useCommandSearch,
  useCreateTemplateDocument,
} from "@/features/search/hooks/use-command-palette"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

const templates = [
  { key: "blank", label: "Blank", templateType: "blank" },
  { key: "meeting-notes", label: "Meeting notes", templateType: "meeting-notes" },
  { key: "prd", label: "PRD", templateType: "prd" },
]

export default function CommandPalette() {
  const router = useRouter()
  const userId = useUserStore((s) => s.currentUserId)
  const open = useCommandPaletteStore((s) => s.open)
  const setOpen = useCommandPaletteStore((s) => s.setOpen)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 200)

  const user = useMemo<MockUser>(
    () => mockUsers.find((u) => u.id === userId) ?? mockUsers[0],
    [userId],
  )

  const trimmedQuery = debouncedQuery.trim()
  const searchQueryEnabled = trimmedQuery.length > 0
  const searchResultsQuery = useCommandSearch(
    userId,
    trimmedQuery,
    open && searchQueryEnabled,
  )
  const createMutation = useCreateTemplateDocument(userId)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === "k"
      if (isK && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setOpen])

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  async function onCreate(templateType: string) {
    setOpen(false)
    await createMutation.mutateAsync(templateType)
  }

  const results = searchResultsQuery.data ?? []
  const showResults = open && searchQueryEnabled

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command"
      description="Search documents and actions"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={`Search documents as ${user.name}…`}
        />

        <CommandList>
          {showResults && searchResultsQuery.isLoading ? (
            <CommandEmpty>Searching…</CommandEmpty>
          ) : null}

          {showResults && !searchResultsQuery.isLoading && results.length === 0 ? (
            <CommandEmpty>No documents match &quot;{trimmedQuery}&quot;</CommandEmpty>
          ) : null}

          {showResults && results.length > 0 ? (
            <CommandGroup heading="Documents">
              {results.map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={`${doc.id}-${doc.title}`}
                  onSelect={() => {
                    setOpen(false)
                    router.push(`/document/${doc.id}`)
                  }}
                >
                  <FileText className="size-4 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{doc.title}</div>
                    {doc.summary ? (
                      <div className="truncate text-xs text-muted-foreground">{doc.summary}</div>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {!searchQueryEnabled ? (
            <>
              <CommandGroup heading="Create">
                {templates.map((t) => (
                  <CommandItem
                    key={t.key}
                    value={`create-${t.key}`}
                    onSelect={() => onCreate(t.templateType)}
                  >
                    <Plus className="size-4 text-primary" />
                    {t.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Navigation">
                <CommandItem
                  value="nav-dashboard"
                  onSelect={() => {
                    setOpen(false)
                    router.push("/")
                  }}
                >
                  Dashboard
                </CommandItem>
                <CommandItem
                  value="nav-documents"
                  onSelect={() => {
                    setOpen(false)
                    router.push("/documents")
                  }}
                >
                  Documents
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}

          {searchQueryEnabled ? (
            <CommandGroup heading="Actions">
              <CommandItem
                value="action-clear-search"
                onSelect={() => setQuery("")}
              >
                <Search className="size-4" />
                Clear search
              </CommandItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
