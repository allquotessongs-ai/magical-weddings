"use client";

import { BedDouble, CalendarDays, Camera, Heart, Landmark, MailCheck, Plane } from "lucide-react";
import type { ThemePageProps } from "@/features/themes/types";
import { ThemeNavigation, ThemeSection } from "./shared";

const links = [
  { key: "story", label: "Our story", caption: "From first hello to forever.", icon: Heart },
  { key: "schedule", label: "Schedule", caption: "The details of our day.", icon: CalendarDays },
  { key: "ceremony", label: "Venue", caption: "Ceremony and reception details.", icon: Landmark },
  { key: "gallery", label: "Gallery", caption: "A glimpse into our journey.", icon: Camera },
  { key: "transportation", label: "Travel", caption: "Directions and travel notes.", icon: Plane },
  { key: "accommodation", label: "Stay", caption: "Places to rest nearby.", icon: BedDouble },
  { key: "rsvp", label: "RSVP", caption: "Kindly reply when ready.", icon: MailCheck },
] as const;

export function IvoryEstateTheme(props: ThemePageProps) {
  const ordered = [...props.sections].sort((a, b) => a.position - b.position);
  const visibleKeys = new Set(ordered.map((section) => section.key));
  const visibleLinks = links.filter((link) => visibleKeys.has(link.key)).slice(0, 6);
  return <div className="theme-page estate-page" data-theme-renderer="ivory-estate">
    <div className="estate-corner estate-corner-left" aria-hidden="true" /><div className="estate-corner estate-corner-right" aria-hidden="true" />
    <ThemeNavigation wedding={props.wedding} sections={props.sections} variant="ivory-estate" />
    <main>
      {ordered.map((section) => <div className="estate-section-wrap" key={section.key}>
        <ThemeSection section={section.key} {...props} variant="ivory-estate" />
        {section.key === "hero" && visibleLinks.length > 0 && <nav className="estate-quicklinks" aria-label="Wedding highlights">
          {visibleLinks.map(({ key, label, caption, icon: Icon }) => <a href={`#${key}`} key={key}><Icon aria-hidden="true" /><strong>{label}</strong><span>{caption}</span><b>View {label}</b></a>)}
        </nav>}
      </div>)}
    </main>
    <div className="estate-signature" aria-hidden="true"><span>{props.wedding.displayNames}</span><i>♥</i><span>{props.wedding.weddingAt.slice(0, 4)}</span></div>
  </div>;
}
