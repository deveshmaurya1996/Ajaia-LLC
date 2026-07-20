"use client"

import { usePathname } from "next/navigation"
import { Plus, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCommandPaletteStore } from "@/stores/command-palette-store"
import { useCreateDocumentStore } from "@/stores/create-document-store"
import { useUserStore } from "@/stores/user-store"
import { useFileUpload } from "@/hooks/use-file-upload"
import { IMPORT_FORMAT_LABEL } from "@/lib/document-content"
import { UserSwitcher } from "@/components/dashboard/user-switcher"

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/documents": "Documents",
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/document/")) return "Editor"
  return pageTitles[pathname] ?? "Ajaia LLC"
}

export function AppHeader() {
  const pathname = usePathname()
  const userId = useUserStore((s) => s.currentUserId)
  const setSearchOpen = useCommandPaletteStore((s) => s.setOpen)
  const setCreateOpen = useCreateDocumentStore((s) => s.setOpen)
  const { openFilePicker, importing, inputRef, accept, onInputChange } = useFileUpload(userId)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
        disabled={importing}
      />
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 md:hidden">
          <div className="text-sm font-semibold truncate">{getPageTitle(pathname)}</div>
        </div>

        <div className="hidden md:block flex-1" />

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={openFilePicker}
            disabled={importing}
            title={`Import ${IMPORT_FORMAT_LABEL}`}
          >
            <Upload className="size-4 mr-1.5" />
            {importing ? "Uploading…" : "Upload"}
          </Button>

          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-1.5" />
            <span className="hidden sm:inline">New</span>
          </Button>

          <div className="md:hidden">
            <UserSwitcher className="border-0 bg-transparent px-2 py-1.5 w-auto" />
          </div>
        </div>
      </div>
    </header>
  )
}
