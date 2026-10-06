# Product Requirements Document

## 1. Product summary

A web application for gamers to discover games and maintain a personal record of what they want to play, are playing, have completed, paused, dropped, or saved in a backlog.

The product combines public game metadata from an external provider with private/personal user data stored in Supabase.

## 2. Primary user goals

Users should be able to:

- discover modern and retro games
- find PS2 and PS3 titles easily
- inspect rich game details
- watch trailers
- browse screenshots and artwork
- add games to a personal library
- change game status
- rate individual parts of a game
- mark favorite games
- track manually entered playtime
- view achievements/trophies metadata
- build a gaming profile over time

## 3. Core MVP features

### Authentication
- email/password
- OAuth optional
- protected user pages
- persistent sessions

### Home
- cinematic featured hero
- personalized sections
- discovery sections
- PS2 Classics rail
- PS3 Classics rail

### Discover
- catalog browsing
- platform browsing
- PS2 and PS3 explicit categories
- genre filters
- sorting
- release-date filtering

### Game details
- hero
- summary
- metadata
- library controls
- status
- favorites
- granular ratings
- trailers
- gallery
- achievements
- PC requirements
- similar games

### Library
- all saved games
- status filters
- favorites filter
- platform and genre filters
- sorting

### Profile
- user overview
- level and XP
- counts
- favorites
- top-rated games
- recent activity

## 4. User game statuses

Allowed values:

- want_to_play
- backlog
- playing
- completed
- paused
- dropped

No `completed_100`, `platinum`, or equivalent completion status.

## 5. Personal ratings

Fields:
- gameplay_rating
- story_rating
- graphics_rating
- sound_rating
- overall_rating

All values:
- nullable
- integer or decimal from 1 to 10

The user controls each score independently.

## 6. Favorites

Favorite is independent from status.

A game can be:
- completed + favorite
- backlog + favorite
- playing + favorite
- etc.

## 7. Media

Game details must support:

### Trailer section
- one primary trailer
- additional trailers when available
- responsive 16:9 player
- poster/fallback state
- lazy loading

### Gallery
- screenshots
- artwork
- modal/lightbox
- previous/next
- thumbnails
- keyboard support
- swipe-friendly mobile behavior

## 8. Classic platform support

PS2 and PS3 are first-class catalog experiences.

Required:
- visible homepage rails
- visible Discover platform cards
- platform filter entries
- platform landing/filter URLs
- game cards that display PS2/PS3 labels

Example:
- `/discover?platform=ps2`
- `/discover?platform=ps3`

## 9. Non-goals for MVP

Do not require:
- real PlayStation Network login
- real Xbox account login
- automatic trophy synchronization
- multiplayer social graph
- chat
- marketplace
- game purchases
- streaming games
- automatic playtime synchronization from consoles

## 10. Success criteria

The MVP succeeds if a user can:

1. register/login
2. discover a PS2 or PS3 game
3. open its details page
4. view its gallery and trailer when available
5. add it to the library
6. set a status
7. rate gameplay/story/graphics/sound/overall
8. mark it favorite
9. see it correctly reflected in Library
10. see favorites and stats reflected on Profile
