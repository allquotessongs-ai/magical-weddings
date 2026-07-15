# Troubleshooting

- **Login loops:** verify Site URL and redirect URLs, ensure the user has a `profiles` row with `super_admin`, and clear stale local cookies.
- **Upload returns 403:** confirm the private bucket exists, both Storage SELECT and INSERT policies are applied, and the caller is a super administrator.
- **A published slug returns 404:** confirm status is `published`, or `scheduled` with `publish_at` in the past, and ensure the slug is lowercase and unique.
- **Build cannot load Google fonts:** retry with network access or configure a build environment that can fetch `next/font` assets. Fonts are self-hosted in the finished build.
- **Database tests fail to start:** ensure Docker Desktop is running and no other local Supabase project is using ports 54321–54323.
- **Demo is unavailable without Supabase:** set `DEMO_MODE=true` only in local development and visit `/annetteandclive`.
