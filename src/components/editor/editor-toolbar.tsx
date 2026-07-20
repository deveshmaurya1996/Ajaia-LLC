"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Quote,
  Minus,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react"

import { Button } from "@/components/ui/button"

function ToolbarButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  active?: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </Button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border/60 mx-0.5" />
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const disabled = !editor

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", previous ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="surface-card flex items-center flex-wrap gap-0.5 p-2">
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("bold")}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        icon={Bold}
        label="Bold"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("italic")}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        icon={Italic}
        label="Italic"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("underline")}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        icon={Underline}
        label="Underline"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("strike")}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        icon={Strikethrough}
        label="Strikethrough"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("code")}
        onClick={() => editor?.chain().focus().toggleCode().run()}
        icon={Code}
        label="Inline code"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("link")}
        onClick={setLink}
        icon={Link2}
        label="Link"
      />

      <ToolbarDivider />

      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("heading", { level: 1 })}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        icon={Heading1}
        label="Heading 1"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("heading", { level: 2 })}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        icon={Heading2}
        label="Heading 2"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("heading", { level: 3 })}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        icon={Heading3}
        label="Heading 3"
      />

      <ToolbarDivider />

      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("bulletList")}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        icon={List}
        label="Bulleted list"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("orderedList")}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        icon={ListOrdered}
        label="Numbered list"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("blockquote")}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        icon={Quote}
        label="Blockquote"
      />
      <ToolbarButton
        disabled={disabled}
        active={editor?.isActive("codeBlock")}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        icon={Code2}
        label="Code block"
      />
      <ToolbarButton
        disabled={disabled}
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        icon={Minus}
        label="Divider"
      />

      <ToolbarDivider />

      <ToolbarButton
        disabled={disabled}
        onClick={() => editor?.chain().focus().undo().run()}
        icon={Undo2}
        label="Undo"
      />
      <ToolbarButton
        disabled={disabled}
        onClick={() => editor?.chain().focus().redo().run()}
        icon={Redo2}
        label="Redo"
      />
      <ToolbarButton
        disabled={disabled}
        onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        icon={RemoveFormatting}
        label="Clear formatting"
      />
    </div>
  )
}
