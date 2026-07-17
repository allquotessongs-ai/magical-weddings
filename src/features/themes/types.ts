import type { ComponentType } from "react";
import type { WeddingSite } from "@/features/weddings/types";

export const THEME_IDS = ["timeless-romance", "tropical-elegance", "modern-minimal", "enchanted-garden"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const HEADING_FONTS = ["Cormorant Garamond", "Playfair Display", "DM Serif Display", "Manrope"] as const;
export const BODY_FONTS = ["Manrope", "Inter", "Lora"] as const;
export const DECORATIVE_FONTS = ["Cormorant Garamond", "Playfair Display", "Lora"] as const;

export type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: (typeof HEADING_FONTS)[number];
  bodyFont: (typeof BODY_FONTS)[number];
  decorativeFont: (typeof DECORATIVE_FONTS)[number];
  radius: "none" | "soft" | "round";
  shadow: "none" | "soft" | "dramatic";
  sectionSpacing: "compact" | "balanced" | "airy";
  motion: "none" | "subtle" | "expressive";
  imageTreatment: "natural" | "editorial" | "layered" | "dreamy";
  backgroundStyle: "plain" | "paper" | "soft" | "editorial";
  buttonStyle: "solid" | "outline" | "pill";
  decoration: "none" | "fine-lines" | "botanical" | "geometric" | "floral";
};

export type ThemeOverrides = Partial<ThemeTokens>;
export type ThemeOverrideMap = Partial<Record<ThemeId, ThemeOverrides>>;
export type ResolvedTheme = ThemeTokens & { id: ThemeId; label: string; overrides: ThemeOverrideMap };

export type ThemePageProps = {
  wedding: WeddingSite;
  sections: Array<{ key: string; enabled: boolean; position: number }>;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  shareText: string;
};

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  description: string;
  defaults: ThemeTokens;
};

export type ThemeComponentDefinition = ThemeDefinition & { component: ComponentType<ThemePageProps> };
