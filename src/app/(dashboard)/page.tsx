"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useUserStore, mockUsers } from "@/stores/user-store"
import { DocumentList } from "@/components/dashboard/document-list"
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data"

export default function DashboardPage() {
  const userId = useUserStore((s) => s.currentUserId)
  const user = useMemo(() => mockUsers.find((u) => u.id === userId) ?? mockUsers[0], [userId])
  const { recentDocsQuery, pendingTasksQuery } = useDashboardData(userId)

  const recentDocs = recentDocsQuery.data ?? []
  const topTasks = (pendingTasksQuery.data ?? []).slice(0, 5)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Hi, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your workspace</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent</h2>
          <Link href="/documents" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {recentDocsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <DocumentList docs={recentDocs.slice(0, 6)} />
        )}
      </section>

      {topTasks.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Open tasks</h2>
          <ul className="space-y-2">
            {topTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/document/${task.documentId}`}
                  className="flex justify-between gap-3 rounded-lg px-3 py-2 -mx-3 hover:bg-muted/40 text-sm"
                >
                  <span className="truncate">{task.task}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{task.owner}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
