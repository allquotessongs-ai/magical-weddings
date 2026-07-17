import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_ADMIN_EMAIL;
const password = process.env.DEMO_ADMIN_PASSWORD;

test("Bespoke timeline saves structured moments and Timeless events use formal framed cards", async ({ page }, testInfo) => {
  test.skip(!supabaseUrl?.startsWith("http://127.0.0.1") || !serviceKey || !email || !password, "Local Supabase and demo administrator credentials are required.");
  const admin = createClient(supabaseUrl!, serviceKey!, { auth: { persistSession: false } });
  const weddingId = randomUUID();
  const slug = `timeline-test-${weddingId.slice(0, 8)}`;
  try {
    const { error: weddingError } = await admin.from("weddings").insert({ id: weddingId, partner_one_name: "Maya", partner_two_name: "Noah", display_names: "Maya & Noah", slug, package: "bespoke", status: "draft", wedding_at: "2027-05-22T20:00:00.000Z", timezone: "America/Jamaica" });
    expect(weddingError).toBeNull();
    expect((await admin.from("wedding_theme_settings").insert({ wedding_id: weddingId, theme_id: "timeless-romance", settings_version: 2, theme_overrides: {} })).error).toBeNull();
    expect((await admin.from("wedding_sections").insert([
      { wedding_id: weddingId, section_key: "hero", enabled: true, position: 0 },
      { wedding_id: weddingId, section_key: "countdown", enabled: true, position: 1 },
      { wedding_id: weddingId, section_key: "welcome", enabled: true, position: 2 },
      { wedding_id: weddingId, section_key: "ceremony", enabled: true, position: 3 },
      { wedding_id: weddingId, section_key: "reception", enabled: true, position: 4 },
      { wedding_id: weddingId, section_key: "timeline", enabled: true, position: 5 },
      { wedding_id: weddingId, section_key: "dress_code", enabled: true, position: 6 },
      { wedding_id: weddingId, section_key: "contact", enabled: true, position: 7 },
      { wedding_id: weddingId, section_key: "closing", enabled: true, position: 8 },
    ])).error).toBeNull();
    expect((await admin.from("wedding_events").insert([
      { wedding_id: weddingId, event_type: "ceremony", venue_name: "Norse Hill", address: "Norse Hill Estate", parish: "Saint Andrew", starts_at: "2027-05-22T20:00:00.000Z", maps_url: "https://maps.google.com" },
      { wedding_id: weddingId, event_type: "reception", venue_name: "Hope Garden", address: "Hope Gardens", parish: "Saint Andrew", starts_at: "2027-05-22T22:00:00.000Z", maps_url: "https://maps.google.com" },
    ])).error).toBeNull();

    await page.goto(`/login?next=/admin/weddings/${weddingId}/edit/content`);
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/weddings/${weddingId}/edit/content`));
    await page.getByRole("button", { name: "Add moment" }).click();
    await page.getByLabel("Date", { exact: true }).fill("2025-12-24");
    await page.getByLabel("Moment title", { exact: true }).fill("The proposal");
    await page.getByLabel("Details", { exact: true }).fill("A candlelit Christmas Eve proposal in the garden.");
    await page.getByLabel("Introductory message").fill("Welcome to our wedding celebration.");
    await page.getByLabel("Wedding hashtag").fill("#MayaAndNoah");
    await page.getByLabel("Dress code", { exact: true }).fill("Garden formal");
    await page.getByLabel("Contact information").fill("Call our wedding coordinator at 555-0100.");
    await page.getByRole("button", { name: "Save & continue" }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/weddings/${weddingId}/edit/design`));

    const { data: moments, error: momentsError } = await admin.from("wedding_timeline_items").select("occurred_on,title,description").eq("wedding_id", weddingId);
    expect(momentsError).toBeNull();
    expect(moments).toEqual([{ occurred_on: "2025-12-24", title: "The proposal", description: "A candlelit Christmas Eve proposal in the garden." }]);

    await page.goto(`/admin/weddings/${weddingId}/preview/site`);
    const ceremony = page.locator("#ceremony");
    const reception = page.locator("#reception");
    await expect(ceremony).toBeVisible(); await expect(reception).toBeVisible();
    const ceremonyBox = await ceremony.boundingBox(); const receptionBox = await reception.boundingBox();
    expect(ceremonyBox?.height).toBeLessThan(650); expect(receptionBox?.height).toBeLessThan(650);
    expect(ceremonyBox?.width).toBeLessThan(1200); expect(receptionBox?.width).toBeLessThan(1200);
    await expect(ceremony).toHaveCSS("border-top-style", "solid");
    await expect(page.locator("#timeline")).toContainText("The proposal");

    const heroBox = await page.locator("#hero").boundingBox();
    const countdownBox = await page.locator("#countdown").boundingBox();
    expect(Math.abs((heroBox!.y + heroBox!.height) - countdownBox!.y)).toBeLessThanOrEqual(1);
    for (const sectionId of ["welcome", "timeline", "dress_code", "contact"]) {
      const section = page.locator(`#${sectionId}`);
      const sectionBox = await section.boundingBox();
      const headingBox = await section.locator(".wedding-section-heading").boundingBox();
      expect(Math.abs((sectionBox!.x + sectionBox!.width / 2) - (headingBox!.x + headingBox!.width / 2))).toBeLessThanOrEqual(2);
    }
    await expect(page.locator(".timeless-page")).toHaveCSS("background-image", "none");
    await page.screenshot({ path: testInfo.outputPath("timeless-events-and-timeline.png"), fullPage: true });
  } finally {
    await admin.from("weddings").delete().eq("id", weddingId);
  }
});

test("Signature clearly locks Relationship Timeline to Bespoke", async ({ page }) => {
  test.skip(!email || !password, "Demo administrator credentials are required.");
  await page.goto("/login?next=/admin/weddings/00000000-0000-0000-0000-000000000001/edit/content");
  await page.getByLabel("Email address").fill(email!); await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page.locator(".timeline-editor")).toContainText("Bespoke feature");
  await expect(page.getByRole("button", { name: "Add moment" })).toHaveCount(0);
});
