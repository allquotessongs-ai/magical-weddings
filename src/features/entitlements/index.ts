import type { PackageName } from "@/features/weddings/types";

export type Entitlements = {
  galleryLimit: number;
  themeCustomization: boolean;
  backgroundMusic: boolean;
  weddingParty: boolean;
  accommodation: boolean;
  transportation: boolean;
  faq: boolean;
  addToCalendar: boolean;
  personalizedOpening: boolean;
  timeline: boolean;
};

const MATRIX: Record<PackageName, Entitlements> = {
  essential: { galleryLimit: 24, themeCustomization: false, backgroundMusic: false, weddingParty: false, accommodation: false, transportation: false, faq: false, addToCalendar: false, personalizedOpening: false, timeline: false },
  signature: { galleryLimit: 75, themeCustomization: true, backgroundMusic: true, weddingParty: true, accommodation: true, transportation: true, faq: true, addToCalendar: true, personalizedOpening: true, timeline: false },
  bespoke: { galleryLimit: 200, themeCustomization: true, backgroundMusic: true, weddingParty: true, accommodation: true, transportation: true, faq: true, addToCalendar: true, personalizedOpening: true, timeline: true },
};

export function getEntitlements(packageName: PackageName): Entitlements {
  return MATRIX[packageName];
}

export function sectionEntitlement(key: string, entitlements: Entitlements) {
  const gated: Record<string, keyof Entitlements> = {
    timeline: "timeline", wedding_party: "weddingParty", accommodation: "accommodation",
    transportation: "transportation", faq: "faq",
  };
  const entitlement = gated[key];
  return entitlement ? Boolean(entitlements[entitlement]) : true;
}
