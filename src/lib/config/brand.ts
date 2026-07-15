export const BRAND = {
  name: "Magical Weddings",
  description: "Elegant, deeply personal wedding websites made for celebrations in Jamaica.",
  defaultTimezone: "America/Jamaica",
} as const;

export const JAMAICAN_PARISHES = [
  "Clarendon", "Hanover", "Kingston", "Manchester", "Portland", "Saint Andrew",
  "Saint Ann", "Saint Catherine", "Saint Elizabeth", "Saint James", "Saint Mary",
  "Saint Thomas", "Trelawny", "Westmoreland", "Other / outside Jamaica",
] as const;

export const RESERVED_SLUGS = new Set([
  "admin", "login", "api", "dashboard", "auth", "privacy", "terms", "preview",
  "media", "favicon.ico", "robots.txt", "sitemap.xml", "_next",
]);

export const SECTION_KEYS = [
  "opening", "hero", "countdown", "welcome", "story", "timeline", "ceremony",
  "reception", "schedule", "wedding_party", "dress_code", "menu", "gallery",
  "accommodation", "transportation", "registry", "faq", "rsvp", "contact", "closing",
] as const;

export const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  opening: "Opening invitation", hero: "Hero", countdown: "Countdown",
  welcome: "Welcome message", story: "Our story", timeline: "Relationship timeline",
  ceremony: "Ceremony details", reception: "Reception details", schedule: "Schedule",
  wedding_party: "Wedding party", dress_code: "Dress code", menu: "Menu",
  gallery: "Gallery", accommodation: "Accommodation", transportation: "Transportation",
  registry: "Registry", faq: "Frequently asked questions", rsvp: "RSVP",
  contact: "Contact", closing: "Closing message",
};

export const WIZARD_STEPS = [
  { id: 1, slug: "basics", label: "Basics" },
  { id: 2, slug: "events", label: "Events" },
  { id: 3, slug: "content", label: "Content" },
  { id: 4, slug: "design", label: "Design" },
  { id: 5, slug: "media", label: "Media" },
  { id: 6, slug: "sections", label: "Sections" },
  { id: 7, slug: "publish", label: "Preview & publish" },
] as const;
