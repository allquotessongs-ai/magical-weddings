import type { Entitlements } from "@/features/entitlements";
import type { ResolvedTheme, ThemeId } from "@/features/themes/types";

export type PackageName = "essential" | "signature" | "bespoke";
export type WeddingStatus = "draft" | "scheduled" | "published" | "archived";
export type { ThemeId } from "@/features/themes/types";

export type WeddingSite = {
  id: string; slug: string; partnerOneName: string; partnerTwoName: string; displayNames: string;
  weddingAt: string; timezone: string; package: PackageName; status: WeddingStatus;
  contactEmail?: string; contactPhone?: string;
  content: {
    introduction?: string; coupleStory?: string; engagementStory?: string; hashtag?: string;
    dressCode?: string; accommodation?: string; registry?: string; contactInformation?: string;
    closingMessage?: string; rsvpMode?: "external_url" | "email" | "whatsapp"; rsvpTarget?: string;
  };
  events: Array<{ type: "ceremony" | "reception"; venue: string; address: string; parish: string; startsAt: string; mapsUrl?: string; transportationNotes?: string; parkingNotes?: string }>;
  schedule: Array<{ id: string; startsAt: string; title: string; description?: string }>;
  menu: Array<{ id: string; category: string; name: string; description?: string }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  party: Array<{ id: string; name: string; role: string; biography?: string; mediaId?: string }>;
  gallery: Array<{ id: string; mediaId: string; caption?: string; altText: string }>;
  timeline: Array<{ id: string; occurredOn: string; title: string; description?: string }>;
  sections: Array<{ key: string; enabled: boolean; position: number }>;
  media: Partial<Record<"hero" | "portrait" | "texture" | "music", string>>;
  mediaFocalPoints: Partial<Record<"hero" | "portrait" | "texture", { x: number; y: number }>>;
  theme: ResolvedTheme;
  entitlements: Entitlements;
};

export type WeddingSummary = {
  id: string; displayNames: string; weddingAt: string; slug: string; package: PackageName;
  status: WeddingStatus; themeId: ThemeId; customDomain?: string | null; createdAt: string; updatedAt: string;
};
