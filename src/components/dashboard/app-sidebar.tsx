"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutDashboard, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCommandPaletteStore } from "@/stores/command-palette-store"
import { UserSwitcher } from "@/components/dashboard/user-switcher"

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const setCommandOpen = useCommandPaletteStore((s) => s.setOpen)

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-border/60 bg-sidebar">
      <div className="flex h-14 items-center px-5 border-b border-border/60">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          FlowDocs
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-foreground/5 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4 opacity-70" />
              {label}
            </Link>
          )
        })}

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors text-left"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-4 opacity-70" />
          Search
        </button>
      </nav>

      <div className="hidden md:block p-3 border-t border-border/60">
        <UserSwitcher />
      </div>
    </aside>
  )
}
