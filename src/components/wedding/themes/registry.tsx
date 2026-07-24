"use client";
import { themeDefinitions } from "@/features/themes/registry";
import type { ThemeComponentDefinition, ThemeId, ThemePageProps } from "@/features/themes/types";
import { EnchantedGardenTheme } from "./enchanted-garden";
import { AmazeMeTheme } from "./amaze-me";
import { IvoryEstateTheme } from "./ivory-estate";
import { ModernMinimalTheme } from "./modern-minimal";
import { TimelessRomanceTheme } from "./timeless-romance";
import { TropicalEleganceTheme } from "./tropical-elegance";

const components = { "timeless-romance": TimelessRomanceTheme, "tropical-elegance": TropicalEleganceTheme, "modern-minimal": ModernMinimalTheme, "enchanted-garden": EnchantedGardenTheme, "amaze-me": AmazeMeTheme, "ivory-estate": IvoryEstateTheme } satisfies Record<ThemeId, typeof TimelessRomanceTheme>;
export const themeRegistry = Object.fromEntries(themeDefinitions.map((definition) => [definition.id, { ...definition, component: components[definition.id] }])) as Record<ThemeId, ThemeComponentDefinition>;
export const getThemeComponent = (id: ThemeId) => themeRegistry[id].component;
export function RegisteredThemePage(props: ThemePageProps) {
  if (props.wedding.theme.id === "tropical-elegance") return <TropicalEleganceTheme {...props} />;
  if (props.wedding.theme.id === "modern-minimal") return <ModernMinimalTheme {...props} />;
  if (props.wedding.theme.id === "enchanted-garden") return <EnchantedGardenTheme {...props} />;
  if (props.wedding.theme.id === "amaze-me") return <AmazeMeTheme {...props} />;
  if (props.wedding.theme.id === "ivory-estate") return <IvoryEstateTheme {...props} />;
  return <TimelessRomanceTheme {...props} />;
}
