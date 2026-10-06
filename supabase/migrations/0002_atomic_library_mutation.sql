create or replace function public.save_library_mutation(p_mutation jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_game_id text := p_mutation ->> 'gameId';
  v_provider text := p_mutation ->> 'provider';
  v_previous_status text;
  v_previous_playtime integer;
  v_previous_started_at date;
  v_previous_completed_at date;
  v_previous_notes text;
  v_previous_game boolean := false;
  v_previous_favorite boolean := false;
  v_previous_rating boolean := false;
  v_write_user_game boolean := false;
  v_inserted_user_game boolean := false;
  v_status text;
  v_playtime integer;
  v_started_at date;
  v_completed_at date;
  v_notes text;
  v_event_type text;
  v_amount integer;
  v_inserted integer;
  v_xp_awarded integer := 0;
  v_rating_field text;
  v_rating jsonb;
  v_rating_value numeric;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if jsonb_typeof(p_mutation) is distinct from 'object' then
    raise exception 'Invalid library mutation';
  end if;
  if jsonb_typeof(p_mutation -> 'gameId') is distinct from 'string' or v_game_id !~ '^[0-9]+$' then
    raise exception 'Invalid game id';
  end if;
  if v_provider is distinct from 'rawg' then
    raise exception 'Invalid provider';
  end if;
  if p_mutation ? 'status' and (jsonb_typeof(p_mutation -> 'status') is distinct from 'string' or p_mutation ->> 'status' not in ('want_to_play','backlog','playing','completed','paused','dropped')) then
    raise exception 'Invalid game status';
  end if;
  if p_mutation ? 'favorite' and jsonb_typeof(p_mutation -> 'favorite') is distinct from 'boolean' then
    raise exception 'Invalid favorite value';
  end if;
  if p_mutation ? 'playtimeMinutes' and (
    jsonb_typeof(p_mutation -> 'playtimeMinutes') is distinct from 'number'
    or (p_mutation ->> 'playtimeMinutes') !~ '^[0-9]+$'
    or (p_mutation ->> 'playtimeMinutes')::numeric > 2147483647
  ) then
    raise exception 'Invalid playtime';
  end if;
  if p_mutation ? 'notes' and jsonb_typeof(p_mutation -> 'notes') not in ('string','null') then
    raise exception 'Invalid notes';
  end if;
  if p_mutation ? 'notes' and length(p_mutation ->> 'notes') > 5000 then
    raise exception 'Notes are too long';
  end if;
  if p_mutation ? 'startedAt' and jsonb_typeof(p_mutation -> 'startedAt') not in ('string','null') then
    raise exception 'Invalid start date';
  end if;
  if p_mutation ? 'completedAt' and jsonb_typeof(p_mutation -> 'completedAt') not in ('string','null') then
    raise exception 'Invalid completion date';
  end if;
  if jsonb_typeof(p_mutation -> 'startedAt') = 'string' and p_mutation ->> 'startedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Invalid start date';
  end if;
  if jsonb_typeof(p_mutation -> 'completedAt') = 'string' and p_mutation ->> 'completedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Invalid completion date';
  end if;
  foreach v_rating_field in array array['gameplay','story','graphics','sound','overall'] loop
    if p_mutation ? 'ratings' then
      if jsonb_typeof(p_mutation -> 'ratings') is distinct from 'object' or not ((p_mutation -> 'ratings') ? v_rating_field) then
        raise exception 'Invalid ratings';
      end if;
      v_rating := p_mutation -> 'ratings' -> v_rating_field;
      if jsonb_typeof(v_rating) not in ('number','null') then
        raise exception 'Invalid rating';
      end if;
      if jsonb_typeof(v_rating) = 'number' then
        v_rating_value := (v_rating::text)::numeric;
        if v_rating_value not between 1 and 10 then
          raise exception 'Rating is outside the allowed range';
        end if;
      end if;
    end if;
  end loop;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || ':' || v_provider || ':' || v_game_id, 0));
  select status, playtime_minutes, started_at, completed_at, notes
  into v_previous_status, v_previous_playtime, v_previous_started_at, v_previous_completed_at, v_previous_notes
  from public.user_games
  where user_id = v_user_id and provider = v_provider and game_id = v_game_id
  for update;
  v_previous_game := found;
  select exists(select 1 from public.favorite_games where user_id = v_user_id and provider = v_provider and game_id = v_game_id)
  into v_previous_favorite;
  select exists(
    select 1 from public.game_ratings
    where user_id = v_user_id and provider = v_provider and game_id = v_game_id
      and (gameplay is not null or story is not null or graphics is not null or sound is not null or overall is not null)
  ) into v_previous_rating;

  -- Game-id-only requests are explicit HomeHero adds; favorite/rating-only requests remain separate.
  v_write_user_game := v_previous_game
    or (p_mutation ?| array['status','playtimeMinutes','startedAt','completedAt','notes'])
    or (p_mutation - array['gameId','provider']::text[] = '{}'::jsonb);

  if v_write_user_game then
    v_status := coalesce(p_mutation ->> 'status', v_previous_status, 'want_to_play');
    v_playtime := coalesce((p_mutation ->> 'playtimeMinutes')::integer, v_previous_playtime, 0);
    v_started_at := case when p_mutation ? 'startedAt' then (p_mutation ->> 'startedAt')::date else v_previous_started_at end;
    v_completed_at := case when p_mutation ? 'completedAt' then (p_mutation ->> 'completedAt')::date else v_previous_completed_at end;
    v_notes := case when p_mutation ? 'notes' then p_mutation ->> 'notes' else v_previous_notes end;

    insert into public.user_games(user_id, provider, game_id, status, playtime_minutes, started_at, completed_at, notes, updated_at)
    values (v_user_id, v_provider, v_game_id, v_status, v_playtime, v_started_at, v_completed_at, v_notes, pg_catalog.now())
    on conflict (user_id, provider, game_id) do update set
      status = excluded.status,
      playtime_minutes = excluded.playtime_minutes,
      started_at = excluded.started_at,
      completed_at = excluded.completed_at,
      notes = excluded.notes,
      updated_at = excluded.updated_at;
    v_inserted_user_game := not v_previous_game;
  end if;

  if p_mutation ? 'favorite' then
    if (p_mutation ->> 'favorite')::boolean then
      insert into public.favorite_games(user_id, provider, game_id)
      values (v_user_id, v_provider, v_game_id)
      on conflict (user_id, provider, game_id) do nothing;
    else
      delete from public.favorite_games
      where user_id = v_user_id and provider = v_provider and game_id = v_game_id;
    end if;
  end if;
  if p_mutation ? 'ratings' then
    insert into public.game_ratings(user_id, provider, game_id, gameplay, story, graphics, sound, overall, updated_at)
    values (
      v_user_id, v_provider, v_game_id,
      (p_mutation #>> '{ratings,gameplay}')::numeric,
      (p_mutation #>> '{ratings,story}')::numeric,
      (p_mutation #>> '{ratings,graphics}')::numeric,
      (p_mutation #>> '{ratings,sound}')::numeric,
      (p_mutation #>> '{ratings,overall}')::numeric,
      pg_catalog.now()
    )
    on conflict (user_id, provider, game_id) do update set
      gameplay = excluded.gameplay,
      story = excluded.story,
      graphics = excluded.graphics,
      sound = excluded.sound,
      overall = excluded.overall,
      updated_at = excluded.updated_at;
  end if;

  for v_event_type, v_amount in
    select reward.event_type, reward.xp_amount
    from (values
      ('library_added', 10, v_inserted_user_game),
      ('first_playing', 15, v_previous_status is distinct from 'playing' and p_mutation ->> 'status' = 'playing'),
      ('first_completed', 30, v_previous_status is distinct from 'completed' and p_mutation ->> 'status' = 'completed'),
      ('first_rating', 10, not v_previous_rating and p_mutation ? 'ratings' and (p_mutation #>> '{ratings,gameplay}' is not null or p_mutation #>> '{ratings,story}' is not null or p_mutation #>> '{ratings,graphics}' is not null or p_mutation #>> '{ratings,sound}' is not null or p_mutation #>> '{ratings,overall}' is not null)),
      ('first_favorite', 5, not v_previous_favorite and p_mutation ->> 'favorite' = 'true')
    ) as reward(event_type, xp_amount, eligible)
    where reward.eligible
  loop
    insert into public.xp_events(user_id, provider, game_id, event_type, xp_amount)
    values (v_user_id, v_provider, v_game_id, v_event_type, v_amount)
    on conflict (user_id, provider, game_id, event_type) do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted = 1 then
      update public.profiles
      set xp = xp + v_amount,
          level = 1 + pg_catalog.floor((xp + v_amount) / 100.0)::integer,
          updated_at = pg_catalog.now()
      where id = v_user_id;
      v_xp_awarded := v_xp_awarded + v_amount;
    end if;
  end loop;
  return pg_catalog.jsonb_build_object('xpAwarded', v_xp_awarded);
end;
$$;

revoke all on function public.save_library_mutation(jsonb) from public, anon;
grant execute on function public.save_library_mutation(jsonb) to authenticated;
