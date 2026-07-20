"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getMockUser, mockUsers, useUserStore } from "@/stores/user-store"
import { cn } from "@/lib/utils"

export function UserSwitcher({ className }: { className?: string }) {
  const queryClient = useQueryClient()
  const userId = useUserStore((s) => s.currentUserId)
  const setCurrentUserId = useUserStore((s) => s.setCurrentUserId)
  const user = getMockUser(userId)

  function switchUser(nextUserId: string) {
    if (nextUserId === userId) return
    setCurrentUserId(nextUserId)
    void queryClient.invalidateQueries()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-foreground/5",
          className,
        )}
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs font-medium bg-muted">
            {user.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 hidden md:block">
          <div className="truncate text-sm font-medium">{user.name}</div>
        </div>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground hidden md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          {mockUsers.map((candidate) => (
            <DropdownMenuItem
              key={candidate.id}
              onClick={() => switchUser(candidate.id)}
              className="gap-2"
            >
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">{candidate.avatarInitials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{candidate.name}</span>
              {candidate.id === userId ? <Check className="size-4 text-primary" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
