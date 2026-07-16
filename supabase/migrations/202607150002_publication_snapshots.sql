alter table public.weddings
  add column if not exists published_snapshot jsonb,
  add column if not exists has_unpublished_changes boolean not null default false;

alter table public.wedding_media
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists active boolean not null default true;

create or replace function private.build_public_wedding_payload(target_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'wedding', to_jsonb(w) - 'contact_email' - 'contact_phone' - 'custom_domain' - 'published_snapshot' - 'has_unpublished_changes',
    'content', to_jsonb(c), 'theme', to_jsonb(t),
    'sections', coalesce((select jsonb_agg(to_jsonb(s) order by s.position) from public.wedding_sections s where s.wedding_id=w.id and s.enabled), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(to_jsonb(e) order by e.starts_at) from public.wedding_events e where e.wedding_id=w.id), '[]'::jsonb),
    'schedule', coalesce((select jsonb_agg(to_jsonb(x) order by x.starts_at) from public.wedding_schedule_items x where x.wedding_id=w.id), '[]'::jsonb),
    'menu', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_menu_items x where x.wedding_id=w.id), '[]'::jsonb),
    'faqs', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_faqs x where x.wedding_id=w.id), '[]'::jsonb),
    'party', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_party_members x where x.wedding_id=w.id), '[]'::jsonb),
    'gallery', coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.wedding_gallery x join public.wedding_media gm on gm.id=x.media_id where x.wedding_id=w.id and gm.active), '[]'::jsonb),
    'timeline', coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_on) from public.wedding_timeline_items x where x.wedding_id=w.id), '[]'::jsonb),
    'media', coalesce((select jsonb_agg(to_jsonb(m) - 'storage_path' order by m.sort_order, m.created_at) from public.wedding_media m where m.wedding_id=w.id and m.active), '[]'::jsonb),
    'entitlements', to_jsonb(pe)
  )
  from public.weddings w
  left join public.wedding_content c on c.wedding_id=w.id
  left join public.wedding_theme_settings t on t.wedding_id=w.id
  join public.package_entitlements pe on pe.package=w.package
  where w.id=target_id
  limit 1;
$$;
revoke all on function private.build_public_wedding_payload(uuid) from public;

create or replace function private.capture_publication_snapshot() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.status in ('published', 'scheduled') then
      update public.weddings set published_snapshot=private.build_public_wedding_payload(new.id), has_unpublished_changes=false where id=new.id;
    end if;
  elsif new.status in ('published', 'scheduled') and
    (new.status is distinct from old.status or new.published_at is distinct from old.published_at or new.publish_at is distinct from old.publish_at) then
    update public.weddings set published_snapshot=private.build_public_wedding_payload(new.id), has_unpublished_changes=false where id=new.id;
  end if;
  return null;
end;
$$;
revoke all on function private.capture_publication_snapshot() from public;

drop trigger if exists capture_publication_snapshot on public.weddings;
create trigger capture_publication_snapshot
after insert or update of status, published_at, publish_at on public.weddings
for each row execute function private.capture_publication_snapshot();

update public.weddings w
set published_snapshot=private.build_public_wedding_payload(w.id), has_unpublished_changes=false
where private.is_effectively_published(w);

create or replace function public.get_public_wedding_by_slug(requested_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select w.published_snapshot
  from public.weddings w
  where w.published_snapshot #>> '{wedding,slug}' = lower(requested_slug)
    and private.is_effectively_published(w)
    and w.published_snapshot is not null
  limit 1;
$$;
revoke all on function public.get_public_wedding_by_slug(text) from public;
grant execute on function public.get_public_wedding_by_slug(text) to anon, authenticated;

create index if not exists weddings_published_snapshot_slug_idx
on public.weddings ((published_snapshot #>> '{wedding,slug}'));
