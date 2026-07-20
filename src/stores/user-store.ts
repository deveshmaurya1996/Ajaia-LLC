import { create } from "zustand"
import { persist } from "zustand/middleware"

export type MockUser = {
  id: string
  name: string
  email: string
  avatarInitials: string
}

export const mockUsers: MockUser[] = [
  { id: "user_alice", name: "Alice", email: "alice@flowdocs.ai", avatarInitials: "A" },
  { id: "user_bob", name: "Bob", email: "bob@flowdocs.ai", avatarInitials: "B" },
  {
    id: "user_charlie",
    name: "Charlie",
    email: "charlie@flowdocs.ai",
    avatarInitials: "C",
  },
]

type UserState = {
  currentUserId: string
  setCurrentUserId: (id: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUserId: mockUsers[0].id,
      setCurrentUserId: (id) => set({ currentUserId: id }),
    }),
    { name: "flowdocs-current-user" },
  ),
)

export function getMockUser(userId: string) {
  return mockUsers.find((user) => user.id === userId) ?? mockUsers[0]
}
