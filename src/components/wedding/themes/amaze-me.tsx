"use client";

import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSections } from "./shared";

export function AmazeMeTheme(props: ThemePageProps) {
  return <div className="theme-page amaze-page" data-theme-renderer="amaze-me">
    <div className="amaze-aurora" aria-hidden="true"><i /><i /><i /></div>
    <ThemeNavigation wedding={props.wedding} sections={props.sections} variant="amaze-me" />
    <main>
      <div className="amaze-prologue" aria-hidden="true"><span>A magical celebration</span><b>✦</b><i>Written in the stars</i><b>✦</b><span>One extraordinary love</span></div>
      <ThemeSections {...props} variant="amaze-me" />
    </main>
  </div>;
}
