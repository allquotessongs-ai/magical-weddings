import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_ADMIN_EMAIL;
const password = process.env.DEMO_ADMIN_PASSWORD;

test("premium photo themes render distinct desktop and mobile compositions", async ({ page }, testInfo) => {
  test.skip(!supabaseUrl?.startsWith("http://127.0.0.1") || !serviceKey || !email || !password, "Local Supabase and demo administrator credentials are required.");
  const admin = createClient(supabaseUrl!, serviceKey!, { auth: { persistSession: false } });
  const { data: sourceHero } = await admin.from("wedding_media").select("storage_path,mime_type").eq("purpose", "hero").eq("active", true).limit(1).maybeSingle();
  test.skip(!sourceHero, "An active local hero image is required for visual theme verification.");

  const weddingId = randomUUID();
  const heroId = randomUUID();
  const heroPath = `${weddingId}/${heroId}.jpg`;
  const slug = `amaze-me-test-${weddingId.slice(0, 8)}`;
  try {
    const { data: heroFile, error: downloadError } = await admin.storage.from("wedding-media").download(sourceHero!.storage_path);
    expect(downloadError).toBeNull();
    expect((await admin.storage.from("wedding-media").upload(heroPath, heroFile!, { contentType: sourceHero!.mime_type, upsert: false })).error).toBeNull();
    expect((await admin.from("weddings").insert({ id: weddingId, partner_one_name: "Celeste", partner_two_name: "Orion", display_names: "Celeste & Orion", slug, package: "bespoke", status: "draft", wedding_at: "2027-11-13T21:00:00.000Z", timezone: "America/Jamaica" })).error).toBeNull();
    expect((await admin.from("wedding_content").insert({ wedding_id: weddingId, introduction: "Some love stories are written. Ours was discovered among the stars.", couple_story: "A chance meeting became the beginning of our most extraordinary adventure.", hashtag: "#CelesteAndOrion", closing_message: "Meet us where forever begins." })).error).toBeNull();
    expect((await admin.from("wedding_theme_settings").insert({ wedding_id: weddingId, theme_id: "amaze-me", settings_version: 2, theme_overrides: {} })).error).toBeNull();
    expect((await admin.from("wedding_media").insert({ id: heroId, wedding_id: weddingId, purpose: "hero", storage_path: heroPath, mime_type: sourceHero!.mime_type, byte_size: heroFile!.size, alt_text: "Celeste and Orion together", metadata: { focalX: 50, focalY: 36 }, active: true })).error).toBeNull();
    expect((await admin.from("wedding_sections").insert([
      { wedding_id: weddingId, section_key: "hero", enabled: true, position: 0 },
      { wedding_id: weddingId, section_key: "countdown", enabled: true, position: 1 },
      { wedding_id: weddingId, section_key: "welcome", enabled: true, position: 2 },
      { wedding_id: weddingId, section_key: "story", enabled: true, position: 3 },
      { wedding_id: weddingId, section_key: "ceremony", enabled: true, position: 4 },
      { wedding_id: weddingId, section_key: "reception", enabled: true, position: 5 },
      { wedding_id: weddingId, section_key: "closing", enabled: true, position: 6 },
    ])).error).toBeNull();
    expect((await admin.from("wedding_events").insert([
      { wedding_id: weddingId, event_type: "ceremony", venue_name: "The Moon Garden", address: "12 Starlight Lane", parish: "Saint Andrew", starts_at: "2027-11-13T21:00:00.000Z", maps_url: "https://maps.google.com" },
      { wedding_id: weddingId, event_type: "reception", venue_name: "The Celestial Room", address: "12 Starlight Lane", parish: "Saint Andrew", starts_at: "2027-11-13T23:00:00.000Z", maps_url: "https://maps.google.com" },
    ])).error).toBeNull();

    await page.goto(`/login?next=/admin/weddings/${weddingId}/preview/site`);
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/weddings/${weddingId}/preview/site`));
    await expect(page.locator('[data-theme-renderer="amaze-me"]')).toBeVisible();
    const image = page.locator(".amaze-hero-media img");
    await expect(image).toHaveCount(1);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    const desktopCopy = await page.locator(".amaze-hero .wed-hero-copy").boundingBox();
    const desktopPortal = await page.locator(".amaze-hero-portal").boundingBox();
    expect(desktopPortal!.x + desktopPortal!.width / 2).toBeGreaterThan(desktopCopy!.x + desktopCopy!.width / 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("amaze-me-desktop-page.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".amaze-me-nav nav")).toBeHidden();
    await expect(page.locator(".amaze-me-nav .mobile-menu")).toBeVisible();
    const mobileCopy = await page.locator(".amaze-hero .wed-hero-copy").boundingBox();
    const mobilePortal = await page.locator(".amaze-hero-portal").boundingBox();
    expect(mobileCopy!.x).toBeGreaterThanOrEqual(0);
    expect(mobileCopy!.x + mobileCopy!.width).toBeLessThanOrEqual(391);
    expect(mobilePortal!.x).toBeGreaterThanOrEqual(0);
    expect(mobilePortal!.x + mobilePortal!.width).toBeLessThanOrEqual(391);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("amaze-me-mobile-page.png"), fullPage: true });

    expect((await admin.from("wedding_theme_settings").update({ theme_id: "ivory-estate" }).eq("wedding_id", weddingId)).error).toBeNull();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();
    await expect(page.locator('[data-theme-renderer="ivory-estate"]')).toBeVisible();
    const estateImage = page.locator(".estate-hero-media img");
    await expect(estateImage).toHaveCount(1);
    await expect.poll(() => estateImage.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    const estateCopy = await page.locator(".estate-hero .wed-hero-copy").boundingBox();
    const estateHero = await page.locator(".estate-hero").boundingBox();
    expect(estateCopy!.x + estateCopy!.width).toBeLessThan(estateHero!.x + estateHero!.width * .7);
    await expect(page.locator(".estate-quicklinks")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath("ivory-estate-desktop-page.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".ivory-estate-nav nav")).toBeHidden();
    await expect(page.locator(".ivory-estate-nav .mobile-menu")).toBeVisible();
    const estateMobileCopy = await page.locator(".estate-hero .wed-hero-copy").boundingBox();
    expect(estateMobileCopy!.x).toBeGreaterThanOrEqual(0);
    expect(estateMobileCopy!.x + estateMobileCopy!.width).toBeLessThanOrEqual(391);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("ivory-estate-mobile-page.png"), fullPage: true });
  } finally {
    await admin.storage.from("wedding-media").remove([heroPath]);
    await admin.from("weddings").delete().eq("id", weddingId);
  }
});
