import Link from "next/link"
import type { DocumentCard } from "@/features/documents/api"
import { ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatRelative(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

type DocumentListItemProps = {
  doc: DocumentCard
  badge?: string
  onRename?: () => void
  onDelete?: () => void
}

export function DocumentListItem({ doc, badge, onRename, onDelete }: DocumentListItemProps) {
  const hasActions = onRename || onDelete

  return (
    <div className="group flex items-center gap-2 rounded-lg px-3 py-3 -mx-3 hover:bg-muted/40 transition-colors">
      <Link href={`/document/${doc.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium">{doc.title}</div>
          {badge ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Updated {formatRelative(doc.updatedAt)}
        </div>
      </Link>

      {hasActions ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onRename ? (
            <Button variant="ghost" size="icon" className="size-8" onClick={onRename}>
              <Pencil className="size-3.5" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={onDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}

export function DocumentList({
  docs,
  badge,
  renderActions,
}: {
  docs: DocumentCard[]
  badge?: string
  renderActions?: (doc: DocumentCard) => { onRename?: () => void; onDelete?: () => void }
}) {
  if (docs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No documents yet. Create one or upload a file.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border/40">
      {docs.map((doc) => {
        const actions = renderActions?.(doc)
        return (
          <DocumentListItem
            key={doc.id}
            doc={doc}
            badge={badge}
            onRename={actions?.onRename}
            onDelete={actions?.onDelete}
          />
        )
      })}
    </div>
  )
}
