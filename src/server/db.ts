import "dotenv/config"

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
  var __flowdocs_prisma__: PrismaClient | undefined
}

function getPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL")
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
}

const prisma = globalThis.__flowdocs_prisma__ ?? getPrisma()
if (process.env.NODE_ENV !== "production") {
  globalThis.__flowdocs_prisma__ = prisma
}

export { prisma }

