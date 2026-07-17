"use client";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";
export function TimelessRomanceTheme(props: ThemePageProps) { return <div className="theme-page timeless-page" data-theme-renderer="timeless-romance"><ThemeNavigation wedding={props.wedding} sections={props.sections} variant="timeless-romance" /><main><div className="timeless-ornament" aria-hidden="true">{props.wedding.partnerOneName.charAt(0)} <i>&</i> {props.wedding.partnerTwoName.charAt(0)}</div><ThemeSections {...props} variant="timeless-romance" /></main></div>; }
