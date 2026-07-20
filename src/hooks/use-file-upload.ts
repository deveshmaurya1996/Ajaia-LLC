"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  extractContentFromFile,
  IMPORT_ACCEPT,
  IMPORT_FORMAT_LABEL,
  isSupportedImportFile,
} from "@/lib/import-file"

export function useFileUpload(userId: string) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const accept = Object.values(IMPORT_ACCEPT).flat().join(",")

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isSupportedImportFile(file.name)) {
        toast.error(`Unsupported format. Supported: ${IMPORT_FORMAT_LABEL}`)
        return
      }

      try {
        setImporting(true)
        const { content, title } = await extractContentFromFile(file)
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({ content, filename: file.name, title }),
        })

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error ?? "Upload failed")
        }
        const data = (await res.json()) as { documentId: string }
        if (!data.documentId) throw new Error("Upload failed")
        toast.success("Document imported")
        router.push(`/document/${data.documentId}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        toast.error(message)
      } finally {
        setImporting(false)
      }
    },
    [router, userId],
  )

  const onInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (file) await uploadFile(file)
    },
    [uploadFile],
  )

  return { openFilePicker, importing, inputRef, accept, onInputChange }
}
