import { test, expect } from "@playwright/test"

test.describe("core flows", () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test("create meeting notes document from template", async ({ page }) => {
    await page.goto("/documents")
    await page.getByRole("button", { name: "New", exact: true }).click()
    await expect(page.getByRole("heading", { name: "New document" })).toBeVisible()
    await page.getByRole("button", { name: "Meeting notes" }).click()
    await expect(page).toHaveURL(/\/document\/.+/, { timeout: 30_000 })
    await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible()
    await expect(page.locator('input[placeholder="Untitled"]')).toHaveValue("Meeting Notes", {
      timeout: 15_000,
    })
  })

  test("documents page shows owned and shared tabs", async ({ page }) => {
    await page.goto("/documents")
    await expect(page.getByRole("button", { name: "My documents" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Shared with me" })).toBeVisible()
  })
})
