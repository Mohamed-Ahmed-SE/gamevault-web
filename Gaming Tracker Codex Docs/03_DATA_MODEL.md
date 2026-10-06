# Supabase Data Model

Use UUIDs for user-owned rows.

Third-party game IDs should be stored as strings where practical to allow future providers.

## profiles

```sql
id uuid primary key references auth.users(id) on delete cascade
username text unique not null
display_name text
avatar_url text
bio text
xp integer not null default 0
level integer not null default 1
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

## user_games

One row per user/game/provider.

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
provider text not null default 'rawg'
game_id text not null
status text not null
playtime_minutes integer not null default 0
started_at date
completed_at date
notes text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()

unique(user_id, provider, game_id)
```

Status check:
```sql
status in (
  'want_to_play',
  'backlog',
  'playing',
  'completed',
  'paused',
  'dropped'
)
```

## game_ratings

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
provider text not null default 'rawg'
game_id text not null

gameplay numeric(3,1)
story numeric(3,1)
graphics numeric(3,1)
sound numeric(3,1)
overall numeric(3,1)

created_at timestamptz not null default now()
updated_at timestamptz not null default now()

unique(user_id, provider, game_id)
```

Each score must be null or between 1 and 10.

## favorite_games

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
provider text not null default 'rawg'
game_id text not null
created_at timestamptz not null default now()

unique(user_id, provider, game_id)
```

## user_achievements

Optional MVP table if manual achievement tracking is implemented.

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
provider text not null default 'rawg'
game_id text not null
achievement_id text not null
earned boolean not null default false
earned_at timestamptz

unique(user_id, provider, game_id, achievement_id)
```

## xp_events

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id) on delete cascade
provider text
game_id text
event_type text not null
xp_amount integer not null
created_at timestamptz not null default now()
```

Create uniqueness rules for one-time events.

Example event types:
- library_added
- first_playing
- first_completed
- first_rating
- first_favorite

## recent_activity

This can be:
- derived from existing tables, or
- stored as an append-only activity log

Prefer derivation for MVP unless product requirements demand richer history.

## RLS

Enable Row Level Security.

Rules:
- users can read public profile fields
- users can insert/update/delete only their own user data
- private notes must never be readable by other users unless a later privacy feature explicitly allows it
