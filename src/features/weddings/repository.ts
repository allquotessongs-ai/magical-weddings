import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { demoWedding } from "./demo";
import { getEntitlements } from "@/features/entitlements";
import { getThemeDefinition, parseOverrideMap, resolveTheme, themeFromLegacy } from "@/features/themes/registry";
import type { ThemeOverrideMap } from "@/features/themes/types";
import type { PackageName, WeddingSite, WeddingStatus, WeddingSummary } from "./types";

type Row = Record<string, unknown>;
const rows = (value: unknown) => Array.isArray(value) ? value as Row[] : [];
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;

export function mapPublicPayload(payload: unknown): WeddingSite | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const wedding = (data.wedding ?? {}) as Row;
  const content = (data.content ?? {}) as Row;
  const theme = (data.theme ?? {}) as Row;
  const packageName = text(wedding.package, "essential") as PackageName;
  const entitlements = getEntitlements(packageName);
  const mediaRows = rows(data.media);
  const mediaByPurpose: WeddingSite["media"] = {};
  const focalByPurpose: WeddingSite["mediaFocalPoints"] = {};
  for (const media of mediaRows) {
    const purpose = text(media.purpose) as keyof WeddingSite["media"];
    if (["hero", "portrait", "texture", "music"].includes(purpose)) {
      mediaByPurpose[purpose] = text(media.id);
      const metadata = media.metadata && typeof media.metadata === "object" ? media.metadata as Row : {};
      const x = Number(metadata.focalX); const y = Number(metadata.focalY);
      if (purpose !== "music" && Number.isFinite(x) && Number.isFinite(y)) focalByPurpose[purpose] = { x, y };
    }
  }
  return {
    id: text(wedding.id), slug: text(wedding.slug), partnerOneName: text(wedding.partner_one_name), partnerTwoName: text(wedding.partner_two_name),
    displayNames: text(wedding.display_names), weddingAt: text(wedding.wedding_at), timezone: text(wedding.timezone, "America/Jamaica"),
    package: packageName, status: text(wedding.status, "draft") as WeddingStatus,
    content: {
      introduction: text(content.introduction), coupleStory: text(content.couple_story), engagementStory: text(content.engagement_story),
      hashtag: text(content.hashtag), dressCode: text(content.dress_code), accommodation: text(content.accommodation),
      registry: text(content.registry_information), contactInformation: text(content.contact_information), closingMessage: text(content.closing_message),
      rsvpMode: text(content.rsvp_mode) as WeddingSite["content"]["rsvpMode"], rsvpTarget: text(content.rsvp_target),
    },
    events: rows(data.events).map((event) => ({ type: text(event.event_type) as "ceremony" | "reception", venue: text(event.venue_name), address: text(event.address), parish: text(event.parish), startsAt: text(event.starts_at), mapsUrl: text(event.maps_url), transportationNotes: text(event.transportation_notes), parkingNotes: text(event.parking_notes) })),
    schedule: rows(data.schedule).map((item) => ({ id: text(item.id), startsAt: text(item.starts_at), title: text(item.title), description: text(item.description) })),
    menu: rows(data.menu).map((item) => ({ id: text(item.id), category: text(item.category), name: text(item.name), description: text(item.description) })),
    faqs: rows(data.faqs).map((item) => ({ id: text(item.id), question: text(item.question), answer: text(item.answer) })),
    party: rows(data.party).map((item) => ({ id: text(item.id), name: text(item.name), role: text(item.role), biography: text(item.biography), mediaId: text(item.media_id) || undefined })),
    gallery: rows(data.gallery).map((item) => ({ id: text(item.id), mediaId: text(item.media_id), caption: text(item.caption), altText: text(item.alt_text) })),
    timeline: rows(data.timeline).map((item) => ({ id: text(item.id), occurredOn: text(item.occurred_on), title: text(item.title), description: text(item.description) })),
    sections: rows(data.sections).map((item) => ({ key: text(item.section_key), enabled: Boolean(item.enabled), position: Number(item.position) })),
    media: mediaByPurpose, mediaFocalPoints: focalByPurpose,
    theme: (() => {
      const definition = getThemeDefinition(theme.theme_id);
      const versioned = Number(theme.settings_version) === 2;
      const overrideMap: ThemeOverrideMap = versioned
        ? parseOverrideMap(theme.theme_overrides)
        : { [definition.id]: themeFromLegacy(theme) };
      return resolveTheme(definition.id, overrideMap, entitlements.themeCustomization);
    })(),
    entitlements,
  };
}

export const getPublicWedding = cache(async (slug: string): Promise<WeddingSite | null> => {
  if (!hasSupabaseConfig()) return process.env.DEMO_MODE === "true" && ["demo", demoWedding.slug].includes(slug) ? demoWedding : null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_wedding_by_slug", { requested_slug: slug });
  if (error) throw new Error("The wedding could not be loaded.");
  return mapPublicPayload(data);
});

export async function getWeddingSummaries(query = "", status = "all", page = 1) {
  const supabase = await createServerSupabaseClient();
  let request = supabase.from("weddings").select("id,display_names,wedding_at,slug,package,status,custom_domain,created_at,updated_at,wedding_theme_settings(theme_id)", { count: "exact" });
  if (query) request = request.ilike("display_names", `%${query.replace(/[%_]/g, "")}%`);
  if (status !== "all") request = request.eq("status", status);
  const from = Math.max(0, page - 1) * 20;
  const { data, count, error } = await request.order("updated_at", { ascending: false }).range(from, from + 19);
  if (error) throw new Error(error.message);
  const items: WeddingSummary[] = (data ?? []).map((row) => {
    const themeJoin = row.wedding_theme_settings as unknown as { theme_id?: string } | Array<{ theme_id?: string }> | null;
    const themeId = Array.isArray(themeJoin) ? themeJoin[0]?.theme_id : themeJoin?.theme_id;
    return { id: row.id, displayNames: row.display_names, weddingAt: row.wedding_at, slug: row.slug, package: row.package as PackageName, status: row.status as WeddingStatus, themeId: getThemeDefinition(themeId).id, customDomain: row.custom_domain, createdAt: row.created_at, updatedAt: row.updated_at };
  });
  return { items, count: count ?? 0, page };
}

export async function getDashboardData() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("weddings").select("id,status,wedding_at,publish_at,updated_at,display_names,slug").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const now = Date.now();
  const effective = (data ?? []).map((row) => ({ ...row, effectivePublished: row.status === "published" || (row.status === "scheduled" && row.publish_at && new Date(row.publish_at).getTime() <= now) }));
  return {
    counts: { total: effective.length, draft: effective.filter((w) => w.status === "draft").length, published: effective.filter((w) => w.effectivePublished).length, scheduled: effective.filter((w) => w.status === "scheduled" && !w.effectivePublished).length, archived: effective.filter((w) => w.status === "archived").length, upcoming: effective.filter((w) => w.status !== "archived" && new Date(w.wedding_at).getTime() >= now).length },
    recent: effective.slice(0, 6),
  };
}

export async function getAdminWedding(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data: wedding } = await supabase.from("weddings").select("*,wedding_content(*),wedding_theme_settings(*),wedding_events(*),wedding_sections(*),wedding_media(*),wedding_gallery(*),wedding_schedule_items(*),wedding_menu_items(*),wedding_faqs(*),wedding_party_members(*),wedding_timeline_items(*)").eq("id", id).maybeSingle();
  if (!wedding) notFound();
  return wedding;
}

export async function getPreviewWedding(id: string) {
  const raw = await getAdminWedding(id) as unknown as Record<string, unknown>;
  const activeMedia = rows(raw.wedding_media).filter((item) => item.active !== false);
  const activeMediaIds = new Set(activeMedia.map((item) => text(item.id)));
  return mapPublicPayload({
    wedding: raw,
    content: Array.isArray(raw.wedding_content) ? raw.wedding_content[0] : raw.wedding_content,
    theme: Array.isArray(raw.wedding_theme_settings) ? raw.wedding_theme_settings[0] : raw.wedding_theme_settings,
    events: raw.wedding_events,
    sections: raw.wedding_sections,
    media: activeMedia,
    schedule: raw.wedding_schedule_items,
    menu: raw.wedding_menu_items,
    faqs: raw.wedding_faqs,
    party: raw.wedding_party_members,
    timeline: raw.wedding_timeline_items,
    gallery: rows(raw.wedding_gallery).filter((item) => activeMediaIds.has(text(item.media_id))),
  });
}
