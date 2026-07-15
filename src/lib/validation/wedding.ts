import { z } from "zod";
import { RESERVED_SLUGS, SECTION_KEYS } from "@/lib/config/brand";

export const packageSchema = z.enum(["essential", "signature", "bespoke"]);
export const statusSchema = z.enum(["draft", "scheduled", "published", "archived"]);
export const themeSchema = z.enum(["timeless-romance", "tropical-elegance", "modern-minimal"]);

export const slugSchema = z.string().trim().toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(60, "Use no more than 60 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "This URL is reserved by the platform");

export const weddingBasicsSchema = z.object({
  partnerOneName: z.string().trim().min(1).max(80),
  partnerTwoName: z.string().trim().min(1).max(80),
  displayNames: z.string().trim().min(3).max(120),
  slug: slugSchema,
  package: packageSchema,
  status: statusSchema.default("draft"),
  weddingAt: z.string().datetime(),
  timezone: z.string().default("America/Jamaica"),
  contactEmail: z.string().email().or(z.literal("")),
  contactPhone: z.string().trim().max(32),
});

export const eventSchema = z.object({
  eventType: z.enum(["ceremony", "reception"]), venueName: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(300), parish: z.string().trim().min(1).max(80),
  startsAt: z.string().datetime(), mapsUrl: z.string().url().or(z.literal("")),
  transportationNotes: z.string().max(2000), parkingNotes: z.string().max(2000),
});

export const themeSettingsSchema = z.object({
  themeId: themeSchema,
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  headingFont: z.enum(["Cormorant Garamond", "Playfair Display", "DM Serif Display"]),
  bodyFont: z.enum(["Manrope", "Inter", "Lora"]),
  backgroundStyle: z.enum(["plain", "paper", "soft", "editorial"]),
  buttonStyle: z.enum(["solid", "outline", "pill"]),
  radius: z.enum(["none", "soft", "round"]),
  motion: z.enum(["none", "subtle", "expressive"]),
  decoration: z.enum(["none", "fine-lines", "botanical", "geometric"]),
});

export const sectionOrderSchema = z.array(z.object({
  key: z.enum(SECTION_KEYS), enabled: z.boolean(), position: z.number().int().min(0),
})).length(SECTION_KEYS.length);

export const mediaUploadSchema = z.object({
  weddingId: z.string().uuid(), purpose: z.enum(["hero", "portrait", "gallery", "wedding_party", "texture", "music"]),
  fileName: z.string().min(1).max(180), mimeType: z.string(), size: z.number().int().positive(),
  altText: z.string().trim().max(240).default(""),
}).superRefine((value, ctx) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const audioTypes = ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/x-m4a"];
  const isMusic = value.purpose === "music";
  if (!(isMusic ? audioTypes : imageTypes).includes(value.mimeType)) ctx.addIssue({ code: "custom", message: "Unsupported file type" });
  if (value.size > (isMusic ? 15 : 12) * 1024 * 1024) ctx.addIssue({ code: "custom", message: `File exceeds the ${isMusic ? 15 : 12} MB limit` });
  if (!isMusic && !value.altText) ctx.addIssue({ code: "custom", path: ["altText"], message: "Describe this image for guests using screen readers" });
});
