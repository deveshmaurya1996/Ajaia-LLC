"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGetDocuments, apiGetPendingTasks } from "@/features/documents/api"

export function useDashboardData(userId: string) {
  const recentDocsQuery = useQuery({
    queryKey: ["documents", "recent", userId],
    queryFn: () => apiGetDocuments({ userId, filter: "recent" }),
  })

  const pendingTasksQuery = useQuery({
    queryKey: ["tasks", "pending", userId],
    queryFn: () => apiGetPendingTasks(userId),
  })

  return { recentDocsQuery, pendingTasksQuery }
}
