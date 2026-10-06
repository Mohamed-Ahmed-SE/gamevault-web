begin;

create schema if not exists extensions;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(10);

insert into auth.users (id, aud, role, email, raw_user_meta_data)
values (
  'a5a4ab5e-efbc-4b14-9b46-90935b355841',
  'authenticated',
  'authenticated',
  'library-mutation-regression@example.test',
  '{"username":"library-mutation-regression"}'::jsonb
);
select set_config('request.jwt.claim.sub', 'a5a4ab5e-efbc-4b14-9b46-90935b355841', true);

select public.save_library_mutation('{"gameId":"910001","provider":"rawg","favorite":true}'::jsonb);
select is(
  (select count(*)::integer from public.user_games where user_id = auth.uid() and game_id = '910001'),
  0,
  'favorite-only saves do not invent a library status'
);
select is(
  (select count(*)::integer from public.favorite_games where user_id = auth.uid() and game_id = '910001'),
  1,
  'favorite-only saves persist the favorite'
);
select is(
  (select count(*)::integer from public.xp_events where user_id = auth.uid() and game_id = '910001' and event_type = 'first_favorite'),
  1,
  'favorite-only saves retain favorite XP'
);
select is(
  (select count(*)::integer from public.xp_events where user_id = auth.uid() and game_id = '910001' and event_type = 'library_added'),
  0,
  'favorite-only saves do not award library-added XP'
);

select public.save_library_mutation('{"gameId":"910002","provider":"rawg","ratings":{"gameplay":null,"story":null,"graphics":null,"sound":null,"overall":8}}'::jsonb);
select is(
  (select count(*)::integer from public.user_games where user_id = auth.uid() and game_id = '910002'),
  0,
  'rating-only saves do not invent a library status'
);
select is(
  (select overall::text from public.game_ratings where user_id = auth.uid() and game_id = '910002'),
  '8.0',
  'rating-only saves persist the supplied rating'
);
select is(
  (select count(*)::integer from public.xp_events where user_id = auth.uid() and game_id = '910002' and event_type = 'first_rating'),
  1,
  'rating-only saves retain rating XP'
);
select is(
  (select count(*)::integer from public.xp_events where user_id = auth.uid() and game_id = '910002' and event_type = 'library_added'),
  0,
  'rating-only saves do not award library-added XP'
);

select public.save_library_mutation('{"gameId":"910003","provider":"rawg"}'::jsonb);
select is(
  (select status from public.user_games where user_id = auth.uid() and game_id = '910003'),
  'want_to_play',
  'game-id-only HomeHero add creates a want-to-play library entry'
);
select is(
  (select count(*)::integer from public.xp_events where user_id = auth.uid() and game_id = '910003' and event_type = 'library_added'),
  1,
  'first actual library insert awards library-added XP'
);

select * from finish();
rollback;
