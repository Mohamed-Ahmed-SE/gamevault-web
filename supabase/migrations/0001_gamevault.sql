create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.user_games (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'rawg', game_id text not null,
  status text not null check (status in ('want_to_play','backlog','playing','completed','paused','dropped')),
  playtime_minutes integer not null default 0 check (playtime_minutes >= 0), started_at date, completed_at date,
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,provider,game_id)
);
create table if not exists public.game_ratings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'rawg', game_id text not null,
  gameplay numeric(3,1) check (gameplay between 1 and 10), story numeric(3,1) check (story between 1 and 10),
  graphics numeric(3,1) check (graphics between 1 and 10), sound numeric(3,1) check (sound between 1 and 10), overall numeric(3,1) check (overall between 1 and 10),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,provider,game_id)
);
create table if not exists public.favorite_games (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'rawg', game_id text not null, created_at timestamptz not null default now(), unique(user_id,provider,game_id)
);
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'rawg', game_id text not null, event_type text not null,
  xp_amount integer not null check (xp_amount > 0), created_at timestamptz not null default now(), unique(user_id,provider,game_id,event_type)
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id,username,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'username',''),split_part(new.email,'@',1)||'-'||left(new.id::text,6)),coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.award_game_xp(p_user_id uuid,p_game_id text,p_event_type text,p_amount integer) returns void language plpgsql security definer set search_path = '' as $$
declare inserted int;
begin if coalesce(auth.jwt()->>'role','') <> 'service_role' or p_user_id is null or p_game_id !~ '^[0-9]+$' or p_event_type not in ('library_added','first_playing','first_completed','first_rating','first_favorite') or p_amount not between 1 and 30 then raise exception 'Invalid XP event'; end if;
if (p_event_type='library_added' and p_amount<>10) or (p_event_type='first_playing' and p_amount<>15) or (p_event_type='first_completed' and p_amount<>30) or (p_event_type='first_rating' and p_amount<>10) or (p_event_type='first_favorite' and p_amount<>5) then raise exception 'Invalid XP amount'; end if;
insert into public.xp_events(user_id,provider,game_id,event_type,xp_amount) values(p_user_id,'rawg',p_game_id,p_event_type,p_amount) on conflict do nothing; get diagnostics inserted = row_count;
if inserted=1 then update public.profiles set xp=xp+p_amount,level=1+floor((xp+p_amount)/100.0)::int,updated_at=now() where id=p_user_id; end if; end; $$;
alter table public.profiles enable row level security;alter table public.user_games enable row level security;alter table public.game_ratings enable row level security;alter table public.favorite_games enable row level security;alter table public.xp_events enable row level security;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users update own public profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
create policy "Own games only" on public.user_games for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Own ratings only" on public.game_ratings for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Own favorites only" on public.favorite_games for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Own XP readable" on public.xp_events for select using (auth.uid()=user_id);
revoke update on public.profiles from authenticated;grant update(display_name,avatar_url,bio,updated_at) on public.profiles to authenticated;
revoke all on function public.award_game_xp(uuid,text,text,integer) from public, anon, authenticated;grant execute on function public.award_game_xp(uuid,text,text,integer) to service_role;
