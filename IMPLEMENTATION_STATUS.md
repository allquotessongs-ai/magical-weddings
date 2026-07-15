# Implementation Status

## Current version

Version 1 — implemented; production environment verification pending

## Completed features

- Greenfield Next.js App Router foundation and centralized branding/configuration
- Supabase schema, tenant keys, constraints, indexes, private Storage bucket, RLS policies, and sanitized public RPC
- Owner email/password login, recovery, logout, route protection, and bootstrap script
- Dashboard statistics, recent weddings, searchable/paginated wedding table
- Seven-step create/edit flow, structured wedding content, theme settings, media upload, section sorting, preview, publishing, scheduling, unpublishing, and archiving
- Essential/Signature/Bespoke entitlement service and gallery limits
- Shared public renderer with three theme directions, responsive navigation, countdown, sections, WhatsApp share, calendar, opening interaction, and accessible audio controls
- Setup, architecture, Supabase, Vercel, domain-forward-compatibility, and troubleshooting documentation

## In progress

- Applying the authored migration and RLS suite to a local or hosted Supabase instance

## Remaining features

- Versions 2–4, as explicitly deferred by the approved Version 1 plan

## Known issues

- Hosted authentication, Storage, and RLS cannot be exercised until Supabase credentials or a running local Docker stack are available.

## Required manual setup

- Copy `.env.example`, start/reset Supabase, bootstrap or invite the owner, and configure Supabase Auth URLs.
- Add production secrets in Vercel; never expose the service-role key.

## Database migration status

- Version 1 migration, private bucket configuration, public RPC, RLS policies, seed, and pgTAP suite authored.
- Application is pending because Docker is not installed in the current environment.

## Test status

- Lint: passed with ESLint 9.39.5
- TypeScript: passed with TypeScript 5.9.3
- Unit tests: 6 passed across 3 files
- Browser/accessibility smoke tests: 2 passed in Chromium at desktop and 390×844 mobile viewports
- Production build: passed with Next.js 16.2.10
- Database/RLS tests: not run because Docker and a configured Supabase instance are unavailable

## Deployment status

- Not deployed. Vercel and Supabase production credentials were not provided and are not required for local implementation.
