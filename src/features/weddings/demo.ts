import { getEntitlements } from "@/features/entitlements";
import type { WeddingSite } from "./types";
import { SECTION_KEYS } from "@/lib/config/brand";
import { resolveTheme } from "@/features/themes/registry";

export const demoWedding: WeddingSite = {
  id: "00000000-0000-0000-0000-000000000001", slug: "annetteandclive",
  partnerOneName: "Annette", partnerTwoName: "Clive", displayNames: "Annette & Clive",
  weddingAt: "2027-02-20T20:00:00.000Z", timezone: "America/Jamaica", package: "signature", status: "published",
  contactEmail: "celebrate@example.test", contactPhone: "+1 876 555 0100",
  content: {
    introduction: "With joyful hearts, we invite you to share in the beginning of our forever.",
    coupleStory: "A chance meeting in Kingston became long conversations, Sunday drives, and a love that felt like home. We cannot wait to celebrate this next chapter with the people who shaped our story.",
    engagementStory: "At sunset above the Blue Mountains, Clive asked one beautiful question. Annette said yes before he had finished asking.",
    hashtag: "#AnnetteAndClive", dressCode: "Island formal — rich colour, breathable fabrics, and dancing shoes.",
    accommodation: "A preferred room block is available near the reception. Mention our names when reserving.",
    registry: "Your presence is our greatest gift. For those who wish, a private registry link is available from the couple.",
    contactInformation: "Questions? Send us a note and our wedding team will be happy to help.",
    closingMessage: "We cannot wait to celebrate beneath the Jamaican sky with you.",
    rsvpMode: "external_url", rsvpTarget: "https://example.com/rsvp",
  },
  events: [
    { type: "ceremony", venue: "Hope Botanical Gardens", address: "Old Hope Road", parish: "Saint Andrew", startsAt: "2027-02-20T20:00:00.000Z", mapsUrl: "https://maps.google.com" },
    { type: "reception", venue: "The Terrace", address: "Kingston", parish: "Kingston", startsAt: "2027-02-20T22:00:00.000Z", mapsUrl: "https://maps.google.com", parkingNotes: "Complimentary parking and security will be available." },
  ],
  schedule: [
    { id: "1", startsAt: "2027-02-20T19:30:00.000Z", title: "Guest arrival", description: "Welcome drinks in the garden" },
    { id: "2", startsAt: "2027-02-20T20:00:00.000Z", title: "Ceremony" },
    { id: "3", startsAt: "2027-02-20T22:00:00.000Z", title: "Dinner & dancing" },
  ],
  menu: [
    { id: "1", category: "Main", name: "Jerk-spiced chicken", description: "Coconut rice, seasonal vegetables, tamarind jus" },
    { id: "2", category: "Main", name: "Roasted callaloo parcel", description: "Plantain, pumpkin and herb sauce" },
    { id: "3", category: "Dessert", name: "Rum cake", description: "Vanilla bean cream and tropical fruit" },
  ],
  faqs: [
    { id: "1", question: "May I bring a guest?", answer: "Your invitation will note the number of seats reserved for your household." },
    { id: "2", question: "Will the celebration be outdoors?", answer: "The ceremony is outdoors, with a covered reception immediately afterward." },
  ],
  party: [
    { id: "1", name: "Rochelle Brown", role: "Maid of Honour", biography: "Annette's sister and lifelong confidante." },
    { id: "2", name: "Dwayne Campbell", role: "Best Man", biography: "Clive's closest friend since school." },
  ],
  gallery: [], timeline: [],
  sections: SECTION_KEYS.map((key, position) => ({ key, position, enabled: !["timeline"].includes(key) })),
  media: {}, mediaFocalPoints: {},
  theme: resolveTheme("tropical-elegance"),
  entitlements: getEntitlements("signature"),
};
