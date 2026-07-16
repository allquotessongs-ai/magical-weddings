create extension if not exists citext;
create extension if not exists pgcrypto;
create schema if not exists private;

create type public.platform_role as enum ('super_admin');
create type public.wedding_member_role as enum ('couple_admin');
create type public.wedding_package as enum ('essential', 'signature', 'bespoke');
create type public.wedding_status as enum ('draft', 'scheduled', 'published', 'archived');
create type public.event_type as enum ('ceremony', 'reception');
create type public.media_purpose as enum ('hero', 'portrait', 'gallery', 'wedding_party', 'texture', 'music');
create type public.rsvp_mode as enum ('external_url', 'email', 'whatsapp');

create function private.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  platform_role public.platform_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.package_entitlements (
  package public.wedding_package primary key,
  gallery_limit integer not null check (gallery_limit > 0),
  theme_customization boolean not null default false,
  background_music boolean not null default false,
  wedding_party boolean not null default false,
  accommodation boolean not null default false,
  transportation boolean not null default false,
  faq boolean not null default false,
  add_to_calendar boolean not null default false,
  personalized_opening boolean not null default false,
  timeline boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.package_entitlements values
  ('essential', 24, false, false, false, false, false, false, false, false, false, now()),
  ('signature', 75, true, true, true, true, true, true, true, true, false, now()),
  ('bespoke', 200, true, true, true, true, true, true, true, true, true, now());

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  partner_one_name text not null check (char_length(partner_one_name) between 1 and 80),
  partner_two_name text not null check (char_length(partner_two_name) between 1 and 80),
  display_names text not null check (char_length(display_names) between 3 and 120),
  slug citext not null unique check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  package public.wedding_package not null default 'essential',
  status public.wedding_status not null default 'draft',
  wedding_at timestamptz not null,
  timezone text not null default 'America/Jamaica',
  contact_email text,
  contact_phone text,
  custom_domain citext unique,
  publish_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint scheduled_requires_time check (status <> 'scheduled' or publish_at is not null)
);

create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.wedding_member_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, user_id)
);

create table public.wedding_content (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null unique references public.weddings(id) on delete cascade,
  introduction text, couple_story text, engagement_story text, hashtag text, dress_code text,
  accommodation text, registry_information text, contact_information text, closing_message text,
  rsvp_mode public.rsvp_mode, rsvp_target text,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table public.wedding_sections (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  section_key text not null, enabled boolean not null default true, position integer not null check (position >= 0),
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, section_key), unique (wedding_id, position)
);

create table public.wedding_events (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  event_type public.event_type not null, venue_name text not null, address text not null, parish text not null,
  starts_at timestamptz not null, maps_url text, transportation_notes text, parking_notes text,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, event_type)
);

create table public.wedding_theme_settings (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null unique references public.weddings(id) on delete cascade,
  theme_id text not null default 'timeless-romance', primary_color text not null default '#5f2438',
  secondary_color text not null default '#fffaf3', accent_color text not null default '#bd8c54',
  heading_font text not null default 'Cormorant Garamond', body_font text not null default 'Manrope',
  background_style text not null default 'paper', button_style text not null default 'solid',
  border_radius text not null default 'soft', animation_intensity text not null default 'subtle',
  decorative_elements text not null default 'fine-lines',
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table public.wedding_media (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  purpose public.media_purpose not null, storage_path text not null unique, mime_type text not null, byte_size bigint not null check (byte_size > 0),
  width integer, height integer, duration_seconds numeric, alt_text text, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique(id, wedding_id)
);

create table public.wedding_gallery (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  media_id uuid not null, caption text, alt_text text not null, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  foreign key (media_id, wedding_id) references public.wedding_media(id, wedding_id) on delete cascade,
  unique (wedding_id, media_id)
);

create table public.wedding_party_members (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null, role text not null, biography text, media_id uuid, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  foreign key (media_id, wedding_id) references public.wedding_media(id, wedding_id) on delete set null (media_id)
);

create table public.wedding_faqs (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  question text not null, answer text not null, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table public.wedding_schedule_items (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  starts_at timestamptz not null, title text not null, description text, location text, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table public.wedding_menu_items (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  category text not null, name text not null, description text, dietary_labels text[] not null default '{}', sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table public.wedding_timeline_items (
  id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings(id) on delete cascade,
  occurred_on date not null, title text not null, description text, media_id uuid, sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  foreign key (media_id, wedding_id) references public.wedding_media(id, wedding_id) on delete set null (media_id)
);

create index weddings_status_idx on public.weddings(status);
create index weddings_wedding_at_idx on public.weddings(wedding_at);
create index weddings_updated_at_idx on public.weddings(updated_at desc);
create index wedding_members_user_idx on public.wedding_members(user_id, wedding_id);
create index wedding_sections_tenant_idx on public.wedding_sections(wedding_id, position);
create index wedding_events_tenant_idx on public.wedding_events(wedding_id, starts_at);
create index wedding_media_tenant_idx on public.wedding_media(wedding_id, purpose, sort_order);
create index wedding_gallery_tenant_idx on public.wedding_gallery(wedding_id, sort_order);
create index wedding_party_tenant_idx on public.wedding_party_members(wedding_id, sort_order);
create index wedding_faqs_tenant_idx on public.wedding_faqs(wedding_id, sort_order);
create index wedding_schedule_tenant_idx on public.wedding_schedule_items(wedding_id, starts_at);
create index wedding_menu_tenant_idx on public.wedding_menu_items(wedding_id, sort_order);
create index wedding_timeline_tenant_idx on public.wedding_timeline_items(wedding_id, occurred_on);

do $$ declare t text; begin
  foreach t in array array['profiles','wedding_members','wedding_content','wedding_sections','wedding_events','wedding_theme_settings','wedding_media','wedding_gallery','wedding_party_members','wedding_faqs','wedding_schedule_items','wedding_menu_items','wedding_timeline_items']
  loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', t, t); end loop;
end $$;
create trigger set_weddings_updated_at before update on public.weddings for each row execute function private.set_updated_at();
create trigger set_entitlements_updated_at before update on public.package_entitlements for each row execute function private.set_updated_at();

create function private.is_super_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.platform_role = 'super_admin');
$$;
revoke all on function private.is_super_admin() from public;
grant execute on function private.is_super_admin() to authenticated;

create function private.is_effectively_published(w public.weddings) returns boolean language sql stable set search_path = '' as $$
  select w.status = 'published' or (w.status = 'scheduled' and w.publish_at <= now());
$$;

alter table public.profiles enable row level security;
alter table public.package_entitlements enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_content enable row level security;
alter table public.wedding_sections enable row level security;
alter table public.wedding_events enable row level security;
alter table public.wedding_theme_settings enable row level security;
alter table public.wedding_media enable row level security;
alter table public.wedding_gallery enable row level security;
alter table public.wedding_party_members enable row level security;
alter table public.wedding_faqs enable row level security;
alter table public.wedding_schedule_items enable row level security;
alter table public.wedding_menu_items enable row level security;
alter table public.wedding_timeline_items enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()) or (select private.is_super_admin()));
create policy entitlements_admin_select on public.package_entitlements for select to authenticated using ((select private.is_super_admin()));

do $$ declare t text; begin
  foreach t in array array['weddings','wedding_members','wedding_content','wedding_sections','wedding_events','wedding_theme_settings','wedding_media','wedding_gallery','wedding_party_members','wedding_faqs','wedding_schedule_items','wedding_menu_items','wedding_timeline_items']
  loop
    execute format('create policy %I_admin_select on public.%I for select to authenticated using ((select private.is_super_admin()))', t, t);
    execute format('create policy %I_admin_insert on public.%I for insert to authenticated with check ((select private.is_super_admin()))', t, t);
    execute format('create policy %I_admin_update on public.%I for update to authenticated using ((select private.is_super_admin())) with check ((select private.is_super_admin()))', t, t);
    execute format('create policy %I_admin_delete on public.%I for delete to authenticated using ((select private.is_super_admin()))', t, t);
  end loop;
end $$;

create function public.get_public_wedding_by_slug(requested_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'wedding', to_jsonb(w) - 'contact_email' - 'contact_phone' - 'custom_domain',
    'content', to_jsonb(c), 'theme', to_jsonb(t),
    'sections', coalesce((select jsonb_agg(to_jsonb(s) order by s.position) from public.wedding_sections s where s.wedding_id=w.id and s.enabled), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(to_jsonb(e) order by e.starts_at) from public.wedding_events e where e.wedding_id=w.id), '[]'::jsonb),
    'schedule', coalesce((select jsonb_agg(to_jsonb(x) order by x.starts_at) from public.wedding_schedule_items x where x.wedding_id=w.id), '[]'::jsonb),
    'menu', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_menu_items x where x.wedding_id=w.id), '[]'::jsonb),
    'faqs', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_faqs x where x.wedding_id=w.id), '[]'::jsonb),
    'party', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_party_members x where x.wedding_id=w.id), '[]'::jsonb),
    'gallery', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_gallery x where x.wedding_id=w.id), '[]'::jsonb),
    'timeline', coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_on) from public.wedding_timeline_items x where x.wedding_id=w.id), '[]'::jsonb),
    'media', coalesce((select jsonb_agg(to_jsonb(m) - 'storage_path' order by m.sort_order) from public.wedding_media m where m.wedding_id=w.id), '[]'::jsonb),
    'entitlements', to_jsonb(pe)
  )
  from public.weddings w
  left join public.wedding_content c on c.wedding_id=w.id
  left join public.wedding_theme_settings t on t.wedding_id=w.id
  join public.package_entitlements pe on pe.package=w.package
  where w.slug=requested_slug and private.is_effectively_published(w)
  limit 1;
$$;
revoke all on function public.get_public_wedding_by_slug(text) from public;
grant execute on function public.get_public_wedding_by_slug(text) to anon, authenticated;

create function public.create_wedding_with_defaults(
  p_partner_one text, p_partner_two text, p_display_names text, p_slug text,
  p_package public.wedding_package, p_wedding_at timestamptz, p_timezone text,
  p_contact_email text, p_contact_phone text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; section_name text; section_position integer := 0;
begin
  if not private.is_super_admin() then raise exception 'not authorized'; end if;
  insert into public.weddings(partner_one_name,partner_two_name,display_names,slug,package,status,wedding_at,timezone,contact_email,contact_phone)
  values(p_partner_one,p_partner_two,p_display_names,p_slug,p_package,'draft',p_wedding_at,p_timezone,nullif(p_contact_email,''),nullif(p_contact_phone,'')) returning id into new_id;
  insert into public.wedding_content(wedding_id) values(new_id);
  insert into public.wedding_theme_settings(wedding_id) values(new_id);
  foreach section_name in array array['opening','hero','countdown','welcome','story','timeline','ceremony','reception','schedule','wedding_party','dress_code','menu','gallery','accommodation','transportation','registry','faq','rsvp','contact','closing'] loop
    insert into public.wedding_sections(wedding_id,section_key,enabled,position)
    values(new_id,section_name,section_name <> 'timeline',section_position);
    section_position := section_position + 1;
  end loop;
  return new_id;
end; $$;
revoke all on function public.create_wedding_with_defaults(text,text,text,text,public.wedding_package,timestamptz,text,text,text) from public;
grant execute on function public.create_wedding_with_defaults(text,text,text,text,public.wedding_package,timestamptz,text,text,text) to authenticated;

-- PostgREST roles need table privileges before RLS policies can be evaluated.
-- Anonymous access remains revoked below; authenticated access is still limited
-- by the super-admin policies defined above.
grant usage on schema public to authenticated, service_role;
grant usage on schema private to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select, update on all sequences in schema public to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-media', 'wedding-media', false, 15728640, array['image/jpeg','image/png','image/webp','image/avif','audio/mpeg','audio/mp4','audio/ogg','audio/x-m4a'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy wedding_media_objects_admin_select on storage.objects for select to authenticated
using (bucket_id='wedding-media' and (select private.is_super_admin()));
create policy wedding_media_objects_admin_insert on storage.objects for insert to authenticated
with check (bucket_id='wedding-media' and (select private.is_super_admin()));
create policy wedding_media_objects_admin_update on storage.objects for update to authenticated
using (bucket_id='wedding-media' and (select private.is_super_admin())) with check (bucket_id='wedding-media' and (select private.is_super_admin()));
create policy wedding_media_objects_admin_delete on storage.objects for delete to authenticated
using (bucket_id='wedding-media' and (select private.is_super_admin()));

revoke all on all tables in schema public from anon;
