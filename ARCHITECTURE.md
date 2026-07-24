# Architecture

## Boundaries

The App Router is divided into public wedding pages, authentication, platform administration, media routes, and feature-owned server modules. Route files compose behavior; authorization, validation, database access, entitlements, and mapping live outside the page tree.

Public pages receive a sanitized `WeddingSite` from `get_public_wedding_by_slug`. Anonymous callers have no table access. Authenticated administration uses the caller's Supabase session and RLS; the service role is isolated to owner bootstrap and private-media URL signing.

## Tenant isolation

Every wedding-owned table carries `wedding_id`. RLS permits Version 1 mutations only when the authenticated user has a `profiles.platform_role` of `super_admin`. Composite foreign keys stop media from one wedding being attached to another. The future `wedding_members` relationship exists without granting couple access.

The public RPC checks effective publication status and strips private wedding contacts and storage paths. Draft, future scheduled, unpublished, and archived weddings return no result. Private media is accessed by stable application IDs; the media route checks publication or an active super-admin session before creating a five-minute signed Storage URL.

## Rendering and themes

`WeddingSite` is the normalized, presentation-independent contract used by public pages and authenticated previews. Section records are filtered once for enablement, content, order, and entitlements before presentation. The fixed opening invitation is the only ordering exception; when it is disabled the page opens immediately, while the closing section retains its stored position.

The typed theme registry resolves the stable IDs `timeless-romance`, `tropical-elegance`, `modern-minimal`, `enchanted-garden`, `amaze-me`, and `ivory-estate` to separate page shells and hero compositions. Timeless Romance is the fallback for missing or invalid values. Theme components share behavior and safe content primitives but own their navigation, page composition, image treatment, section layout, ornamentation, and footer design.

Theme settings resolve as curated defaults, then per-wedding/per-theme overrides, then contrast safeguards. Essential weddings use curated defaults; Signature and Bespoke can store independent overrides for every theme. Versioned JSON overrides are the current storage contract. Legacy scalar columns remain temporarily so previously captured publication snapshots continue rendering until a wedding is republished.

The Design step renders the current normalized draft directly in a local live preview. Its scrollable stage preserves the real 1280px, 768px, and 390px preview widths, with theme-scoped container breakpoints matching public responsive behavior. Switching themes or viewports does not write to Supabase; Apply & Save validates the selected theme and atomically persists its override entry. Saved draft changes continue to be isolated from the public publication snapshot.

Authenticated routes are dynamic and private/no-store. Public pages revalidate every five minutes; administrative mutations revalidate affected route groups. Music starts only after the opening interaction and retains labelled play, mute, and volume controls.

## Version boundaries

Version 1 RSVP is an external URL, email, or WhatsApp adapter and stores no guest information. Guest households, internal RSVP processing, couple permissions, seating, hostname routing, payments, and analytics are deliberately absent until their respective versions.
