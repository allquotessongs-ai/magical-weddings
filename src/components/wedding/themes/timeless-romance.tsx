"use client";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";
export function TimelessRomanceTheme(props: ThemePageProps) { return <div className="theme-page timeless-page" data-theme-renderer="timeless-romance"><ThemeNavigation wedding={props.wedding} sections={props.sections} variant="timeless-romance" /><main><ThemeSections {...props} variant="timeless-romance" /></main></div>; }
