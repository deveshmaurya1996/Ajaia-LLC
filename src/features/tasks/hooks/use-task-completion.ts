"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useTaskCompletion(userId: string, documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string
      completed: boolean
    }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error("Task update failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId, userId] })
    },
  })
}

