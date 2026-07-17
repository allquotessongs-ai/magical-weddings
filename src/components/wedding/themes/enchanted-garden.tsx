"use client";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";
export function EnchantedGardenTheme(props: ThemePageProps) { return <div className="theme-page garden-page" data-theme-renderer="enchanted-garden"><div className="garden-canopy" aria-hidden="true" /><ThemeNavigation wedding={props.wedding} sections={props.sections} variant="enchanted-garden" /><main><div className="garden-whisper" aria-hidden="true">Once upon a forever</div><ThemeSections {...props} variant="enchanted-garden" /></main></div>; }
