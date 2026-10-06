# Routes and Component Architecture

## Routes

```txt
/
 /discover
 /discover/[platform]
 /search
 /game/[slug]
 /library
 /upcoming
 /profile/[username]
 /profile/[username]/stats
 /settings
 /auth/login
 /auth/register
```

Optional platform URLs:
```txt
/discover/ps2
/discover/ps3
/discover/ps4
/discover/ps5
/discover/pc
/discover/switch
/discover/xbox-series
```

## API routes / server functions

```txt
/api/games/featured
/api/games/trending
/api/games/upcoming
/api/games/search
/api/games/[id]
/api/games/[id]/screenshots
/api/games/[id]/trailers
/api/games/[id]/achievements
/api/games/[id]/suggested
/api/games/platform/[platform]
```

User mutations should use server actions or protected API handlers.

## Shared components

### Navigation
- `MainHeader`
- `MobileNavigation`
- `GlobalSearch`

### Home
- `FeaturedHero`
- `HeroSlide`
- `GameRail`
- `ContinuePlayingRail`
- `PlatformRail`

### Games
- `GameCard`
- `GameLandscapeCard`
- `GamePosterCard`
- `PlatformBadge`
- `GenreBadge`
- `GameStatusMenu`
- `FavoriteButton`

### Game details
- `GameHero`
- `GameMeta`
- `UserGameControls`
- `PersonalProgressCard`
- `DetailedRatingPanel`
- `TrailerSection`
- `TrailerPlayer`
- `MediaGallery`
- `MediaLightbox`
- `AchievementGrid`
- `RequirementsPanel`
- `SimilarGamesRail`

### Library
- `LibraryTabs`
- `LibraryFilters`
- `LibraryGameGrid`
- `LibraryEmptyState`

### Profile
- `ProfileHero`
- `XpProgress`
- `ProfileStats`
- `FavoriteGames`
- `HighestRatedGames`
- `RecentActivity`
- `GenreBreakdown`
- `PlatformBreakdown`

## DetailedRatingPanel behavior

Props should support:
- current gameplay score
- current story score
- current graphics score
- current sound score
- current overall score
- save state
- reset one field
- reset all
- optimistic UI if safe

Validation:
- null or 1–10
- reject out-of-range values server-side
