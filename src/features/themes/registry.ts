import { z } from "zod";
import {
  BODY_FONTS,
  DECORATIVE_FONTS,
  HEADING_FONTS,
  THEME_IDS,
  type ResolvedTheme,
  type ThemeDefinition,
  type ThemeId,
  type ThemeOverrideMap,
  type ThemeOverrides,
  type ThemeTokens,
} from "./types";

export const themeTokenSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  headingFont: z.enum(HEADING_FONTS),
  bodyFont: z.enum(BODY_FONTS),
  decorativeFont: z.enum(DECORATIVE_FONTS),
  radius: z.enum(["none", "soft", "round"]),
  shadow: z.enum(["none", "soft", "dramatic"]),
  sectionSpacing: z.enum(["compact", "balanced", "airy"]),
  motion: z.enum(["none", "subtle", "expressive"]),
  imageTreatment: z.enum(["natural", "editorial", "layered", "dreamy"]),
  backgroundStyle: z.enum(["plain", "paper", "soft", "editorial"]),
  buttonStyle: z.enum(["solid", "outline", "pill"]),
  decoration: z.enum(["none", "fine-lines", "botanical", "geometric", "floral"]),
});
export const themeOverrideSchema = themeTokenSchema.partial().strict();
export const themeOverrideMapSchema = z.partialRecord(z.enum(THEME_IDS), themeOverrideSchema);

const themes: Record<ThemeId, ThemeDefinition> = {
  "timeless-romance": {
    id: "timeless-romance", label: "Timeless Romance", description: "Formal, editorial and invitation-inspired.",
    defaults: { primary: "#5f2438", secondary: "#fffaf3", accent: "#a97943", background: "#fffaf3", text: "#3e2530", headingFont: "Cormorant Garamond", bodyFont: "Lora", decorativeFont: "Playfair Display", radius: "soft", shadow: "soft", sectionSpacing: "airy", motion: "subtle", imageTreatment: "editorial", backgroundStyle: "paper", buttonStyle: "outline", decoration: "fine-lines" },
  },
  "tropical-elegance": {
    id: "tropical-elegance", label: "Tropical Elegance", description: "Warm Jamaican botanicals and layered destination imagery.",
    defaults: { primary: "#174c3c", secondary: "#fff8ec", accent: "#c75d46", background: "#fff8ec", text: "#173b31", headingFont: "DM Serif Display", bodyFont: "Manrope", decorativeFont: "Lora", radius: "round", shadow: "dramatic", sectionSpacing: "balanced", motion: "expressive", imageTreatment: "layered", backgroundStyle: "soft", buttonStyle: "pill", decoration: "botanical" },
  },
  "modern-minimal": {
    id: "modern-minimal", label: "Modern Minimal", description: "Asymmetric grids, crisp type and disciplined whitespace.",
    defaults: { primary: "#242424", secondary: "#f4f1ea", accent: "#966143", background: "#f4f1ea", text: "#242424", headingFont: "Manrope", bodyFont: "Inter", decorativeFont: "Cormorant Garamond", radius: "none", shadow: "none", sectionSpacing: "airy", motion: "subtle", imageTreatment: "editorial", backgroundStyle: "editorial", buttonStyle: "solid", decoration: "geometric" },
  },
  "enchanted-garden": {
    id: "enchanted-garden", label: "Enchanted Garden", description: "Dreamy garden arches, florals and storybook movement.",
    defaults: { primary: "#34513f", secondary: "#fbf5f0", accent: "#9b5c72", background: "#f7efe9", text: "#2d4436", headingFont: "Playfair Display", bodyFont: "Lora", decorativeFont: "Cormorant Garamond", radius: "round", shadow: "soft", sectionSpacing: "airy", motion: "expressive", imageTreatment: "dreamy", backgroundStyle: "soft", buttonStyle: "pill", decoration: "floral" },
  },
  "amaze-me": {
    id: "amaze-me", label: "AMAZE ME", description: "Cinematic midnight glamour, celestial light and couture-level drama.",
    defaults: { primary: "#21142f", secondary: "#fff8ef", accent: "#c99855", background: "#f7efe9", text: "#2a1733", headingFont: "Playfair Display", bodyFont: "Manrope", decorativeFont: "Cormorant Garamond", radius: "round", shadow: "dramatic", sectionSpacing: "airy", motion: "expressive", imageTreatment: "dreamy", backgroundStyle: "soft", buttonStyle: "pill", decoration: "geometric" },
  },
  "ivory-estate": {
    id: "ivory-estate", label: "Ivory Estate", description: "Airy estate romance, champagne details and botanical refinement.",
    defaults: { primary: "#6f7d68", secondary: "#fffdf8", accent: "#bd9850", background: "#f4efe7", text: "#30332f", headingFont: "Playfair Display", bodyFont: "Manrope", decorativeFont: "Cormorant Garamond", radius: "soft", shadow: "soft", sectionSpacing: "balanced", motion: "subtle", imageTreatment: "natural", backgroundStyle: "paper", buttonStyle: "solid", decoration: "botanical" },
  },
};

export const FALLBACK_THEME_ID: ThemeId = "timeless-romance";
export const themeDefinitions = THEME_IDS.map((id) => themes[id]);
export const isThemeId = (value: unknown): value is ThemeId => typeof value === "string" && THEME_IDS.includes(value as ThemeId);
export const getThemeDefinition = (value: unknown) => themes[isThemeId(value) ? value : FALLBACK_THEME_ID];

function channel(value: string) {
  const component = Number.parseInt(value, 16) / 255;
  return component <= 0.03928 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string) {
  return 0.2126 * channel(hex.slice(1, 3)) + 0.7152 * channel(hex.slice(3, 5)) + 0.0722 * channel(hex.slice(5, 7));
}
export function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
export function validateThemeContrast(tokens: Pick<ThemeTokens, "text" | "background">) {
  return contrastRatio(tokens.text, tokens.background) >= 4.5 ? null : "Text and background colours must have at least 4.5:1 contrast.";
}
export function readableForeground(background: string) {
  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#161616") ? "#ffffff" : "#161616";
}

export function parseOverrideMap(value: unknown): ThemeOverrideMap {
  const result = themeOverrideMapSchema.safeParse(value);
  return result.success ? result.data : {};
}

export function resolveTheme(themeId: unknown, overrideMap: unknown = {}, customizationAllowed = true): ResolvedTheme {
  const definition = getThemeDefinition(themeId);
  const overrides = parseOverrideMap(overrideMap);
  const requested = customizationAllowed ? themeOverrideSchema.safeParse(overrides[definition.id] ?? {}) : { success: true as const, data: {} };
  const tokens = { ...definition.defaults, ...(requested.success ? requested.data : {}) };
  if (validateThemeContrast(tokens)) return { ...definition.defaults, id: definition.id, label: definition.label, overrides };
  return { ...tokens, id: definition.id, label: definition.label, overrides };
}

export function themeFromLegacy(theme: Record<string, unknown>): ThemeOverrides {
  const candidate = {
    primary: theme.primary_color, secondary: theme.secondary_color, accent: theme.accent_color,
    background: theme.background_color ?? theme.secondary_color, text: theme.text_color ?? theme.primary_color,
    headingFont: theme.heading_font, bodyFont: theme.body_font, decorativeFont: theme.decorative_font ?? "Cormorant Garamond",
    radius: theme.border_radius, shadow: theme.shadow_style ?? "soft", sectionSpacing: theme.section_spacing ?? "balanced",
    motion: theme.animation_intensity, imageTreatment: theme.image_treatment ?? "natural", backgroundStyle: theme.background_style,
    buttonStyle: theme.button_style, decoration: theme.decorative_elements,
  };
  const parsed = themeOverrideSchema.safeParse(candidate);
  return parsed.success ? parsed.data : {};
}
