# Vercel deployment

Import the Git repository as a Next.js project and use pnpm. Add `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; mark the service-role key sensitive and scope it only to environments that need private media.

Deploy a preview first, add its callback origin to Supabase Auth, run smoke tests, then promote to production. Set the production origin in both Vercel and Supabase. Custom domains and wildcard subdomains are intentionally deferred to Version 4; Version 1 supports path-based wedding URLs only.

Rollback by promoting the preceding Vercel deployment. Database migrations are forward-only: restore from a Supabase backup for data rollback rather than editing a previously applied migration.
