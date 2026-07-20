"use client"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { CreateDocumentDialog } from "@/components/layout/create-document-dialog"
import { UploadFab } from "@/components/layout/upload-fab"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
      <UploadFab />
      <CreateDocumentDialog />
    </div>
  )
}
