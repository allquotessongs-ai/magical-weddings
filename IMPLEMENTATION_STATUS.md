# Implementation Status

## Current version

Version 1 — implemented locally; production environment verification pending

## Completed features

- Greenfield Next.js App Router foundation and centralized branding/configuration
- Supabase schema, tenant constraints, private Storage, RLS policies, and sanitized public RPC
- Owner authentication, dashboard, wedding management, and seven-step builder
- Draft/publication snapshot separation, scheduling, unpublishing, and archiving
- Entitlement-aware content, media management, focal points, maps, RSVP adapters, WhatsApp sharing, calendar, and audio controls
- Registry-driven theme system with four distinct renderers: Timeless Romance, Tropical Elegance, Modern Minimal, and Enchanted Garden
- Per-theme administrator overrides with curated defaults, stable-ID fallback, contrast validation, and legacy snapshot compatibility
- Unsaved live theme preview using real wedding content at mobile, tablet, and desktop widths
- Structured Bespoke relationship-timeline editor with date, title, details, validation, and downgrade-safe preservation
- Compact gold-framed Timeless Romance ceremony/reception cards and a coordinated formal timeline treatment
- Corrected Timeless Romance section composition: isolated public headings from admin layout styles, removed the page-long centre rule, closed the hero/countdown seam, and centered Welcome, Journey, Dress Code, and Contact content

## Theme-system correction evidence

- Root cause: the saved theme ID reached the public payload, but every ID rendered the same monolithic page and only applied minor CSS overrides.
- Migration `202607160003_theme_system.sql` was applied to the local database without resetting existing weddings or media.
- Existing active theme values were preserved under the new versioned, per-theme override map.
- Public pages continue to use the last published snapshot; saving a theme only marks the working wedding as changed.
- Visual verification used the current Annette & Clive record locally. Private uploaded media and screenshots were not committed.
- Timeless Romance uses centered invitation composition, formal frames, symmetrical schedules, and editorial imagery.
- Tropical Elegance uses a split destination hero, botanical decoration, organic cards, and layered galleries.
- Modern Minimal uses asymmetric grids, sharp cropping, oversized modern typography, and numbered content layouts.
- Enchanted Garden uses arched imagery, floral layering, vine-like timelines, and storybook curves.

## Test status — 16 July 2026

- ESLint: passed
- TypeScript: passed
- Unit tests: 14 passed across 4 files
- Database/RLS tests: 16 passed across 2 pgTAP files
- Playwright/accessibility: 5 passed, including public desktop/mobile, all four authenticated theme previews, structured timeline persistence, Signature locking, Timeless event-layout verification, hero/countdown continuity, and centered section geometry
- Production build: passed with Next.js 16.2.10

## Remaining limitations

- Production Supabase credentials, hosted Auth email delivery, hosted Storage, and deployment smoke tests remain environment work.
- Legacy theme scalar columns remain for published-snapshot compatibility and can be removed in a future migration after all active weddings have been republished.
- Versions 2–4 remain deliberately unimplemented pending review of this corrected theme system.

## Deployment status

Not deployed. Apply every migration to the hosted Supabase project before deploying the updated application.
