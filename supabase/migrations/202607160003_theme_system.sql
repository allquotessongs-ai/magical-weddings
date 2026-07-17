-- Stable theme identifiers and versioned, per-theme customizations.
alter table public.wedding_theme_settings
  add column if not exists settings_version smallint,
  add column if not exists theme_overrides jsonb;

update public.wedding_theme_settings
set theme_id = case lower(regexp_replace(trim(theme_id), '[^a-z0-9]+', '-', 'g'))
  when 'timeless-romance' then 'timeless-romance'
  when 'tropical-elegance' then 'tropical-elegance'
  when 'modern-minimal' then 'modern-minimal'
  when 'enchanted-garden' then 'enchanted-garden'
  else 'timeless-romance'
end;

-- Preserve the active legacy settings as overrides for that theme. Wedding content
-- remains untouched, and customizations for other themes can be added independently.
update public.wedding_theme_settings
set theme_overrides = jsonb_build_object(theme_id, jsonb_build_object(
      'primary', primary_color,
      'secondary', secondary_color,
      'accent', accent_color,
      'background', secondary_color,
      'text', primary_color,
      'headingFont', heading_font,
      'bodyFont', body_font,
      'decorativeFont', 'Cormorant Garamond',
      'radius', border_radius,
      'shadow', 'soft',
      'sectionSpacing', 'balanced',
      'motion', animation_intensity,
      'imageTreatment', 'natural',
      'backgroundStyle', background_style,
      'buttonStyle', button_style,
      'decoration', decorative_elements
    )),
    settings_version = 2
where theme_overrides is null or settings_version is null;

alter table public.wedding_theme_settings
  alter column settings_version set default 2,
  alter column settings_version set not null,
  alter column theme_overrides set default '{}'::jsonb,
  alter column theme_overrides set not null;

alter table public.wedding_theme_settings
  drop constraint if exists wedding_theme_settings_theme_id_check,
  drop constraint if exists wedding_theme_settings_theme_overrides_check,
  drop constraint if exists wedding_theme_settings_settings_version_check;

alter table public.wedding_theme_settings
  add constraint wedding_theme_settings_theme_id_check check (theme_id in (
    'timeless-romance', 'tropical-elegance', 'modern-minimal', 'enchanted-garden'
  )),
  add constraint wedding_theme_settings_theme_overrides_check check (jsonb_typeof(theme_overrides) = 'object'),
  add constraint wedding_theme_settings_settings_version_check check (settings_version = 2);

comment on column public.wedding_theme_settings.theme_overrides is
  'Version 2 presentation settings keyed by stable theme id. Legacy scalar columns remain for old publication snapshots.';
