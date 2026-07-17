"use client";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";
export function TropicalEleganceTheme(props: ThemePageProps) { return <div className="theme-page tropical-page" data-theme-renderer="tropical-elegance"><ThemeNavigation wedding={props.wedding} sections={props.sections} variant="tropical-elegance" /><main><div className="tropical-ribbon" aria-hidden="true"><span>Kingston</span><i>Jamaica</i><span>One love</span></div><ThemeSections {...props} variant="tropical-elegance" /></main></div>; }
