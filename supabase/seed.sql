-- Content-only demo seed. Create the local Auth user with scripts/bootstrap-admin.mjs,
-- then insert its profile through that script. No password or secret is stored here.
insert into public.weddings (id, partner_one_name, partner_two_name, display_names, slug, package, status, wedding_at, timezone, contact_email, contact_phone, published_at)
values ('00000000-0000-0000-0000-000000000001', 'Annette', 'Clive', 'Annette & Clive', 'annetteandclive', 'signature', 'published', '2027-02-20 20:00:00+00', 'America/Jamaica', 'celebrate@example.test', '+1 876 555 0100', now())
on conflict (id) do nothing;

insert into public.wedding_content (wedding_id, introduction, couple_story, engagement_story, hashtag, dress_code, accommodation, registry_information, contact_information, closing_message, rsvp_mode, rsvp_target)
values ('00000000-0000-0000-0000-000000000001', 'With joyful hearts, we invite you to share in the beginning of our forever.', 'A chance meeting in Kingston became long conversations, Sunday drives, and a love that felt like home.', 'At sunset above the Blue Mountains, Clive asked one beautiful question.', '#AnnetteAndClive', 'Island formal', 'A preferred room block is available near the reception.', 'Your presence is our greatest gift.', 'Questions? Contact our wedding team.', 'We cannot wait to celebrate beneath the Jamaican sky with you.', 'external_url', 'https://example.com/rsvp') on conflict (wedding_id) do nothing;

insert into public.wedding_theme_settings (wedding_id, theme_id, primary_color, secondary_color, accent_color, heading_font, body_font, background_style, button_style, border_radius, animation_intensity, decorative_elements)
values ('00000000-0000-0000-0000-000000000001', 'tropical-elegance', '#174c3c', '#fff8ec', '#d66b4d', 'DM Serif Display', 'Manrope', 'soft', 'pill', 'round', 'subtle', 'botanical') on conflict (wedding_id) do nothing;

insert into public.wedding_sections (wedding_id, section_key, enabled, position)
select '00000000-0000-0000-0000-000000000001', key, key <> 'timeline', ordinality - 1
from unnest(array['opening','hero','countdown','welcome','story','timeline','ceremony','reception','schedule','wedding_party','dress_code','menu','gallery','accommodation','transportation','registry','faq','rsvp','contact','closing']) with ordinality as x(key, ordinality)
on conflict (wedding_id, section_key) do nothing;

insert into public.wedding_events (wedding_id,event_type,venue_name,address,parish,starts_at,maps_url)
values
('00000000-0000-0000-0000-000000000001','ceremony','Hope Botanical Gardens','Old Hope Road','Saint Andrew','2027-02-20 20:00:00+00','https://maps.google.com'),
('00000000-0000-0000-0000-000000000001','reception','The Terrace','Kingston','Kingston','2027-02-20 22:00:00+00','https://maps.google.com')
on conflict (wedding_id,event_type) do nothing;
