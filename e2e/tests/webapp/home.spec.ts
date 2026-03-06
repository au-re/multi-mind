import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the characters heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Characters" })).toBeVisible();
  });

  test("shows empty state when no characters exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No characters yet")).toBeVisible();
  });

  test("creates a new character and navigates to edit page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Character" }).click();
    await expect(page.getByRole("heading", { name: "Edit Character" })).toBeVisible();
  });

  test("deletes a character", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Character" }).click();
    await expect(page.getByRole("heading", { name: "Edit Character" })).toBeVisible();

    await page.goBack();
    const deleteButton = page.getByRole("button", { name: "Delete" });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await expect(page.getByText("No characters yet")).toBeVisible();
  });
});
