"use client"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { CreateDocumentDialog } from "@/components/layout/create-document-dialog"
import { UploadFab } from "@/components/layout/upload-fab"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
      <UploadFab />
      <CreateDocumentDialog />
    </div>
  )
}
