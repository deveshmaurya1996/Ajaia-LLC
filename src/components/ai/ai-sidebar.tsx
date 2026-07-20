"use client"

import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/stores/user-store"
import { useTaskCompletion } from "@/features/tasks/hooks/use-task-completion"
import { cn } from "@/lib/utils"

export function AIAssistantSidebar({
  documentId,
  healthScore,
  summary,
  tasks,
  timeline,
  decisions,
  tags,
  suggestions,
  readingTime,
}: {
  documentId: string
  healthScore: number | null
  summary: string | null
  tasks: Array<{
    id: string
    owner: string
    action: string
    dueDate: string | null
    completed: boolean
  }>
  timeline: unknown
  decisions: unknown
  tags: unknown
  suggestions: unknown
  readingTime: number | null
}) {
  const userId = useUserStore((s) => s.currentUserId)
  const completeMutation = useTaskCompletion(userId, documentId)

  const timelineList =
    Array.isArray(timeline) ? (timeline as Array<{ date: string; event: string }>) : []
  const decisionsList = Array.isArray(decisions) ? (decisions as string[]) : []
  const tagsList = Array.isArray(tags) ? (tags as string[]) : []
  const suggestionsList = Array.isArray(suggestions)
    ? (suggestions as Array<{ type: "positive" | "warning"; message: string }>)
    : []

  const healthValue = typeof healthScore === "number" ? healthScore : null

  return (
    <aside className="lg:sticky lg:top-20 space-y-6 text-sm">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Insights</h3>
          {healthValue !== null ? (
            <span className="text-xs text-muted-foreground">Health {healthValue}</span>
          ) : null}
        </div>
        {summary ? (
          <p className="text-muted-foreground leading-relaxed">{summary}</p>
        ) : (
          <p className="text-muted-foreground">Analysis runs as you write.</p>
        )}
      </div>

      {tasks.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Tasks</h3>
          <ul className="space-y-2">
            {tasks.slice(0, 8).map((t) => (
              <li key={t.id}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    className="mt-0.5 accent-primary"
                    onChange={(e) =>
                      completeMutation.mutate({ taskId: t.id, completed: e.target.checked })
                    }
                  />
                  <span className={cn("min-w-0", t.completed && "line-through text-muted-foreground")}>
                    <span className="text-foreground">{t.action}</span>
                    <span className="text-muted-foreground"> · {t.owner}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {timelineList.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Timeline</h3>
          <ul className="space-y-1.5 text-muted-foreground">
            {timelineList.slice(0, 4).map((t, idx) => (
              <li key={`${t.date}-${idx}`} className="flex justify-between gap-2">
                <span className="text-foreground shrink-0">{t.date}</span>
                <span className="truncate text-right">{t.event}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {decisionsList.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Decisions</h3>
          <div className="flex flex-wrap gap-1.5">
            {decisionsList.slice(0, 5).map((d) => (
              <Badge key={d} variant="secondary" className="font-normal">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {tagsList.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tagsList.slice(0, 6).map((t) => (
              <Badge key={t} variant="outline" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {suggestionsList.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Suggestions</h3>
          <ul className="space-y-1 text-muted-foreground">
            {suggestionsList.slice(0, 4).map((s, idx) => (
              <li key={`${s.message}-${idx}`}>{s.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {readingTime ? (
        <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          {readingTime} min read
        </p>
      ) : null}
    </aside>
  )
}
