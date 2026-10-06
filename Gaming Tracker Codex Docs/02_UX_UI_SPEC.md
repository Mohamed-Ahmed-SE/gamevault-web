# UX / UI Specification

## Visual direction

The app should feel cinematic, dark, premium, and game-focused.

Avoid building a literal clone of Apple TV or PlayStation.

Use:
- large artwork
- strong typographic hierarchy
- subtle glass effects
- dark gradients
- rounded surfaces
- restrained animation
- per-game accent colors where useful

## Global layout

Desktop navigation:
- Home
- Discover
- Library
- Upcoming
- Search
- Profile

Mobile:
- compact header
- bottom nav or compact menu
- search easily reachable

## Home

### Hero
Large cinematic area, ideally 70–90vh on large screens.

Content:
- title/logo
- summary
- platform badges
- release year
- genre
- View Game
- Add to Library

### Rails

Use horizontally scrollable sections:
- Continue Playing
- Trending Now
- Recently Released
- Upcoming
- Backlog
- Favorites
- Top Rated
- PS2 Classics
- PS3 Classics
- PC
- Nintendo
- Xbox

Cards should support:
- poster/landscape art
- title
- year
- platform chip
- rating
- status badge if in library

## Discover

Top:
- title
- search
- platform shortcuts

Platform shortcut cards must include PS2 and PS3 prominently.

Filter drawer/sidebar:
- platform
- genre
- year/date
- rating
- ordering

Results area:
- responsive card grid
- pagination/infinite loading
- empty state
- reset filters action

## Game details

### Hero
Full-width background artwork with strong gradient.

Show:
- title
- metadata
- status
- favorite
- personal rating summary
- public/provider score if available

### Sticky/section navigation
Useful options:
- Overview
- My Progress
- Media
- Ratings
- Achievements
- Details
- Similar Games

### My rating component

Create five rating rows:

Gameplay   [1 2 3 4 5 6 7 8 9 10]
Story      [1 2 3 4 5 6 7 8 9 10]
Graphics   [1 2 3 4 5 6 7 8 9 10]
Sound      [1 2 3 4 5 6 7 8 9 10]
Overall    [1 2 3 4 5 6 7 8 9 10]

Alternative UI allowed:
- slider
- segmented buttons
- clickable score pills

Requirements:
- keyboard accessible
- touch friendly
- clear active state
- clear saved state
- allow reset

### Media area

Order:
1. Featured trailer
2. Additional videos
3. Screenshot gallery
4. Artwork gallery

Lightbox:
- full viewport
- close button
- prev/next
- image count
- keyboard arrows
- Escape closes
- swipe support where reasonable

### Game information
Use organized sections/cards instead of a long wall of text.

## Library UX

Top:
- search
- status tabs
- favorite filter
- platform filter
- sort

Status tabs:
- All
- Want to Play
- Backlog
- Playing
- Completed
- Paused
- Dropped
- Favorites

Card quick actions:
- status menu
- favorite
- view details

## Profile UX

Hero:
- avatar
- username
- level
- XP progress

Stats:
- library
- playing
- completed
- backlog
- total playtime

Sections:
- favorite games
- highest rated
- recent activity
- top genres
- top platforms

## Motion

Use motion to improve hierarchy, not to slow the interface.

Allowed:
- hero crossfade
- card hover elevation/scale
- route/section fades
- gallery transitions
- small menu transitions

Avoid:
- long intro sequences
- animation before content becomes usable
- aggressive parallax
- scroll-jacking
