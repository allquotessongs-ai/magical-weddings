# Architecture

## Boundaries

The App Router is divided into public wedding pages, authentication, platform administration, media routes, and feature-owned server modules. Route files compose behavior; authorization, validation, database access, entitlements, and mapping live outside the page tree.

Public pages receive a sanitized `WeddingSite` from `get_public_wedding_by_slug`. Anonymous callers have no table access. Authenticated administration uses the caller's Supabase session and RLS; the service role is isolated to owner bootstrap and private-media URL signing.

## Tenant isolation

Every wedding-owned table carries `wedding_id`. RLS permits Version 1 mutations only when the authenticated user has a `profiles.platform_role` of `super_admin`. Composite foreign keys stop media from one wedding being attached to another. The future `wedding_members` relationship exists without granting couple access.

The public RPC checks effective publication status and strips private wedding contacts and storage paths. Draft, future scheduled, unpublished, and archived weddings return no result. Private media is accessed by stable application IDs; the media route checks publication or an active super-admin session before creating a five-minute signed Storage URL.

## Rendering and themes

`WeddingSiteRenderer` is the single public renderer. Section records control order and visibility; the entitlement service removes unavailable package sections. The three themes change layout, typography, palette, spacing, and decoration through validated design tokens and shared section components.

Authenticated routes are dynamic and private/no-store. Public pages revalidate every five minutes; administrative mutations revalidate affected route groups. Music starts only after the opening interaction and retains labelled play, mute, and volume controls.

## Version boundaries

Version 1 RSVP is an external URL, email, or WhatsApp adapter and stores no guest information. Guest households, internal RSVP processing, couple permissions, seating, hostname routing, payments, and analytics are deliberately absent until their respective versions.
