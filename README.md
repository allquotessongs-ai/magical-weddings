# Magical Weddings

Magical Weddings is a multi-tenant wedding website platform for Jamaican celebrations. Version 1 provides a secure owner dashboard, seven-step wedding builder, entitlement-aware themes, private media, responsive previews, publication scheduling, and public wedding pages from one Next.js application.

## Requirements

- Node.js 20.9 or newer (current LTS recommended)
- pnpm 11
- Docker Desktop for the local Supabase stack
- A Supabase project and Vercel account for production

## Local setup

1. Copy `.env.example` to `.env.local` and replace every placeholder.
2. Run `pnpm install`.
3. Start local Supabase with `pnpm db:start`.
4. Apply migrations and demo content with `pnpm db:reset`.
5. Bootstrap the owner with `pnpm bootstrap:admin` after setting a 12+ character `DEMO_ADMIN_PASSWORD`.
6. Run `pnpm dev` and open `http://localhost:3000`.

Public Auth sign-up is intentionally disabled. For a hosted project, invite the owner through Supabase Auth or use the bootstrap script once with the service-role key in a secure local shell. Never expose that key to the browser or Vercel preview logs.

## Environment variables

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical application origin used for metadata and auth callbacks. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project API URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Publishable/anon key; RLS remains the authorization boundary. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Owner bootstrap and short-lived private-media signing only. |
| `DEMO_ADMIN_EMAIL` | Local bootstrap | Fictitious local administrator email. |
| `DEMO_ADMIN_PASSWORD` | Local secret | Local administrator password; never commit it. |
| `DEMO_MODE` | Server configuration | When `true`, exposes the fictitious `/annetteandclive` demo without a database. Leave `false` in production. |

## Quality gate

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm db:test`, `pnpm test:e2e`, and `pnpm build`. Database and browser tests require the local Supabase stack; Playwright also requires its Chromium runtime.

## Deployment

Create a Supabase project, run the migrations in order, create the `wedding-media` private bucket if the migration did not do so, disable public Auth signup, configure the Site URL/redirect URLs, and invite the platform owner. In Vercel, import the repository, add the four production application variables, keep the service-role value server-only, and deploy. Use the Vercel deployment origin for `NEXT_PUBLIC_SITE_URL`, then add it to Supabase Auth redirect URLs.

Scheduled publication does not require a cron job: a `scheduled` wedding becomes effectively public when `publish_at` is reached. Unpublishing or archiving removes public access immediately.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [deployment guide](./docs/deployment/vercel.md), [Supabase guide](./docs/setup/supabase.md), and [troubleshooting](./docs/setup/troubleshooting.md).
