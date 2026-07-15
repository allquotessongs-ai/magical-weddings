# Supabase setup

Create a project in a region appropriate for Jamaican users. In Authentication, disable new-user signup, set the production Site URL, and allow only the application callback origins. Configure the invitation and recovery templates to link to `/auth/confirm` with the supplied token hash and type.

Run `supabase db push` from a secure workstation to apply the migrations. Confirm that all public tables show RLS enabled and that `wedding-media` is private with the migration's MIME and 15 MB bucket limit. Do not edit `storage.objects` directly.

Invite the owner through the Auth dashboard, then upsert the matching user ID into `profiles` as `super_admin`, or run `scripts/bootstrap-admin.mjs` once using the server-only service-role key.

Before launch, run the pgTAP suite against the target project's staging clone and manually verify that anonymous requests cannot select any table.
