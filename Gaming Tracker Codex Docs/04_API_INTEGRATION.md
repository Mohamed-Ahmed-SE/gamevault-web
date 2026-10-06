# External Game API Integration

## Architecture

Do not call third-party authenticated game APIs directly from the browser when secrets/tokens are involved.

Create a provider abstraction:

```ts
interface GameProvider {
  searchGames(params): Promise<GameSearchResult>
  getGame(idOrSlug): Promise<GameDetails>
  getScreenshots(gameId): Promise<GameImage[]>
  getTrailers(gameId): Promise<GameTrailer[]>
  getAchievements(gameId): Promise<GameAchievement[]>
  getSuggestedGames(gameId): Promise<GameSummary[]>
  getGamesByPlatform(platformId, params): Promise<GameSearchResult>
}
```

Implement:
- `RawgProvider`

Keep room for:
- `IgdbProvider`

## Normalized domain models

Create normalized internal types so UI components do not depend directly on RAWG response shapes.

Example:

```ts
type GameSummary = {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  backgroundUrl: string | null
  releaseDate: string | null
  rating: number | null
  metacritic: number | null
  platforms: PlatformSummary[]
  genres: GenreSummary[]
}
```

GameDetails should include:
- summary
- description
- storyline if available
- developers
- publishers
- platforms
- release dates
- genres
- tags/themes
- stores/websites
- screenshots
- artwork where available
- trailers/videos
- system requirements
- achievements
- suggested games

## Platform handling

Create canonical internal slugs:
- ps5
- ps4
- ps3
- ps2
- xbox-series
- xbox-one
- pc
- switch
- etc.

Create a config mapping provider platform IDs to internal slugs.

PS2 and PS3 must be explicitly configured and tested.

## Caching

Recommended:
- cache public catalog responses on the server
- use Next.js cache/revalidation when appropriate
- TanStack Query for client transitions and user-facing cache
- short cache for trending/upcoming
- longer cache for stable game metadata

## Error states

Handle:
- rate limits
- missing trailers
- missing screenshots
- missing requirements
- unavailable platform data
- provider outages

Never display undefined/null raw values directly.

## Media

Trailers:
- normalize title/name
- video URL or provider video identifier
- thumbnail
- source

Gallery:
- screenshots first
- artwork second
- deduplicate URLs
- preserve aspect ratio
- responsive loading

## Search

Use server route:
`GET /api/games/search?q=&platform=&genre=&page=`

Debounce user input.

Keep URL params synchronized with the UI.
