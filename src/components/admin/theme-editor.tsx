"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { WeddingSiteRenderer } from "@/components/wedding/wedding-site";
import { Button, buttonClass } from "@/components/ui/button";
import { saveDesign } from "@/features/weddings/actions";
import { resolveTheme, themeDefinitions, validateThemeContrast } from "@/features/themes/registry";
import type { ThemeId, ThemeOverrideMap, ThemeTokens } from "@/features/themes/types";
import type { WeddingSite } from "@/features/weddings/types";

const viewports = { mobile: { label: "Mobile", width: 390, icon: Smartphone }, tablet: { label: "Tablet", width: 768, icon: Tablet }, desktop: { label: "Desktop", width: 1280, icon: Monitor } } as const;
type Viewport = keyof typeof viewports;
const selectOptions = {
  headingFont: ["Cormorant Garamond", "Playfair Display", "DM Serif Display", "Manrope"], bodyFont: ["Manrope", "Inter", "Lora"], decorativeFont: ["Cormorant Garamond", "Playfair Display", "Lora"],
  backgroundStyle: ["plain", "paper", "soft", "editorial"], buttonStyle: ["solid", "outline", "pill"], radius: ["none", "soft", "round"], shadow: ["none", "soft", "dramatic"],
  sectionSpacing: ["compact", "balanced", "airy"], motion: ["none", "subtle", "expressive"], imageTreatment: ["natural", "editorial", "layered", "dreamy"], decoration: ["none", "fine-lines", "botanical", "geometric", "floral"],
} satisfies Partial<Record<keyof ThemeTokens, readonly string[]>>;

export function ThemeEditor({ wedding, saved }: { wedding: WeddingSite; saved?: boolean }) {
  const [previewId, setPreviewId] = useState<ThemeId>(wedding.theme.id);
  const [drafts, setDrafts] = useState<ThemeOverrideMap>(() => structuredClone(wedding.theme.overrides));
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const canCustomize = wedding.entitlements.themeCustomization;
  const theme = useMemo(() => resolveTheme(previewId, drafts, canCustomize), [previewId, drafts, canCustomize]);
  const previewWedding = useMemo(() => ({ ...wedding, theme }), [wedding, theme]);
  const contrastError = validateThemeContrast(theme);
  function change<K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) { setDrafts((current) => ({ ...current, [previewId]: { ...(current[previewId] ?? {}), [key]: value } })); }
  function reset() { setDrafts((current) => { const next = { ...current }; delete next[previewId]; return next; }); }
  return <div className="theme-editor">
    {saved && <p className="alert success"><Check />Theme saved. The public wedding will change only after you publish.</p>}
    <section className="theme-picker" aria-label="Wedding themes">
      {themeDefinitions.map((definition) => <button type="button" key={definition.id} className={`theme-card theme-card-${definition.id} ${previewId === definition.id ? "selected" : ""}`} onClick={() => setPreviewId(definition.id)} aria-pressed={previewId === definition.id}>
        <span className="theme-swatch"><i /><b /><em /></span><strong>{definition.label}</strong><small>{definition.description}</small><span className="theme-badges">{wedding.theme.id === definition.id && <i>Saved theme</i>}{previewId === definition.id && <b>Previewing</b>}</span>
      </button>)}
    </section>
    <div className="theme-workspace">
      <form action={saveDesign} className="theme-controls">
        <input type="hidden" name="weddingId" value={wedding.id} /><input type="hidden" name="themeId" value={previewId} />
        <div className="theme-control-heading"><div><p className="eyebrow">Customize</p><h2>{theme.label}</h2></div><button type="button" className="reset-theme" onClick={reset} disabled={!canCustomize}><RotateCcw />Reset defaults</button></div>
        {!canCustomize && <p className="entitlement-note">Essential includes all four curated themes. Custom controls unlock with Signature or Bespoke.</p>}
        <div className="theme-colours">
          {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => <label className="theme-colour" key={key}><span>{label(key)}</span><input type="color" name={key} value={theme[key]} disabled={!canCustomize} onChange={(event) => change(key, event.target.value)} />{!canCustomize && <input type="hidden" name={key} value={theme[key]} />}<code>{theme[key]}</code></label>)}
        </div>
        {contrastError && <p className="alert error">{contrastError}</p>}
        <div className="theme-selects">
          {(Object.keys(selectOptions) as Array<keyof typeof selectOptions>).map((key) => <label className="field" key={key}><span>{label(key)}</span><select name={key} value={String(theme[key])} disabled={!canCustomize} onChange={(event) => change(key, event.target.value as never)}>{selectOptions[key].map((option) => <option key={option} value={option}>{label(option)}</option>)}</select>{!canCustomize && <input type="hidden" name={key} value={String(theme[key])} />}</label>)}
        </div>
        <div className="theme-editor-actions"><Button type="submit" disabled={Boolean(contrastError)}>Apply & save theme</Button><Link className={buttonClass({ variant: "outline" })} href={`/admin/weddings/${wedding.id}/edit/media`}>Continue to media</Link></div>
      </form>
      <section className="theme-preview-panel">
        <div className="preview-toolbar"><div><strong>Live wedding preview</strong><span>Previewing {theme.label} · saved theme is {wedding.theme.label}</span></div><div role="group" aria-label="Preview size">{(Object.keys(viewports) as Viewport[]).map((key) => { const Icon = viewports[key].icon; return <button type="button" key={key} aria-label={viewports[key].label} aria-pressed={viewport === key} onClick={() => setViewport(key)}><Icon /> <span>{viewports[key].label}</span></button>; })}</div></div>
        <div className="theme-preview-stage"><div className="theme-preview-frame" style={{ width: viewports[viewport].width }}><WeddingSiteRenderer wedding={previewWedding} preview /></div></div>
      </section>
    </div>
  </div>;
}

function label(value: string) { return value.replace(/([A-Z])/g, " $1").replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase()); }
