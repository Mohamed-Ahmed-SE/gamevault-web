# GameVault

A personal game discovery and tracking web app. The live RAWG catalog is normalized behind a server-side provider; Supabase stores authentication and private player data. PlayStation 2 and PlayStation 3 are first-class browse destinations.

## Requirements

- Node.js 20.9 or later and npm
- A Supabase project for account and library persistence
- A RAWG API key for live catalog data (the key is server-only)

## Setup

1. Install packages:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RAWG_API_KEY`. The service-role key and RAWG_API_KEY are server-only; never put either in client code or a public environment variable.

3. In Supabase SQL Editor, run [`supabase/migrations/0001_gamevault.sql`](<supabase/migrations/0001_gamevault.sql>). It installs user-owned tables, RLS, account profile creation, and one-time XP award logic.

4. Configure Supabase Auth email/password sign-in and the local redirect URL (`http://localhost:3000/**`). If email confirmation is enabled, users need to confirm their email before their session becomes active.

5. Start the development server:

   ```sh
   npm run dev
   ```

   Visit <http://localhost:3000>.

If Supabase or RAWG credentials are missing, the app surfaces an unavailable state; it does not fabricate catalog entries or claim persistence is active.

## Routes

- `/` home and explicit platform shortcuts
- `/discover` search and filters; `/discover/ps2`, `/discover/ps3`, `/discover/ps4`, `/discover/ps5`, `/discover/pc`, `/discover/switch`, `/discover/xbox-series`
- `/search` shareable catalog search
- `/game/[slug]` details, media, personal progress, five independent ratings, and favorites
- `/library` private library and filters
- `/upcoming` upcoming release dates when returned by the provider
- `/profile/[username]` and `/profile/[username]/stats`
- `/settings`, `/auth/login`, `/auth/register`

## Data and privacy

RAWG API communication happens on the server and its response is converted to internal types under `src/lib/games`. The catalog stays external. Library rows, notes, playtime, personal ratings, favorites, and XP events live in Supabase with row-level policies; other users cannot read private library rows or notes. The five scores are independently selected on a 1–10 scale. Completion uses only the `completed` status. XP events are unique per user, provider, game, and event type to prevent repeat farming.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The automated tests focus on platform normalization, shareable filter parsing, allowed statuses, and rating bounds. Manual end-to-end validation still requires configured Supabase and RAWG credentials.
