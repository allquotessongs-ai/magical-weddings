begin;
select plan(13);

select has_column('public','wedding_theme_settings','settings_version','theme settings are versioned');
select has_column('public','wedding_theme_settings','theme_overrides','per-theme overrides are stored');
select is((select settings_version from public.wedding_theme_settings where wedding_id='00000000-0000-0000-0000-000000000001'),2::smallint,'seed uses settings version 2');
select is((select jsonb_typeof(theme_overrides) from public.wedding_theme_settings where wedding_id='00000000-0000-0000-0000-000000000001'),'object','override map is a JSON object');
set local role anon;
create temp table captured_public_theme on commit drop as
  select public.get_public_wedding_by_slug('annetteandclive') #>> '{theme,theme_id}' as theme_id;
reset role;
select lives_ok($$update public.wedding_theme_settings set theme_id='enchanted-garden' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'Enchanted Garden is a stable theme id');
select is((private.build_public_wedding_payload('00000000-0000-0000-0000-000000000001') #>> '{theme,theme_id}'),'enchanted-garden','working payload retrieves the saved theme');
select lives_ok($$update public.wedding_theme_settings set theme_id='amaze-me' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'AMAZE ME is a stable theme id');
select is((private.build_public_wedding_payload('00000000-0000-0000-0000-000000000001') #>> '{theme,theme_id}'),'amaze-me','working payload retrieves AMAZE ME');
select lives_ok($$update public.wedding_theme_settings set theme_id='ivory-estate' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'Ivory Estate is a stable theme id');
select is((private.build_public_wedding_payload('00000000-0000-0000-0000-000000000001') #>> '{theme,theme_id}'),'ivory-estate','working payload retrieves Ivory Estate');
set local role anon;
select is((public.get_public_wedding_by_slug('annetteandclive') #>> '{theme,theme_id}'),(select theme_id from captured_public_theme),'public RPC retains the published snapshot until republish');
reset role;
select throws_ok($$update public.wedding_theme_settings set theme_id='display label' where wedding_id='00000000-0000-0000-0000-000000000001'$$,'23514',null,'display labels are rejected');
select throws_ok($$update public.wedding_theme_settings set theme_overrides='[]'::jsonb where wedding_id='00000000-0000-0000-0000-000000000001'$$,'23514',null,'override arrays are rejected');

select * from finish();
rollback;
