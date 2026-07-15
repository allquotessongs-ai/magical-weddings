import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function verifyInvitation(page: Page) { await page.goto("/annetteandclive"); const button=page.getByRole("button",{name:/open invitation/i}); if(await button.isVisible()) await button.click(); await expect(page.getByRole("heading",{name:/Annette/}).first()).toBeVisible(); const results=await new AxeBuilder({page}).analyze(); expect(results.violations.filter(v=>v.impact==="critical")).toEqual([]); }
test("public demo opens and exposes the celebration",async({page})=>verifyInvitation(page));
test("public demo works at a touch-friendly mobile viewport",async({page})=>{await page.setViewportSize({width:390,height:844});await verifyInvitation(page)});
