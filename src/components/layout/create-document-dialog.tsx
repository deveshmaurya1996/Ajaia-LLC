"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/stores/user-store"
import { useCreateDocumentStore } from "@/stores/create-document-store"
import { useCreateDocument } from "@/features/documents/hooks/use-create-document"

const templates = [
  { label: "Blank", templateType: "blank" },
  { label: "Meeting notes", templateType: "meeting-notes" },
  { label: "PRD", templateType: "prd" },
]

export function CreateDocumentDialog() {
  const userId = useUserStore((s) => s.currentUserId)
  const open = useCreateDocumentStore((s) => s.open)
  const setOpen = useCreateDocumentStore((s) => s.setOpen)
  const createMutation = useCreateDocument(userId)

  useEffect(() => {
    if (createMutation.isSuccess) setOpen(false)
  }, [createMutation.isSuccess, setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>
          <DialogDescription>Pick a starting template.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-2">
          {templates.map((t) => (
            <Button
              key={t.templateType}
              variant="outline"
              className="justify-start h-10"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate(t.templateType)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
