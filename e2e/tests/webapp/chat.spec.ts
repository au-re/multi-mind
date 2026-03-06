import { expect, test } from "@playwright/test";

const navigateToChat = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New Character" }).click();
  await page.getByRole("button", { name: "Save" }).click();
};

const getEditor = (page: import("@playwright/test").Page) => {
  return page.locator('[contenteditable="true"]');
};

const getSendButton = (page: import("@playwright/test").Page) => {
  return page.getByRole("button", { name: "Message Sending" });
};

const typeInEditor = async (page: import("@playwright/test").Page, text: string) => {
  const editor = getEditor(page);
  await editor.click();
  await editor.pressSequentially(text);
};

test.describe("chat", () => {
  test("shows empty state before any messages are sent", async ({ page }) => {
    await navigateToChat(page);
    await expect(page.getByText("Start a conversation")).toBeVisible();
    await expect(page.getByText("Send a message to get started.")).toBeVisible();
  });

  test("sends a message via the send button", async ({ page }) => {
    await navigateToChat(page);

    await typeInEditor(page, "Say hello in one word.");
    await getSendButton(page).click();

    // User message appears in the conversation
    await expect(page.getByText("Say hello in one word.")).toBeVisible();

    // Empty state disappears
    await expect(page.getByText("Start a conversation")).not.toBeVisible();
  });

  test("sends a message with Enter key", async ({ page }) => {
    await navigateToChat(page);

    const editor = getEditor(page);
    await editor.click();
    await editor.pressSequentially("Hi there");
    await editor.press("Enter");

    await expect(page.getByText("Hi there")).toBeVisible();
  });

  test("does not send an empty message", async ({ page }) => {
    await navigateToChat(page);

    const sendButton = getSendButton(page);
    await expect(sendButton).toBeDisabled();
  });

  test("allows newlines with Shift+Enter without sending", async ({ page }) => {
    await navigateToChat(page);

    const editor = getEditor(page);
    await editor.click();
    await editor.pressSequentially("line one");
    await editor.press("Shift+Enter");
    await editor.pressSequentially("line two");

    // Message should not be sent, empty state still visible
    await expect(page.getByText("Start a conversation")).toBeVisible();
    await expect(editor).toContainText("line one");
    await expect(editor).toContainText("line two");
  });

  test("receives an assistant response", async ({ page }) => {
    await navigateToChat(page);

    await typeInEditor(page, "Say hello in one word.");
    await getSendButton(page).click();

    // The conversation should show the user message
    const conversation = page.getByRole("log");
    await expect(conversation.getByText("Say hello in one word.")).toBeVisible();

    // Wait for the assistant to respond with content beyond the user message
    await expect(async () => {
      const allText = await conversation.innerText();
      const withoutUserMessage = allText.replace("Say hello in one word.", "").trim();
      expect(withoutUserMessage.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });
  });

  test("conversation container has correct ARIA roles", async ({ page }) => {
    await navigateToChat(page);

    // ChatPrimitives.Root renders role="log" with aria-roledescription="conversation"
    const conversation = page.getByRole("log");
    await expect(conversation).toBeVisible();
    await expect(conversation).toHaveAttribute("aria-roledescription", "conversation");

    // ChatPrimitives.Viewport renders role="list"
    await expect(conversation.getByRole("list")).toBeVisible();
  });
});
