import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const email = process.env.DEMO_ADMIN_EMAIL;
const password = process.env.DEMO_ADMIN_PASSWORD;
const weddingId = "00000000-0000-0000-0000-000000000001";

test("administrator previews all six themes without persisting the selection", async ({ page }, testInfo) => {
  test.skip(!email || !password, "Set demo administrator credentials to exercise the authenticated editor.");
  await page.goto(`/login?next=/admin/weddings/${weddingId}/edit/design`);
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/weddings/${weddingId}/edit/design`));

  const renderer = page.locator(".theme-preview-frame [data-theme]");
  const savedTheme = await renderer.getAttribute("data-theme");
  expect(savedTheme).toBeTruthy();
  for (const themeId of ["timeless-romance", "tropical-elegance", "modern-minimal", "enchanted-garden", "amaze-me", "ivory-estate"]) {
    await page.locator(`.theme-card-${themeId}`).click();
    await expect(renderer).toHaveAttribute("data-theme", themeId);
    await expect(page.locator(`[data-theme-renderer="${themeId}"]`)).toBeVisible();
    await expect(renderer).toContainText("Annette & Clive");
    const themeA11y = await new AxeBuilder({ page }).include(".theme-preview-frame").analyze();
    expect(themeA11y.violations.filter((violation) => violation.impact === "critical")).toEqual([]);
  }

  await expect(page.locator(".theme-preview-frame .estate-quicklinks")).toBeVisible();
  await expect(page.locator(".theme-preview-frame .estate-hero")).toBeVisible();
  await page.locator(".theme-preview-frame .estate-hero").screenshot({ path: testInfo.outputPath("ivory-estate-desktop-hero.png") });
  await page.locator(".theme-card-amaze-me").click();
  await expect(renderer).toHaveAttribute("data-theme", "amaze-me");
  await expect(page.locator(".theme-preview-frame .amaze-hero-portal")).toBeVisible();
  await expect(page.locator(".theme-preview-frame .amaze-prologue")).toContainText("Written in the stars");
  await page.locator(".theme-preview-frame").screenshot({ path: testInfo.outputPath("amaze-me-desktop.png") });
  await page.locator(".theme-preview-frame .amaze-hero").screenshot({ path: testInfo.outputPath("amaze-me-desktop-hero.png") });

  await page.getByLabel("Button style").selectOption("solid");
  await expect(renderer).toHaveClass(/buttons-solid/);
  await expect(page.getByText("Filled, tailored buttons with compact corners.")).toBeVisible();
  const previewButton = page.locator(".theme-preview-frame .wed-button").first();
  await expect(previewButton).toHaveCSS("border-radius", "2.88px");
  await page.getByLabel("Button style").selectOption("pill");
  await expect(renderer).toHaveClass(/buttons-pill/);
  await expect(previewButton).toHaveCSS("border-radius", "999px");

  await page.getByLabel("Image treatment").selectOption("dreamy");
  await expect(renderer).toHaveClass(/images-dreamy/);
  await expect(page.getByText("Softer contrast, gentle colour and a subtle glow.")).toBeVisible();
  await page.getByLabel("Motion").selectOption("none");
  await expect(renderer).toHaveClass(/motion-none/);
  await expect(page.getByText("No decorative movement.")).toBeVisible();

  await page.getByRole("button", { name: "Mobile" }).click();
  await expect(page.locator(".theme-preview-frame")).toHaveCSS("width", "390px");
  await page.locator(".theme-preview-frame").screenshot({ path: testInfo.outputPath("amaze-me-mobile.png") });
  await page.locator(".theme-preview-frame .amaze-hero").screenshot({ path: testInfo.outputPath("amaze-me-mobile-hero.png") });
  await page.reload();
  await expect(renderer).toHaveAttribute("data-theme", savedTheme!);
});
