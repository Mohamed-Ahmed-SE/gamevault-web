# Implementation Plan for Codex

Work in milestones. Keep the project runnable after each milestone.

## Milestone 1 — Foundation

- create Next.js project structure
- configure TypeScript
- configure Tailwind
- create design tokens
- configure Supabase
- create env validation
- create auth
- create layout/navigation
- create base loading/error UI

Deliverable:
app boots, auth works, protected route works.

## Milestone 2 — Game provider layer

- create normalized domain types
- create provider interface
- implement RAWG provider
- implement platform map
- verify PS2 mapping
- verify PS3 mapping
- implement API routes/server services
- create server caching

Deliverable:
search and platform queries return normalized game data.

## Milestone 3 — Homepage

- cinematic hero
- game rails
- trending
- new releases
- upcoming
- PS2 Classics
- PS3 Classics
- responsive behavior
- skeleton states

Deliverable:
home experience works with live provider data.

## Milestone 4 — Discover and search

- discover page
- platform cards
- filters
- sorting
- URL state
- search debounce
- pagination/infinite loading

Deliverable:
user can browse and search PS2, PS3, and modern games.

## Milestone 5 — Game details

- game hero
- metadata
- description
- trailers
- media gallery
- lightbox
- achievements
- requirements
- suggested games

Deliverable:
rich public game details page works even before login.

## Milestone 6 — Personal library

- user_games migration
- RLS
- add/remove game
- status update
- notes
- playtime
- dates
- library page
- status filters

Deliverable:
personal library fully functional.

## Milestone 7 — Ratings and favorites

- game_ratings migration
- favorite_games migration
- RLS
- detailed five-part rating UI
- save/edit/reset rating
- favorite toggle
- favorites library filter

Deliverable:
rating and favorite flows are reliable.

## Milestone 8 — Profile and XP

- profile page
- XP rules
- xp_events
- one-time XP protection
- favorites section
- highest-rated section
- stats
- recent activity

Deliverable:
profile reflects real user data.

## Milestone 9 — Polish

- responsive audit
- accessibility audit
- reduced motion
- image optimization
- performance
- loading
- errors
- empty states
- metadata/SEO
- Open Graph where appropriate

## Milestone 10 — Verification

Run:
- lint
- typecheck
- unit tests
- integration tests
- production build

Manually test:
1. register
2. browse PS2
3. browse PS3
4. open game
5. play trailer
6. open gallery
7. add to library
8. mark Playing
9. rate all five rating fields
10. favorite
11. mark Completed
12. verify library
13. verify profile
14. logout/login and verify persistence

Do not call the project finished while these flows are broken.
