import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "") {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatWeddingDate(iso: string, timezone = "America/Jamaica") {
  return new Intl.DateTimeFormat("en-JM", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: timezone,
  }).format(new Date(iso));
}

export function formatWeddingTime(iso: string, timezone = "America/Jamaica") {
  return new Intl.DateTimeFormat("en-JM", {
    hour: "numeric", minute: "2-digit", timeZone: timezone,
  }).format(new Date(iso));
}
