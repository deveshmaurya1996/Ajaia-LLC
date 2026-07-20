export type DocumentCard = {
  id: string
  title: string
  templateType: string | null
  tags: unknown
  healthScore: number | null
  updatedAt: string
}

export type PendingTask = {
  id: string
  owner: string
  task: string
  dueDate: string | null
  documentId: string
  documentTitle: string
}

export async function apiGetDocuments({
  userId,
  filter,
}: {
  userId: string
  filter: "recent" | "shared" | "mine"
}) {
  const res = await fetch(`/api/documents?filter=${encodeURIComponent(filter)}`, {
    headers: { "x-user-id": userId },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to load documents")
  return res.json() as Promise<DocumentCard[]>
}

export async function apiGetPendingTasks(userId: string) {
  const res = await fetch("/api/tasks/pending", {
    headers: { "x-user-id": userId },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to load pending tasks")
  return res.json() as Promise<PendingTask[]>
}

export async function apiSearch(userId: string, q: string) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
    headers: { "x-user-id": userId },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Search failed")
  return res.json() as Promise<Array<{ id: string; title: string; summary: string | null }>>
}

export async function apiCreateFromTemplate(userId: string, templateType: string) {
  const res = await fetch("/api/ai/template", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ templateType }),
  })
  if (!res.ok) throw new Error("Template creation failed")
  return res.json() as Promise<{ documentId: string }>
}

export async function apiRenameDocument(userId: string, id: string, title: string) {
  const res = await fetch(`/api/documents/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error("Rename failed")
  return res.json()
}

export async function apiDeleteDocument(userId: string, id: string) {
  const res = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
    headers: { "x-user-id": userId },
  })
  if (!res.ok) throw new Error("Delete failed")
  return res.json()
}
