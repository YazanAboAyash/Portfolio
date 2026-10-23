/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export interface BaseMediaItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  genre?: string[];
}

export interface Book extends BaseMediaItem {
  type: "book";
  author: string;
  isbn?: string;
  pages?: number;
  publishedYear?: number;
  goodreadsUrl?: string;
  amazonUrl?: string;
}

export interface Movie extends BaseMediaItem {
  type: "movie";
  director: string;
  releaseYear: number;
  duration?: number; // in minutes
  imdbUrl?: string;
  tmdbId?: string;
}

export interface Series extends BaseMediaItem {
  type: "series";
  creator: string;
  seasons: number;
  episodes?: number;
  releaseYear: number;
  imdbUrl?: string;
  tmdbId?: string;
}

export interface Podcast extends BaseMediaItem {
  type: "podcast";
  host: string;
  episodes?: number;
  platform?: string;
  spotifyUrl?: string;
  appleUrl?: string;
}

export interface Game extends BaseMediaItem {
  type: "game";
  developer: string;
  platform: string[];
  releaseYear: number;
  steamUrl?: string;
  metacriticScore?: number;
}

export type MediaItem = Book | Movie | Series | Podcast | Game;

export interface MediaShelfProps {
  title: string;
  items: MediaItem[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export interface MediaCardProps {
  item: MediaItem;
  onItemClick?: (item: MediaItem) => void;
  showDetails?: boolean;
}

export interface MediaCardsProps {
  items?: MediaItem[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onItemClick?: (item: MediaItem) => void;
  showDetails?: boolean;
  className?: string;
}
