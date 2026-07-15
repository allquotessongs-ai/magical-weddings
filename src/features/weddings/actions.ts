"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertSuperAdmin } from "@/lib/security/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SECTION_KEYS } from "@/lib/config/brand";
import { getEntitlements } from "@/features/entitlements";
import { slugSchema, themeSettingsSchema } from "@/lib/validation/wedding";
import type { PackageName } from "./types";

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const toIso = (date: string, time: string) => {
  const value = new Date(`${date}T${time || "12:00"}:00-05:00`);
  if (Number.isNaN(value.getTime())) throw new Error("Enter a valid date and time.");
  return value.toISOString();
};

async function refreshWedding(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("weddings").select("slug").eq("id", id).maybeSingle();
  revalidatePath("/admin");
  revalidatePath("/admin/weddings");
  if (data?.slug) revalidatePath(`/${data.slug}`);
}

export async function createWedding(form: FormData) {
  await assertSuperAdmin();
  const slug = slugSchema.parse(str(form, "slug"));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_wedding_with_defaults", {
    p_partner_one: str(form, "partnerOneName"), p_partner_two: str(form, "partnerTwoName"),
    p_display_names: str(form, "displayNames"), p_slug: slug, p_package: str(form, "package"),
    p_wedding_at: toIso(str(form, "weddingDate"), str(form, "weddingTime")),
    p_timezone: str(form, "timezone") || "America/Jamaica", p_contact_email: str(form, "contactEmail"), p_contact_phone: str(form, "contactPhone"),
  });
  if (error || !data) redirect(`/admin/weddings/new?error=${encodeURIComponent(error?.message ?? "Wedding could not be created")}`);
  revalidatePath("/admin");
  redirect(`/admin/weddings/${data}/edit/events`);
}

export async function saveBasics(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const supabase = await createServerSupabaseClient();
  const payload = { partner_one_name: str(form, "partnerOneName"), partner_two_name: str(form, "partnerTwoName"), display_names: str(form, "displayNames"), slug: slugSchema.parse(str(form, "slug")), package: str(form, "package"), wedding_at: toIso(str(form, "weddingDate"), str(form, "weddingTime")), timezone: str(form, "timezone") || "America/Jamaica", contact_email: str(form, "contactEmail") || null, contact_phone: str(form, "contactPhone") || null };
  const { error } = await supabase.from("weddings").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/events`);
}

export async function saveEvents(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const supabase = await createServerSupabaseClient();
  for (const type of ["ceremony", "reception"] as const) {
    const venue = str(form, `${type}Venue`);
    if (!venue) continue;
    const { error } = await supabase.from("wedding_events").upsert({ wedding_id: id, event_type: type, venue_name: venue, address: str(form, `${type}Address`), parish: str(form, `${type}Parish`), starts_at: toIso(str(form, `${type}Date`), str(form, `${type}Time`)), maps_url: str(form, "mapsUrl") || null, transportation_notes: str(form, "transportationNotes") || null, parking_notes: str(form, "parkingNotes") || null }, { onConflict: "wedding_id,event_type" });
    if (error) throw new Error(error.message);
  }
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/content`);
}

export async function saveContent(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("wedding_content").upsert({ wedding_id: id, introduction: str(form, "introduction"), couple_story: str(form, "coupleStory"), engagement_story: str(form, "engagementStory"), hashtag: str(form, "hashtag"), dress_code: str(form, "dressCode"), accommodation: str(form, "accommodation"), registry_information: str(form, "registry"), contact_information: str(form, "contactInformation"), closing_message: str(form, "closingMessage"), rsvp_mode: str(form, "rsvpMode") || null, rsvp_target: str(form, "rsvpTarget") || null }, { onConflict: "wedding_id" });
  if (error) throw new Error(error.message);
  const weddingDate = str(form, "weddingDate") || new Date().toISOString().slice(0, 10);
  const lines = (key: string) => str(form, key).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((part) => part.trim()));
  const replace = async (table: string, values: Array<Record<string, unknown>>) => {
    const { error: deleteError } = await supabase.from(table).delete().eq("wedding_id", id);
    if (deleteError) throw new Error(deleteError.message);
    if (values.length) { const { error: insertError } = await supabase.from(table).insert(values); if (insertError) throw new Error(insertError.message); }
  };
  await replace("wedding_schedule_items", lines("scheduleItems").map(([time,title,description],sort_order)=>({wedding_id:id,starts_at:toIso(weddingDate,time||"12:00"),title,description:description||null,sort_order})));
  await replace("wedding_menu_items", lines("menuItems").map(([category,name,description],sort_order)=>({wedding_id:id,category,name,description:description||null,sort_order})));
  await replace("wedding_faqs", lines("faqItems").map(([question,answer],sort_order)=>({wedding_id:id,question,answer,sort_order})));
  await replace("wedding_party_members", lines("partyItems").map(([name,role,biography],sort_order)=>({wedding_id:id,name,role,biography:biography||null,sort_order})));
  await replace("wedding_timeline_items", lines("timelineItems").map(([occurred_on,title,description],sort_order)=>({wedding_id:id,occurred_on,title,description:description||null,sort_order})));
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/design`);
}

export async function saveDesign(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const settings = themeSettingsSchema.parse({ themeId: str(form, "themeId"), primaryColor: str(form, "primaryColor"), secondaryColor: str(form, "secondaryColor"), accentColor: str(form, "accentColor"), headingFont: str(form, "headingFont"), bodyFont: str(form, "bodyFont"), backgroundStyle: str(form, "backgroundStyle"), buttonStyle: str(form, "buttonStyle"), radius: str(form, "radius"), motion: str(form, "motion"), decoration: str(form, "decoration") });
  const supabase = await createServerSupabaseClient();
  const { data: wedding } = await supabase.from("weddings").select("package").eq("id", id).single();
  if (!wedding) throw new Error("Wedding not found");
  const allowed = getEntitlements(wedding.package as PackageName).themeCustomization;
  const defaults = settings.themeId === "tropical-elegance" ? ["#174c3c", "#fff8ec", "#d66b4d"] : settings.themeId === "modern-minimal" ? ["#242424", "#f4f1ea", "#a57450"] : ["#5f2438", "#fffaf3", "#bd8c54"];
  const { error } = await supabase.from("wedding_theme_settings").upsert({ wedding_id: id, theme_id: settings.themeId, primary_color: allowed ? settings.primaryColor : defaults[0], secondary_color: allowed ? settings.secondaryColor : defaults[1], accent_color: allowed ? settings.accentColor : defaults[2], heading_font: allowed ? settings.headingFont : "Cormorant Garamond", body_font: allowed ? settings.bodyFont : "Manrope", background_style: allowed ? settings.backgroundStyle : "paper", button_style: allowed ? settings.buttonStyle : "solid", border_radius: allowed ? settings.radius : "soft", animation_intensity: allowed ? settings.motion : "subtle", decorative_elements: allowed ? settings.decoration : "fine-lines" }, { onConflict: "wedding_id" });
  if (error) throw new Error(error.message);
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/media`);
}

export async function saveSections(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const order = JSON.parse(str(form, "order")) as string[];
  if (order.length !== SECTION_KEYS.length || new Set(order).size !== SECTION_KEYS.length || order.some((key) => !SECTION_KEYS.includes(key as never))) throw new Error("Invalid section order");
  const supabase = await createServerSupabaseClient();
  const { data: wedding } = await supabase.from("weddings").select("package").eq("id", id).single();
  if (!wedding) throw new Error("Wedding not found");
  const entitlements = getEntitlements(wedding.package as PackageName);
  const locked: Record<string, boolean> = { timeline: !entitlements.timeline, wedding_party: !entitlements.weddingParty, accommodation: !entitlements.accommodation, transportation: !entitlements.transportation, faq: !entitlements.faq };
  for (let position = 0; position < order.length; position++) {
    const key = order[position];
    const enabled = !locked[key] && form.get(`enabled:${key}`) === "on";
    const { error } = await supabase.from("wedding_sections").update({ position: position + 100, enabled }).eq("wedding_id", id).eq("section_key", key);
    if (error) throw new Error(error.message);
  }
  for (let position = 0; position < order.length; position++) await supabase.from("wedding_sections").update({ position }).eq("wedding_id", id).eq("section_key", order[position]);
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/publish`);
}

export async function changeWeddingStatus(form: FormData) {
  await assertSuperAdmin();
  const id = str(form, "weddingId");
  const action = str(form, "statusAction");
  const supabase = await createServerSupabaseClient();
  if (action === "publish") {
    const [{ data: wedding }, { data: events }, { data: media }] = await Promise.all([
      supabase.from("weddings").select("display_names,slug,wedding_at").eq("id", id).single(),
      supabase.from("wedding_events").select("id").eq("wedding_id", id).eq("event_type", "ceremony"),
      supabase.from("wedding_media").select("id").eq("wedding_id", id).eq("purpose", "hero"),
    ]);
    if (!wedding || !events?.length || !media?.length) redirect(`/admin/weddings/${id}/edit/publish?error=${encodeURIComponent("Add a hero image and ceremony details before publishing")}`);
    await supabase.from("weddings").update({ status: "published", published_at: new Date().toISOString(), publish_at: null }).eq("id", id);
  } else if (action === "schedule") {
    const scheduleAt = new Date(str(form, "publishAt"));
    if (Number.isNaN(scheduleAt.getTime()) || scheduleAt.getTime() <= Date.now()) throw new Error("Choose a future publishing time.");
    await supabase.from("weddings").update({ status: "scheduled", publish_at: scheduleAt.toISOString() }).eq("id", id);
  } else if (action === "archive") await supabase.from("weddings").update({ status: "archived" }).eq("id", id);
  else await supabase.from("weddings").update({ status: "draft", publish_at: null }).eq("id", id);
  await refreshWedding(id); redirect(`/admin/weddings/${id}/edit/publish`);
}
