import Link from "next/link";
import { ArrowRight, CalendarDays, Globe2, Heart, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/config/brand";
import { buttonClass } from "@/components/ui/button";

export default function HomePage() {
  return <main className="marketing-page">
    <header className="marketing-nav"><Link className="brand-lockup" href="/"><span>MW</span>{BRAND.name}</Link><nav><a href="#experience">Experience</a><a href="#packages">Packages</a><Link className={buttonClass({ size: "sm" })} href="/login">Owner login</Link></nav></header>
    <section className="marketing-hero">
      <div className="hero-copy"><p className="eyebrow">Made with love in Jamaica</p><h1>Your wedding story,<br/><em>beautifully told.</em></h1><p>Personal wedding websites that feel like the celebration itself—warm, elegant, and unmistakably yours.</p><div className="hero-actions"><Link className={buttonClass({ size: "lg" })} href="/annetteandclive">View demo invitation <ArrowRight size={18}/></Link><a className={buttonClass({ variant: "outline", size: "lg" })} href="#packages">Explore packages</a></div></div>
      <div className="hero-art" aria-label="Elegant invitation preview"><div className="hero-art-card"><Sparkles/><p>Together with their families</p><h2>Annette<br/><i>&</i><br/>Clive</h2><span>20 · 02 · 2027</span></div><div className="petal petal-one"/><div className="petal petal-two"/></div>
    </section>
    <section id="experience" className="marketing-section"><p className="eyebrow">One platform, every love story</p><h2>Thoughtful details from invitation to “I do.”</h2><div className="feature-grid">
      {[ [Palette,"Distinctive themes","Four art-directed themes with unique composition, imagery, type, and details tailored to every couple."], [CalendarDays,"Everything in one place","Schedule, venues, menu, gallery, directions, and the story behind the day."], [Globe2,"Made for sharing","Fast mobile invitations with rich WhatsApp previews and calendar links."], [ShieldCheck,"Private by design","Tenant isolation, protected drafts, secure media, and carefully scoped access."], [Heart,"Emotion first","A cinematic opening, considered movement, and room for your photographs to breathe."], [Sparkles,"Built to grow","One maintainable platform ready for RSVP, seating, custom domains, and more."] ].map(([Icon,title,copy]) => { const FeatureIcon = Icon as typeof Heart; return <article key={String(title)}><FeatureIcon/><h3>{String(title)}</h3><p>{String(copy)}</p></article>; })}
    </div></section>
    <section id="packages" className="package-section"><p className="eyebrow">Packages</p><h2>A beautiful beginning at every level.</h2><div className="package-grid">
      <article><span>Essential</span><h3>The heartfelt essentials</h3><p>Curated theme, story, events, schedule, gallery, directions, RSVP link, and WhatsApp sharing.</p></article>
      <article className="featured"><span>Signature · Most loved</span><h3>A richer celebration</h3><p>Custom styling, music, wedding party, travel details, FAQ, expanded gallery, and calendar.</p></article>
      <article><span>Bespoke</span><h3>Uniquely, completely yours</h3><p>Everything in Signature, with timeline and an upgrade path to domains, guest privacy, and seating.</p></article>
    </div></section>
    <footer><div className="brand-lockup"><span>MW</span>{BRAND.name}</div><p>Elegant wedding websites for unforgettable Jamaican celebrations.</p><small>© {new Date().getFullYear()} Magical Weddings</small></footer>
  </main>;
}
