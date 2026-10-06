export type PlatformSummary = { id: string; slug: string; name: string };
export type GenreSummary = { id: string; name: string; slug: string };
export type GameSummary = {
  id: string; slug: string; title: string; coverUrl: string | null; backgroundUrl: string | null; logoUrl?: string | null;
  releaseDate: string | null; rating: number | null; metacritic: number | null;
  platforms: PlatformSummary[]; genres: GenreSummary[]; description?: string;
};
export type GameImage = { id: string; url: string; source: "screenshot" | "artwork" };
export type GameTrailer = { id: string; name: string; url: string; thumbnailUrl: string | null };
export type GameAchievement = { id: string; name: string; description: string; iconUrl: string | null; rarity: number | null };
export type GameDetails = GameSummary & {
  description: string; storyline: string | null; developers: string[]; publishers: string[];
  tags: string[]; website: string | null; esrbRating: string | null; requirements: string | null;
  images: GameImage[]; trailers: GameTrailer[]; achievements: GameAchievement[]; similar: GameSummary[];
};
export type SearchParams = { query?: string; platform?: string; genre?: string; year?: string; minRating?: number; ordering?: string; page?: number; artworkLimit?: number };
export type GameSearchResult = { games: GameSummary[]; count: number; page: number; pageSize: number };
