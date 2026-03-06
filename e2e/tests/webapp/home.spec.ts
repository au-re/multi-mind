import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "multi-mind" })).toBeVisible();
  });

  test("renders the placeholder text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Placeholder — ready for features.")).toBeVisible();
  });
});
