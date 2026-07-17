import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const email = process.env.DEMO_ADMIN_EMAIL;
const password = process.env.DEMO_ADMIN_PASSWORD;
const weddingId = "00000000-0000-0000-0000-000000000001";

test("administrator previews all four themes without persisting the selection", async ({ page }) => {
  test.skip(!email || !password, "Set demo administrator credentials to exercise the authenticated editor.");
  await page.goto(`/login?next=/admin/weddings/${weddingId}/edit/design`);
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/weddings/${weddingId}/edit/design`));

  const renderer = page.locator(".theme-preview-frame [data-theme]");
  const savedTheme = await renderer.getAttribute("data-theme");
  expect(savedTheme).toBeTruthy();
  for (const themeId of ["timeless-romance", "tropical-elegance", "modern-minimal", "enchanted-garden"]) {
    await page.locator(`.theme-card-${themeId}`).click();
    await expect(renderer).toHaveAttribute("data-theme", themeId);
    await expect(page.locator(`[data-theme-renderer="${themeId}"]`)).toBeVisible();
    await expect(renderer).toContainText("Annette & Clive");
    const themeA11y = await new AxeBuilder({ page }).include(".theme-preview-frame").analyze();
    expect(themeA11y.violations.filter((violation) => violation.impact === "critical")).toEqual([]);
  }

  await page.getByRole("button", { name: "Mobile" }).click();
  await expect(page.locator(".theme-preview-frame")).toHaveCSS("width", "390px");
  await page.reload();
  await expect(renderer).toHaveAttribute("data-theme", savedTheme!);
});
