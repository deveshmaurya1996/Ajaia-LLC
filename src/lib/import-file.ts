import mammoth from "mammoth"
import {
  IMPORT_FORMAT_LABEL,
  isSupportedImportFile,
  prepareImportedDocx,
  prepareImportedText,
} from "@/lib/document-content"

export { IMPORT_FORMAT_LABEL, isSupportedImportFile }

export const IMPORT_ACCEPT = {
  "text/plain": [".txt", ".md"],
  "text/markdown": [".md"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

export async function extractContentFromFile(file: File) {
  if (!isSupportedImportFile(file.name)) {
    throw new Error(`Supported formats: ${IMPORT_FORMAT_LABEL}`)
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

  try {
    if (ext === "docx") {
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
      return prepareImportedDocx(value || "<p></p>", file.name)
    }

    const text = await file.text()
    if (!text.trim()) throw new Error("File is empty")
    return prepareImportedText(text, file.name)
  } catch (err) {
    if (err instanceof Error && err.message === "File is empty") throw err
    throw new Error(`Could not read ${file.name}. Try .txt or .md instead.`)
  }
}
