"use client"

import type { Editor } from "@tiptap/react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Markdown } from "@tiptap/markdown"
import { useEffect, useRef } from "react"
import type { DocumentContentFormat } from "@/lib/document-content"

export function TiptapEditor({
  documentId,
  initialContent,
  contentFormat,
  onChange,
  editable = true,
  onEditorReady,
}: {
  documentId: string
  initialContent: string
  contentFormat: DocumentContentFormat
  onChange: (html: string) => void
  editable?: boolean
  onEditorReady?: (editor: Editor | null) => void
}) {
  const loadedForRef = useRef<string | null>(null)

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
      Markdown.configure({
        markedOptions: { gfm: true, breaks: true },
      }),
    ],
    content: "",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    loadedForRef.current = null
  }, [documentId])

  useEffect(() => {
    if (!editor) return
    if (loadedForRef.current === documentId) return

    const body = initialContent?.trim()
      ? initialContent
      : contentFormat === "markdown"
        ? ""
        : "<p></p>"

    if (contentFormat === "markdown") {
      editor.commands.setContent(body, {
        emitUpdate: false,
        contentType: "markdown",
      })
    } else {
      editor.commands.setContent(body, { emitUpdate: false })
    }

    loadedForRef.current = documentId
  }, [documentId, editor, initialContent, contentFormat])

  useEffect(() => {
    if (!editor) return
    onEditorReady?.(editor)
  }, [editor, onEditorReady])

  if (!editor) return null

  return (
    <div className="surface-card tiptap-document">
      <EditorContent
        editor={editor}
        className="max-w-none p-5 outline-none [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2"
      />
    </div>
  )
}
