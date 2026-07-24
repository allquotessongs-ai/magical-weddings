"use client";

import Image from "next/image";
import { useState } from "react";
import { CalendarPlus, ChevronDown, Clock3, MapPin, Menu as MenuIcon, Share2, X } from "lucide-react";
import type { ThemeId, ThemePageProps } from "@/features/themes/types";
import type { WeddingSite } from "@/features/weddings/types";
import { formatWeddingDate, formatWeddingTime } from "@/lib/utils";

export const mediaUrl = (id?: string) => id ? `/api/media/${id}` : "";
const titleMap: Record<string, string> = { welcome: "Welcome", story: "Our story", timeline: "Our journey", ceremony: "Ceremony", reception: "Reception", schedule: "The day", wedding_party: "Our people", dress_code: "Dress code", menu: "Menu", gallery: "Gallery", accommodation: "Where to stay", transportation: "Getting there", registry: "Registry", faq: "Questions", rsvp: "RSVP", contact: "Contact", closing: "Until then" };

export function ThemeNavigation({ wedding, sections, variant }: Pick<ThemePageProps, "wedding" | "sections"> & { variant: ThemeId }) {
  const [open, setOpen] = useState(false);
  const links = sections.filter((section) => !["opening", "hero", "countdown", "closing"].includes(section.key));
  return <>
    <header className={`wedding-nav ${variant}-nav`}>
      <a className="couple-mark" href="#hero" aria-label={`${wedding.displayNames} home`}>
        <span>{wedding.partnerOneName.charAt(0)}</span><i>&</i><span>{wedding.partnerTwoName.charAt(0)}</span>
      </a>
      <nav aria-label="Wedding sections">{links.slice(0, 6).map((section) => <a key={section.key} href={`#${section.key}`}>{titleMap[section.key] ?? section.key}</a>)}</nav>
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><MenuIcon /></button>
    </header>
    {open && <div className={`mobile-drawer ${variant}-drawer`} role="dialog" aria-label="Wedding navigation">
      <button aria-label="Close navigation" onClick={() => setOpen(false)}><X /></button>
      {links.map((section) => <a key={section.key} href={`#${section.key}`} onClick={() => setOpen(false)}>{titleMap[section.key] ?? section.key}</a>)}
    </div>}
  </>;
}

function Hero({ wedding, variant }: { wedding: WeddingSite; variant: ThemeId }) {
  const hero = mediaUrl(wedding.media.hero);
  const focal = wedding.mediaFocalPoints.hero ?? { x: 50, y: 22 };
  const image = hero ? <Image src={hero} alt={`${wedding.displayNames} wedding portrait`} fill priority sizes="100vw" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} unoptimized /> : <div className="hero-placeholder" />;
  const copy = <div className="wed-hero-copy"><p>We&apos;re getting married</p><h1><span>{wedding.partnerOneName}</span><i>&</i><span>{wedding.partnerTwoName}</span></h1><span>{formatWeddingDate(wedding.weddingAt, wedding.timezone)}</span><small>Jamaica</small></div>;
  if (variant === "tropical-elegance") return <section id="hero" className="wed-hero tropical-hero"><div className="tropical-hero-media">{image}</div><div className="tropical-sun" aria-hidden="true" />{copy}<Botanical /></section>;
  if (variant === "modern-minimal") return <section id="hero" className="wed-hero modern-hero">{copy}<div className="modern-hero-media">{image}</div><b aria-hidden="true">01</b></section>;
  if (variant === "enchanted-garden") return <section id="hero" className="wed-hero garden-hero"><div className="garden-hero-media">{image}</div><div className="garden-hero-haze" />{copy}<Floral /></section>;
  if (variant === "amaze-me") return <section id="hero" className="wed-hero amaze-hero"><div className="amaze-hero-field" aria-hidden="true"><i /><i /><i /><i /></div><div className="amaze-hero-portal"><div className="amaze-hero-media">{image}</div><span aria-hidden="true" /><b aria-hidden="true" /></div><div className="amaze-hero-seal" aria-hidden="true"><span>A love</span><i>✦</i><span>story</span></div>{copy}</section>;
  if (variant === "ivory-estate") return <section id="hero" className="wed-hero estate-hero"><div className="estate-hero-media">{image}</div><div className="estate-hero-wash" /><div className="estate-hero-sprig" aria-hidden="true"><i /><i /><i /><i /></div><div className="estate-hero-flourish" aria-hidden="true"><span /><b>♥</b><span /></div>{copy}</section>;
  return <section id="hero" className="wed-hero timeless-hero">{image}<div className="wed-hero-overlay" /><div className="timeless-frame" aria-hidden="true" /><div className="timeless-hero-monogram" aria-hidden="true">{wedding.partnerOneName.charAt(0)} <i>&</i> {wedding.partnerTwoName.charAt(0)}</div>{copy}</section>;
}

function Botanical() { return <svg className="botanical-decoration" viewBox="0 0 180 300" aria-hidden="true"><path d="M22 286C90 220 62 112 151 18M72 210C30 194 17 161 18 125M94 161c42-10 64-36 72-70M119 93c-34-12-45-34-43-61" /><path d="M18 125c33 2 49 20 54 56M166 91c-30 5-46 26-52 57M76 32c30 13 41 34 39 61" /></svg>; }
function Floral() { return <div className="floral-decoration" aria-hidden="true"><i /><i /><i /><i /><i /></div>; }

const sectionClass = (base: string, variant: ThemeId) => `theme-section ${base} ${variant}-section`;
function StorySection({ id, eyebrow, title, children, variant, portrait }: { id: string; eyebrow: string; title: string; children: React.ReactNode; variant: ThemeId; portrait?: string }) {
  return <section id={id} className={sectionClass("story-section", variant)}><div className="wedding-section-heading"><p className="wed-eyebrow">{eyebrow}</p><h2>{title}</h2></div><div className="story-copy">{portrait && <Image className="story-portrait" src={mediaUrl(portrait)} alt="Portrait of the couple" width={560} height={700} sizes="(max-width: 700px) 90vw, 45vw" unoptimized />}{children}</div></section>;
}
function ListSection({ id, eyebrow, title, children, variant }: { id: string; eyebrow: string; title: string; children: React.ReactNode; variant: ThemeId }) {
  return <section id={id} className={sectionClass("list-section", variant)}><div className="wedding-section-heading"><p className="wed-eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children}</section>;
}

export function ThemeSection({ section, wedding, countdown, shareText, variant }: ThemePageProps & { section: string; variant: ThemeId }) {
  const content = wedding.content;
  const event = wedding.events.find((item) => item.type === section);
  if (section === "opening") return null;
  if (section === "hero") return <Hero wedding={wedding} variant={variant} />;
  if (section === "countdown") return <section id="countdown" className={sectionClass("countdown-section", variant)}><p>Until we say “I do”</p><div>{Object.entries(countdown).map(([label, value]) => <span key={label}><strong>{String(value).padStart(2, "0")}</strong><small>{label}</small></span>)}</div></section>;
  if (section === "welcome" && content.introduction) return <StorySection id={section} eyebrow="With joyful hearts" title="You are invited" variant={variant}><p className="lead">{content.introduction}</p><p className="hashtag">{content.hashtag}</p></StorySection>;
  if (section === "story" && (content.coupleStory || content.engagementStory)) return <StorySection id={section} eyebrow="How it began" title="Our story" variant={variant} portrait={wedding.media.portrait}><p>{content.coupleStory}</p>{content.engagementStory && <><h3>The proposal</h3><p>{content.engagementStory}</p></>}</StorySection>;
  if ((section === "ceremony" || section === "reception") && event) return <section id={section} className={sectionClass("event-section", variant)}><p className="wed-eyebrow">{section}</p><h2>{event.venue}</h2><div className="event-meta"><span><Clock3 />{formatWeddingTime(event.startsAt, wedding.timezone)}</span><span><MapPin />{event.address}, {event.parish}</span></div>{event.mapsUrl && <a className="wed-button" href={event.mapsUrl} target="_blank" rel="noreferrer">View directions</a>}{event.parkingNotes && <p>{event.parkingNotes}</p>}</section>;
  if (section === "schedule" && wedding.schedule.length) return <ListSection id={section} eyebrow="Order of celebration" title="The day" variant={variant}><div className="schedule-list">{wedding.schedule.map((item, index) => <article className="schedule-row" key={item.id}><b>{String(index + 1).padStart(2, "0")}</b><time>{formatWeddingTime(item.startsAt, wedding.timezone)}</time><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></ListSection>;
  if (section === "dress_code" && content.dressCode) return <StorySection id={section} eyebrow="What to wear" title="Dress code" variant={variant}><p className="lead">{content.dressCode}</p></StorySection>;
  if (section === "menu" && wedding.menu.length) return <ListSection id={section} eyebrow="Made with love" title="Menu" variant={variant}><div className="menu-list">{wedding.menu.map((item) => <article key={item.id}><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p></article>)}</div></ListSection>;
  if (section === "wedding_party" && wedding.party.length) return <ListSection id={section} eyebrow="Beside us" title="Our people" variant={variant}><div className="party-grid">{wedding.party.map((person) => <article key={person.id}>{person.mediaId && <Image src={mediaUrl(person.mediaId)} alt={person.name} width={360} height={450} unoptimized />}<h3>{person.name}</h3><small>{person.role}</small><p>{person.biography}</p></article>)}</div></ListSection>;
  if (section === "gallery" && wedding.gallery.length) return <ListSection id={section} eyebrow="Favourite moments" title="Gallery" variant={variant}><div className="gallery-grid">{wedding.gallery.map((item, index) => <figure key={item.id}><Image src={mediaUrl(item.mediaId)} alt={item.altText} width={index % 3 === 0 ? 900 : 600} height={index % 3 === 0 ? 1100 : 700} sizes="(max-width: 720px) 100vw, 33vw" unoptimized /><figcaption>{item.caption}</figcaption></figure>)}</div></ListSection>;
  if (section === "accommodation" && content.accommodation) return <StorySection id={section} eyebrow="Stay awhile" title="Accommodation" variant={variant}><p>{content.accommodation}</p></StorySection>;
  if (section === "transportation" && wedding.events.some((item) => item.transportationNotes)) return <StorySection id={section} eyebrow="Plan your journey" title="Transportation" variant={variant}><p>{wedding.events.find((item) => item.transportationNotes)?.transportationNotes}</p></StorySection>;
  if (section === "registry" && content.registry) return <StorySection id={section} eyebrow="Your presence is a gift" title="Registry" variant={variant}><p>{content.registry}</p></StorySection>;
  if (section === "faq" && wedding.faqs.length) return <ListSection id={section} eyebrow="Good to know" title="Questions" variant={variant}><div className="faq-list">{wedding.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<ChevronDown /></summary><p>{faq.answer}</p></details>)}</div></ListSection>;
  if (section === "timeline" && wedding.timeline.length) return <ListSection id={section} eyebrow="From then to forever" title="Our journey" variant={variant}><div className="timeline-list">{wedding.timeline.map((item) => <article key={item.id}><time>{new Date(`${item.occurredOn}T12:00:00`).getFullYear()}</time><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></ListSection>;
  if (section === "rsvp" && content.rsvpMode && content.rsvpTarget) { const href = content.rsvpMode === "email" ? `mailto:${content.rsvpTarget}` : content.rsvpMode === "whatsapp" ? `https://wa.me/${content.rsvpTarget.replace(/\D/g, "")}` : content.rsvpTarget; return <section id={section} className={sectionClass("rsvp-section", variant)}><p className="wed-eyebrow">We hope you&apos;ll join us</p><h2>Kindly respond</h2><p>Please let us know whether you can celebrate with us.</p><a className="wed-button" href={href} target="_blank" rel="noreferrer">RSVP now</a></section>; }
  if (section === "contact" && content.contactInformation) return <StorySection id={section} eyebrow="Need a little help?" title="Contact" variant={variant}><p>{content.contactInformation}</p></StorySection>;
  if (section === "closing") return <section id={section} className={sectionClass("closing-section", variant)}><p>{content.closingMessage}</p><h2>{wedding.displayNames}</h2><div className="share-row"><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer"><Share2 />Share on WhatsApp</a>{wedding.entitlements.addToCalendar && <a href={`/${wedding.slug}/calendar.ics`}><CalendarPlus />Add to calendar</a>}</div></section>;
  return null;
}

export function ThemeSections(props: ThemePageProps & { variant: ThemeId }) {
  return <>{[...props.sections].sort((a, b) => a.position - b.position).map((section) => <ThemeSection key={section.key} section={section.key} {...props} />)}</>;
}
