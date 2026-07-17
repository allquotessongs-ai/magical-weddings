"use client";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";
export function ModernMinimalTheme(props: ThemePageProps) { return <div className="theme-page modern-page" data-theme-renderer="modern-minimal"><ThemeNavigation wedding={props.wedding} sections={props.sections} variant="modern-minimal" /><main><div className="modern-index" aria-hidden="true"><span>Magical Weddings</span><span>{props.wedding.weddingAt.slice(0, 4)}</span></div><ThemeSections {...props} variant="modern-minimal" /></main></div>; }
