-- Register Ivory Estate as a stable curated theme without changing existing settings.
alter table public.wedding_theme_settings
  drop constraint if exists wedding_theme_settings_theme_id_check;

alter table public.wedding_theme_settings
  add constraint wedding_theme_settings_theme_id_check check (theme_id in (
    'timeless-romance',
    'tropical-elegance',
    'modern-minimal',
    'enchanted-garden',
    'amaze-me',
    'ivory-estate'
  ));

comment on constraint wedding_theme_settings_theme_id_check on public.wedding_theme_settings is
  'Stable curated theme identifiers, including Ivory Estate.';
