"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/stores/user-store"
import { useFileUpload } from "@/hooks/use-file-upload"

export function UploadFab() {
  const userId = useUserStore((s) => s.currentUserId)
  const { openFilePicker, importing, inputRef, accept, onInputChange } = useFileUpload(userId)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
        disabled={importing}
      />
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg sm:hidden"
        onClick={openFilePicker}
        disabled={importing}
        aria-label="Upload document"
      >
        <Upload className="size-5" />
      </Button>
    </>
  )
}
