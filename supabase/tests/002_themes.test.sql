begin;
select plan(9);

select has_column('public','wedding_theme_settings','settings_version','theme settings are versioned');
select has_column('public','wedding_theme_settings','theme_overrides','per-theme overrides are stored');
select is((select settings_version from public.wedding_theme_settings where wedding_id='00000000-0000-0000-0000-000000000001'),2::smallint,'seed uses settings version 2');
select is((select jsonb_typeof(theme_overrides) from public.wedding_theme_settings where wedding_id='00000000-0000-0000-0000-000000000001'),'object','override map is a JSON object');
select lives_ok($$update public.wedding_theme_settings set theme_id='enchanted-garden' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'Enchanted Garden is a stable theme id');
select is((private.build_public_wedding_payload('00000000-0000-0000-0000-000000000001') #>> '{theme,theme_id}'),'enchanted-garden','working payload retrieves the saved theme');
set local role anon;
select is((public.get_public_wedding_by_slug('annetteandclive') #>> '{theme,theme_id}'),'tropical-elegance','public RPC retains the published snapshot until republish');
reset role;
select throws_ok($$update public.wedding_theme_settings set theme_id='display label' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'23514',null,'display labels are rejected');
select throws_ok($$update public.wedding_theme_settings set theme_overrides='[]'::jsonb where wedding_id='00000000-0000-0000-0000-000000000001'$$,'23514',null,'override arrays are rejected');

select * from finish();
rollback;
