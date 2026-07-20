import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function upsertUser(id: string, email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    create: { id, email, name },
    update: { name },
  })
}

async function main() {
  await prisma.activity.deleteMany()
  await prisma.documentShare.deleteMany()
  await prisma.extractedTask.deleteMany()
  await prisma.document.deleteMany()
  await prisma.user.deleteMany()

  const alice = await upsertUser("user_alice", "alice@ajaia.llc", "Alice")
  const bob = await upsertUser("user_bob", "bob@ajaia.llc", "Bob")
  const charlie = await upsertUser("user_charlie", "charlie@ajaia.llc", "Charlie")

  const sprintMeeting = await prisma.document.create({
    data: {
      authorId: alice.id,
      title: "Sprint Planning Meeting",
      templateType: "meeting-notes",
      content:
        "Deploy tomorrow.\nRahul will deploy tomorrow.\nDevesh reviews Friday.\nRelease Monday.\n\nDecision: Use PostgreSQL.",
      summary: "Team aligned on the sprint plan and next milestones.",
      readingTime: 4,
      healthScore: 92,
      healthIssues: [
        { type: "warning", message: "Missing conclusion" },
        { type: "warning", message: "Keep paragraphs tighter" },
      ],
      timeline: [
        { date: "Tomorrow", event: "Deploy" },
        { date: "Friday", event: "Review" },
        { date: "Monday", event: "Release" },
      ],
      decisions: ["Use PostgreSQL"],
      tags: ["Sprint", "Backend"],
      suggestions: [
        { type: "positive", message: "Action items and timeline extracted" },
        { type: "warning", message: "Missing conclusion" },
      ],
      tasks: {
        create: [
          {
            owner: "Rahul",
            action: "Deploy",
            dueDate: "Tomorrow",
          },
          {
            owner: "Devesh",
            action: "Review",
            dueDate: "Friday",
          },
        ],
      },
    },
    include: { tasks: true },
  })

  await prisma.documentShare.create({
    data: {
      documentId: sprintMeeting.id,
      userId: bob.id,
      permission: "editor",
    },
  })

  const prd = await prisma.document.create({
    data: {
      authorId: alice.id,
      title: "Product Requirements — AI Docs",
      templateType: "prd",
      content:
        "Problem: Teams need structured docs.\nGoals: reduce admin overhead, improve reuse.\nRequirements: task extraction, timeline, health score.\nSuccess: faster review cycles.",
      summary: "A concise PRD describing structured document generation and collaboration.",
      readingTime: 3,
      healthScore: 86,
      healthIssues: [{ type: "warning", message: "Needs clearer scope boundaries" }],
      decisions: ["Structured JSON automation"],
      tags: ["PRD", "AI"],
      suggestions: [
        { type: "positive", message: "Clear structure and goals" },
        { type: "warning", message: "Clarify edge cases" },
      ],
      tasks: {
        create: [
          { owner: "Alice", action: "Draft PRD v1", dueDate: "Today" },
          { owner: "Devesh", action: "Review requirements", dueDate: "Friday" },
        ],
      },
    },
  })

  await prisma.documentShare.create({
    data: { documentId: prd.id, userId: charlie.id, permission: "editor" },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

