# Implementation Status

## Current version

Version 1 - implemented locally; production environment verification pending

## Completed features

- Greenfield Next.js App Router foundation and centralized branding/configuration
- Supabase schema, tenant constraints, private Storage, RLS policies, and sanitized public RPC
- Owner authentication, dashboard, wedding management, and seven-step builder
- Draft/publication snapshot separation, scheduling, unpublishing, and archiving
- Entitlement-aware content, media management, focal points, maps, RSVP adapters, WhatsApp sharing, calendar, and audio controls
- Registry-driven theme system with six distinct renderers: Timeless Romance, Tropical Elegance, Modern Minimal, Enchanted Garden, AMAZE ME, and Ivory Estate
- Per-theme administrator overrides with curated defaults, stable-ID fallback, contrast validation, and legacy snapshot compatibility
- Unsaved live theme preview using real wedding content at mobile, tablet, and desktop widths
- Structured Bespoke relationship-timeline editor with date, title, details, validation, and downgrade-safe preservation
- Compact gold-framed Timeless Romance ceremony/reception cards and a coordinated formal timeline treatment
- Corrected Timeless Romance section composition: isolated public headings from admin layout styles, removed the page-long centre rule, closed the hero/countdown seam, and centered Welcome, Journey, Dress Code, and Contact content
- Removed the remaining Timeless hero/countdown hairline, made Solid/Outline/Pill buttons visually distinct, added visible Natural/Editorial/Layered/Dreamy image treatments and documented motion levels in the editor
- Realigned the persistent music player as a compact two-button pill; its labelled volume control now opens on demand, becomes vertical on mobile, closes with Escape, and treats zero volume as muted
- Anchored the Timeless hero monogram inside the desktop frame with verified clearance and removed its redundant mobile copy, leaving the navigation monogram intact
- Made Timeless repeatable grids content-aware: schedule cards evenly fill one to three desktop columns, and an odd final menu item spans its row instead of leaving a blank cell; mobile remains single-column
- Connected private background-texture media to the shared renderer as a subtle repeating overlay on text/content surfaces while excluding photographs; clarified its purpose and removed irrelevant focal controls from the texture upload flow
- Added AMAZE ME as a fifth curated theme with a floating midnight navigation, celestial photo portal, couture editorial hero, constellation schedules, alternating timeline, mosaic gallery, arched portraits, cinematic event cards, immersive RSVP/closing scenes, and a dedicated invitation gate
- Corrected the shared Design preview so Desktop, Tablet, and Mobile use their real target widths; AMAZE ME also has preview-container breakpoints that match its public mobile layout
- Added Ivory Estate as a sixth curated theme without changing the Design-editor contract: it uses the existing tokens for an airy photo-led estate hero, champagne botanicals, sage information bands, wedding-guide links, formal stationery sections, a layered mobile invitation card, and its own opening treatment

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
- AMAZE ME uses midnight plum, champagne light, orbital linework, a sculptural photo portal, editorial typography, jewel-like cards, and cinematic closing composition.
- Migration `202607230004_amaze_me_theme.sql` was applied locally without resetting weddings or media; it widens only the stable theme-ID constraint.
- Ivory Estate uses warm ivory, champagne gold, restrained sage, botanical linework, natural photography, invitation typography, compact guide tiles, and a layered mobile card composition.
- Migration `202607230005_ivory_estate_theme.sql` was applied locally without resetting weddings or media; it widens only the same stable theme-ID constraint.
- Real-photo verification used a transient copy of an existing private local hero inside a temporary test wedding. The storage object, wedding record, and private screenshots are excluded from committed application assets.

## Test status - 23 July 2026

- ESLint: passed
- TypeScript: passed
- Unit tests: 14 passed across 4 files
- Database/RLS tests: 20 passed across 2 pgTAP files
- Playwright/accessibility: 6 passed, including public desktop/mobile, all six authenticated theme previews, AMAZE ME and Ivory Estate real-photo desktop/mobile geometry, critical axe checks, distinct button/treatment controls, structured timeline persistence, Signature locking, Timeless event-layout verification, hero/countdown continuity, centered section geometry, and desktop/mobile audio-control geometry
- Production build: passed with Next.js 16.2.10

## Remaining limitations

- Production Supabase credentials, hosted Auth email delivery, hosted Storage, and deployment smoke tests remain environment work.
- Legacy theme scalar columns remain for published-snapshot compatibility and can be removed in a future migration after all active weddings have been republished.
- Versions 2-4 remain deliberately unimplemented pending review of this corrected theme system.

## Deployment status

Not deployed. Apply every migration to the hosted Supabase project before deploying the updated application.
