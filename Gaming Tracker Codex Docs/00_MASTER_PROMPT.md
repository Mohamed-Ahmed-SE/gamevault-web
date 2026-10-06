# Master Codex Prompt

You are building a complete MVP web application for a premium personal gaming library and discovery product.

Your job is not to create a simple RAWG frontend. Build a polished product where users can discover games, save them, track their status, rate every important aspect of a game, mark favorite games, view trailers and galleries, browse classic platforms such as PS2 and PS3, and maintain a gaming profile.

## Product direction

The product should feel like:

- a cinematic game launcher
- a premium streaming home screen
- a personal gaming journal
- a game discovery database

The visual inspiration is premium console and TV interfaces, but do not copy Apple TV, PlayStation, Xbox, Steam, Letterboxd, or any other interface one-to-one.

Create an original design system.

## Required stack

Use:

- Next.js latest stable App Router
- TypeScript
- Tailwind CSS
- Supabase for auth + user data
- TanStack Query where client caching is useful
- Zustand only where local global state is justified
- Motion/Framer Motion for interface animation
- GSAP only for hero-level cinematic transitions if necessary
- Lenis only if it does not harm usability/accessibility
- Zod for validation
- React Hook Form for forms
- Server-side API routes/actions for third-party game API communication

Do not expose third-party API secrets in the browser.

## Game data provider

Use RAWG as the primary MVP catalog provider unless the environment already provides another compatible provider.

Abstract the provider behind a service layer so the app can later switch to or combine with IGDB.

The app must support:
- modern games
- PlayStation 5
- PlayStation 4
- PlayStation 3
- PlayStation 2
- Xbox platforms
- PC
- Nintendo platforms
- other platforms returned by the provider

PS2 and PS3 must not be hidden as legacy edge cases. They are first-class browse categories in the homepage and Discover experience.

## Required user statuses

A user's game status can be only one of:

- want_to_play
- backlog
- playing
- completed
- paused
- dropped

Do not create a separate "100% completed" state.

Completion is simply `completed`.

## Detailed user rating

Every user can rate a game on five dimensions:

- gameplay
- story
- graphics
- sound
- overall

Use a 1–10 scale for each field.

Allow the user to rate only the fields they want, but `overall` should be strongly encouraged.

Display the user’s rating panel clearly on the game details page.

Do not derive or overwrite the user's `overall` score automatically unless an explicit optional "calculate suggested overall" helper is added. The user must remain able to choose the final overall rating manually.

## Favorite games

Users must be able to mark/unmark games as favorites.

Favorites should appear:
- on the profile
- in the library/filtering experience
- optionally on game cards

## Game details requirements

Every game details page must include:

### Cinematic header
- background artwork
- game title/logo treatment
- platform chips
- release date
- genres
- developer/publisher if available
- provider/community rating if available
- user status control
- favorite toggle
- add/remove library action

### User progress area
- current status
- personal playtime if manually entered
- date started
- date completed when status is completed
- personal notes
- user rating breakdown

### Rating panel
- Gameplay: 1–10
- Story: 1–10
- Graphics: 1–10
- Sound: 1–10
- Overall: 1–10

### Media
A dedicated media section is required.

It must contain:
- game trailers
- embedded video player or external-player fallback
- screenshot gallery
- artwork gallery if available
- lightbox/fullscreen media viewer
- keyboard navigation on desktop
- touch-friendly horizontal browsing on mobile

If no trailer exists, do not render a broken section.

### Game information
- summary/description
- storyline if available
- platforms
- genres
- tags/themes if available
- release dates
- developer
- publisher
- age rating if available
- official website/store links if available
- PC system requirements when available

### Achievements / trophies metadata
- achievement name
- description
- artwork/icon
- provider rarity/completion percentage if available

For MVP, user trophy ownership can be manually tracked if included. Do not claim PlayStation/Xbox account synchronization unless it is actually implemented.

### Similar games
Render related/suggested games from the provider.

## Homepage requirements

The homepage visual direction should use a large cinematic hero inspired by premium streaming interfaces.

Required homepage structure:

1. Featured hero
2. Continue Playing
3. Trending Now
4. Recently Released
5. Upcoming Games
6. Your Backlog
7. Favorite Games
8. Top Rated
9. PlayStation 2 Classics
10. PlayStation 3 Classics
11. PC Games
12. Nintendo Games
13. Xbox Games

Hide personalized sections gracefully when the user is logged out or has no data.

The hero needs:
- full-width/full-viewport cinematic image
- dark/readable overlay
- title
- short description
- platforms
- genre
- release date
- View Game button
- Add to Library button
- optional hero carousel

Avoid excessive auto-rotation. Respect prefers-reduced-motion.

## Discover / Browse requirements

Create a powerful Browse/Discover page with:

- search
- platform filter
- genre filter
- release year/date filter
- rating filter
- ordering
- pagination or infinite loading
- grid/list presentation if practical

Include quick platform categories/cards:
- PS5
- PS4
- PS3
- PS2
- Xbox Series
- Xbox One
- PC
- Nintendo Switch
- Nintendo legacy platforms if data exists

PS2 and PS3 must be visibly accessible without the user having to discover them inside a generic "Other" menu.

## Search

Search by:
- game title
- platform filter
- genre filter

Search should use debounce and URL query parameters so searches are shareable and browser navigation works correctly.

## Library

Library tabs/filters:
- All
- Want to Play
- Backlog
- Playing
- Completed
- Paused
- Dropped
- Favorites

Allow:
- search inside library
- platform filter
- genre filter
- sort by recently added
- sort by recently updated
- sort by personal rating
- sort by release date
- sort alphabetically

## User profile

Profile should include:
- avatar
- username
- short bio
- XP
- level
- total library count
- playing count
- completed count
- backlog count
- total manually tracked playtime
- favorite games
- highest-rated games
- recent activity
- genre/platform summary charts if practical

## XP system

Create XP events server-side.

Suggested MVP events:
- first time adding a game to the library
- first time marking a game playing
- first time completing a game
- first rating submission
- first favorite action per game

Prevent repeated status toggling from farming XP.

Use a unique event rule such as `(user_id, game_id, event_type)` where appropriate.

## UX rules

- Premium but usable
- Fast perceived performance
- Skeleton loading states
- Helpful empty states
- Responsive on mobile, tablet, desktop
- Keyboard accessible
- Visible focus states
- Accessible contrast
- Respect reduced motion
- Do not block content behind animation
- Lazy-load heavy media
- Use responsive images
- Avoid giant client bundles

## Architecture rules

Third-party game data stays external when possible.

Supabase stores primarily:
- profiles
- user library state
- personal ratings
- favorites
- notes
- progress
- manual playtime
- achievement tracking if included
- XP events

Cache provider responses sensibly.

Do not duplicate the entire external games catalog into Supabase.

## Deliverable expectations

Build a production-quality MVP, not only static screens.

Required:
- functional auth
- functional game search
- functional game details
- functional library actions
- functional detailed ratings
- functional favorite toggle
- functional profile
- functional media gallery
- functional trailers
- PS2/PS3 browsing
- responsive UI
- error handling
- loading states
- empty states
- environment example file
- README
- migrations/schema
- seed/dev instructions
- tests for critical business logic

Before marking the work complete:
1. run type checking
2. run lint
3. run tests
4. run production build
5. fix all blocking errors
6. verify main flows manually
