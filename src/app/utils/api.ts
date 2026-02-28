import { API_BASE_URL, ANIME_API_URL, COMIC_API_URL } from './env';

type ApiRecord = Record<string, any>;

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pickArray = (payload: unknown, keys: string[] = []): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (isRecord(payload.data)) {
    for (const key of keys) {
      if (Array.isArray(payload.data[key])) return payload.data[key];
    }

    if (Array.isArray(payload.data.data)) return payload.data.data;
  }

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;

  return [];
};

const pickObject = (payload: unknown, keys: string[] = []): ApiRecord | null => {
  if (isRecord(payload)) {
    for (const key of keys) {
      if (isRecord(payload[key])) return payload[key];
    }

    if (isRecord(payload.data)) {
      for (const key of keys) {
        if (isRecord(payload.data[key])) return payload.data[key];
      }
      return payload.data;
    }

    return payload;
  }

  return null;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const yearFromDate = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.length < 4) return undefined;
  return value.slice(0, 4);
};

const normalizeDrama = (item: ApiRecord): Drama => ({
  id: String(item.id ?? item.bookId ?? item.dramaId ?? ''),
  bookId: item.bookId ? String(item.bookId) : undefined,
  title: String(item.title ?? item.bookName ?? item.name ?? 'Untitled'),
  coverVerticalUrl:
    item.coverVerticalUrl ?? item.coverWap ?? item.poster ?? item.cover?.url ?? item.cover ?? undefined,
  coverHorizontalUrl:
    item.coverHorizontalUrl ?? item.stills?.url ?? item.horizontalCover ?? item.coverWap ?? undefined,
  introduction: typeof item.introduction === 'string' ? item.introduction : undefined,
  score: toNumber(item.score ?? item.rating ?? item.imdbRatingValue),
  category:
    (typeof item.category === 'string' && item.category) ||
    (typeof item.genre === 'string' && item.genre) ||
    undefined,
  year: (typeof item.year === 'string' && item.year) || yearFromDate(item.releaseDate),
  source: item.source,
});

const normalizeMovie = (item: ApiRecord): Movie => ({
  id: String(item.id ?? item.subjectId ?? ''),
  subjectId: item.subjectId ? String(item.subjectId) : undefined,
  title: String(item.title ?? item.name ?? 'Untitled'),
  poster: item.poster ?? item.cover?.url ?? item.coverVerticalUrl ?? undefined,
  coverVerticalUrl: item.coverVerticalUrl ?? item.cover?.url ?? item.poster ?? undefined,
  coverHorizontalUrl: item.coverHorizontalUrl ?? item.stills?.url ?? item.cover?.url ?? undefined,
  rating: toNumber(item.rating ?? item.score ?? item.imdbRatingValue),
  year: (typeof item.year === 'string' && item.year) || yearFromDate(item.releaseDate),
  category: (typeof item.category === 'string' && item.category) || (typeof item.genre === 'string' ? item.genre : undefined),
  description: typeof item.description === 'string' ? item.description : undefined,
});

const normalizeAnime = (item: ApiRecord): Anime => ({
  id: String(item.id ?? item.animeId ?? item.slug ?? ''),
  slug: item.slug ? String(item.slug) : item.animeId ? String(item.animeId) : undefined,
  title: String(item.title ?? item.name ?? 'Untitled'),
  thumbnail: item.thumbnail ?? item.poster ?? item.cover ?? undefined,
  cover: item.cover ?? item.poster ?? item.thumbnail ?? undefined,
  episode: typeof item.episode === 'string' ? item.episode : undefined,
  rating: toNumber(item.rating ?? item.score),
  status: typeof item.status === 'string' ? item.status : undefined,
  type: typeof item.type === 'string' ? item.type : undefined,
});

const normalizeKomik = (item: ApiRecord): Komik => ({
  id: String(item.id ?? item.slug ?? ''),
  slug: item.slug ? String(item.slug) : undefined,
  title: String(item.title ?? item.name ?? 'Untitled'),
  thumbnail: item.thumbnail ?? item.cover ?? undefined,
  cover: item.cover ?? item.thumbnail ?? undefined,
  chapter: typeof item.chapter === 'string' ? item.chapter : undefined,
  rating: toNumber(item.rating ?? item.score),
  type: typeof item.type === 'string' ? item.type : undefined,
});

const normalizeDramaList = (items: any[]): Drama[] => items.filter(isRecord).map(normalizeDrama);
const normalizeMovieList = (items: any[]): Movie[] => items.filter(isRecord).map(normalizeMovie);
const normalizeAnimeList = (items: any[]): Anime[] => items.filter(isRecord).map(normalizeAnime);
const normalizeKomikList = (items: any[]): Komik[] => items.filter(isRecord).map(normalizeKomik);

export interface Drama {
  id: string;
  bookId?: string;
  title: string;
  coverVerticalUrl?: string;
  coverHorizontalUrl?: string;
  introduction?: string;
  score?: number;
  category?: string;
  year?: string;
  source?: 'dramabox' | 'reelshort' | 'netshort' | 'melolo' | 'flickreels' | 'freereels' | 'moviebox';
}

export interface Episode {
  episodeNumber: number;
  title?: string;
  videoUrl?: string;
  videoId?: string;
  duration?: number;
}

export interface DramaDetail extends Drama {
  episodes?: Episode[];
  director?: string;
  actors?: string;
  totalEpisodes?: number;
  allEpisodes?: any[];
}

// Anime interfaces
export interface Anime {
  id: string;
  slug?: string;
  title: string;
  thumbnail?: string;
  cover?: string;
  episode?: string;
  rating?: number;
  status?: string;
  type?: string;
}

export interface AnimeDetail extends Anime {
  synopsis?: string;
  genres?: string[];
  studio?: string;
  episodes?: AnimeEpisode[];
  releaseDate?: string;
}

export interface AnimeEpisode {
  id: string;
  episodeNumber: number;
  title?: string;
  thumbnail?: string;
}

// Komik interfaces
export interface Komik {
  id: string;
  slug?: string;
  title: string;
  thumbnail?: string;
  cover?: string;
  chapter?: string;
  rating?: number;
  type?: string;
}

export interface KomikDetail extends Komik {
  synopsis?: string;
  genres?: string[];
  author?: string;
  chapters?: KomikChapter[];
  status?: string;
}

export interface KomikChapter {
  id: string;
  chapterNumber: string;
  title?: string;
  releaseDate?: string;
}

// Genre interface for komik
export interface Genre {
  id: string;
  name: string;
  slug: string;
}

// Chapter detail interface
export interface KomikChapterDetail {
  slug: string;
  title: string;
  images: string[];
  prevChapter?: string;
  nextChapter?: string;
}

// Movie interfaces
export interface Movie {
  id: string;
  subjectId?: string;
  title: string;
  poster?: string;
  coverVerticalUrl?: string;
  coverHorizontalUrl?: string;
  rating?: number;
  year?: string;
  category?: string;
  description?: string;
}

export interface MovieDetail extends Movie {
  genres?: string[];
  director?: string;
  cast?: string[];
  duration?: string;
  seasons?: MovieSeason[];
}

export interface MovieSeason {
  season: number;
  episodes: MovieEpisode[];
}

export interface MovieEpisode {
  episode: number;
  title?: string;
}

// Mock data sebagai fallback
const MOCK_DRAMAS: Drama[] = [
  {
    id: '1',
    title: 'Love in Moonlight',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1761993419168-6c2efb805165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1761993419168-6c2efb805165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'A beautiful love story set in ancient palace filled with romance, mystery, and political intrigue.',
    score: 9.2,
    category: 'Romance',
    year: '2024',
    source: 'dramabox',
  },
  {
    id: '2',
    title: 'Eternal Promise',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1680977735341-29992d88e0e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1680977735341-29992d88e0e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'Two souls destined to meet across time and space in this epic romantic fantasy drama.',
    score: 8.9,
    category: 'Fantasy',
    year: '2024',
    source: 'dramabox',
  },
  {
    id: '3',
    title: 'Destiny of Love',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1771813842847-c3dd0bfdf051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1771813842847-c3dd0bfdf051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'A heartwarming tale of love that defies all odds and brings two hearts together.',
    score: 9.0,
    category: 'Romance',
    year: '2024',
    source: 'dramabox',
  },
  {
    id: '4',
    title: 'Royal Hearts',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1654016063013-904d33f9d2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1654016063013-904d33f9d2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'A prince falls in love with a commoner, challenging royal traditions and society.',
    score: 8.7,
    category: 'Drama',
    year: '2024',
    source: 'dramabox',
  },
  {
    id: '5',
    title: 'Midnight Dreams',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1762270242162-b04c34ac21ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1762270242162-b04c34ac21ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'A thrilling mystery drama that unfolds in the shadows of the night.',
    score: 8.5,
    category: 'Thriller',
    year: '2024',
    source: 'dramabox',
  },
  {
    id: '6',
    title: 'Summer Romance',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1688678004647-945d5aaf91c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    coverHorizontalUrl: 'https://images.unsplash.com/photo-1688678004647-945d5aaf91c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    introduction: 'A sweet summer love story that will warm your heart.',
    score: 8.3,
    category: 'Romance',
    year: '2023',
    source: 'dramabox',
  },
];

const MOCK_ANIME: Anime[] = [
  {
    id: '1',
    slug: 'naruto-shippuden',
    title: 'Naruto Shippuden',
    thumbnail: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    episode: 'Episode 500',
    rating: 9.5,
    status: 'Completed',
    type: 'TV Series',
  },
  {
    id: '2',
    slug: 'one-piece',
    title: 'One Piece',
    thumbnail: 'https://images.unsplash.com/photo-1767519865116-03378fec84b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1767519865116-03378fec84b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    episode: 'Episode 1090',
    rating: 9.8,
    status: 'Ongoing',
    type: 'TV Series',
  },
  {
    id: '3',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    thumbnail: 'https://images.unsplash.com/photo-1695747003335-ac77eeea43c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1695747003335-ac77eeea43c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    episode: 'Episode 87',
    rating: 9.7,
    status: 'Completed',
    type: 'TV Series',
  },
];

const MOCK_KOMIK: Komik[] = [
  {
    id: '1',
    slug: 'solo-leveling',
    title: 'Solo Leveling',
    thumbnail: 'https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    chapter: 'Chapter 179',
    rating: 9.8,
    type: 'Manhwa',
  },
  {
    id: '2',
    slug: 'tower-of-god',
    title: 'Tower of God',
    thumbnail: 'https://images.unsplash.com/photo-1746913434626-27d04183ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1746913434626-27d04183ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    chapter: 'Chapter 598',
    rating: 9.5,
    type: 'Manhwa',
  },
  {
    id: '3',
    slug: 'one-punch-man',
    title: 'One Punch Man',
    thumbnail: 'https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    cover: 'https://images.unsplash.com/photo-1763732397784-c5ff2651d40c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    chapter: 'Chapter 195',
    rating: 9.6,
    type: 'Manga',
  },
];

const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Last Kingdom',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    rating: 8.5,
    year: '2023',
    category: 'Action',
  },
  {
    id: '2',
    title: 'Eternal Love',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    rating: 9.2,
    year: '2023',
    category: 'Romance',
  },
  {
    id: '3',
    title: 'Shadow Warrior',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    rating: 8.8,
    year: '2024',
    category: 'Action',
  },
  {
    id: '4',
    title: 'Mystic Journey',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    rating: 8.0,
    year: '2023',
    category: 'Fantasy',
  },
  {
    id: '5',
    title: 'City Lights',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    rating: 7.9,
    year: '2024',
    category: 'Drama',
  },
  {
    id: '6',
    title: 'Ocean Deep',
    coverVerticalUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    rating: 8.3,
    year: '2024',
    category: 'Adventure',
  },
];

const MOCK_EPISODES: Episode[] = Array.from({ length: 24 }, (_, i) => ({
  episodeNumber: i + 1,
  title: `Episode ${i + 1}`,
  videoUrl: `https://example.com/episode-${i + 1}.mp4`,
}));

export async function fetchDramaBoxVIP(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/vip`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS.slice(0, 5);
  }
}

export async function fetchDramaBoxTrending(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/trending`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchDramaBoxLatest(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/latest`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchDramaBoxRandom(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/random`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchDramaBoxForYou(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/foryou`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchDramaBoxDubindo(classify: string = 'terbaru', page: number = 1): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/dubindo?classify=${classify}&page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchDramaBoxDetail(bookId: string): Promise<DramaDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/detail/${bookId}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return (pickObject(data, ['detail', 'drama']) as DramaDetail | null) || null;
  } catch (error) {
    const mockDrama = MOCK_DRAMAS.find(d => d.id === bookId);
    if (mockDrama) {
      return {
        ...mockDrama,
        director: 'John Director',
        actors: 'Actor One, Actor Two, Actor Three',
        totalEpisodes: 24,
      };
    }
    return null;
  }
}

export async function fetchDramaBoxEpisodes(bookId: string): Promise<Episode[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/allepisode/${bookId}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['episodes', 'allEpisodes']);
  } catch (error) {
    return MOCK_EPISODES;
  }
}

export async function searchDramas(query: string): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dramabox/search?query=${encodeURIComponent(query)}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return normalizeDramaList(pickArray(data, ['dramaList', 'bookList', 'list']));
  } catch (error) {
    // Filter mock data based on query
    return MOCK_DRAMAS.filter(drama =>
      drama.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function fetchMovieBoxHomepage() {
  try {
    const response = await fetch(`${API_BASE_URL}/moviebox/homepage`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const payload = pickObject(data, ['homepage']);
    return payload || {};
  } catch (error) {
    return { movies: MOCK_MOVIES };
  }
}

export async function fetchMovieBoxTrending(page: number = 0): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviebox/trending?page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const movies = normalizeMovieList(pickArray(data, ['subjectList', 'movieList', 'list']));
    return movies.length > 0 ? movies : MOCK_MOVIES;
  } catch (error) {
    return MOCK_MOVIES;
  }
}

export async function searchMovieBox(query: string, page: number = 0): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviebox/search?query=${encodeURIComponent(query)}&page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return normalizeMovieList(pickArray(data, ['subjectList', 'movieList', 'list']));
  } catch (error) {
    return MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
  }
}

export async function fetchMovieBoxDetail(subjectId: string): Promise<MovieDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/moviebox/detail?subjectId=${subjectId}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return (pickObject(data, ['subject', 'detail']) as MovieDetail | null) || null;
  } catch (error) {
    return MOCK_MOVIES[0] as MovieDetail;
  }
}

// ==================== ANIME API FUNCTIONS ====================

export async function fetchAnimeOngoing(page: number = 1): Promise<Anime[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/ongoing?page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Key utama adalah data.animeList sesuai dokumentasi
    const list = normalizeAnimeList(data.data?.animeList || []);
    return list.length > 0 ? list : MOCK_ANIME;
  } catch (error) {
    return MOCK_ANIME;
  }
}

export async function fetchAnimeCompleted(page: number = 1): Promise<Anime[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/completed?page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Key utama adalah data.animeList sesuai dokumentasi
    const list = normalizeAnimeList(data.data?.animeList || []);
    return list.length > 0 ? list : MOCK_ANIME;
  } catch (error) {
    return MOCK_ANIME;
  }
}

export async function fetchAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  try {
    const response = await fetch(`${ANIME_API_URL}/anime/${slug}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    const mockAnime = MOCK_ANIME.find(a => a.slug === slug);
    if (mockAnime) {
      return {
        ...mockAnime,
        synopsis: 'An epic anime story full of adventure, friendship, and battles.',
        genres: ['Action', 'Adventure', 'Fantasy'],
        studio: 'Studio Pierrot',
        releaseDate: '2024',
      };
    }
    return null;
  }
}

export async function searchAnime(query: string, page: number = 1): Promise<Anime[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/search?q=${encodeURIComponent(query)}&page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return normalizeAnimeList(pickArray(data, ['animeList', 'list']));
  } catch (error) {
    return MOCK_ANIME.filter(anime =>
      anime.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Fetch anime schedule
export async function fetchAnimeSchedule(): Promise<any> {
  try {
    const response = await fetch(`${ANIME_API_URL}/schedule`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Key utama adalah data.days sesuai dokumentasi
    return data.data?.days || {};
  } catch (error) {
    return {};
  }
}

// Fetch anime genres
export async function fetchAnimeGenres(): Promise<any[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/genres`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Key utama adalah data.genreList sesuai dokumentasi
    return data.data?.genreList || [];
  } catch (error) {
    return [];
  }
}

// Fetch anime by genre
export async function fetchAnimeByGenre(slug: string, page: number = 1): Promise<Anime[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/genres/${slug}?page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Mungkin ada animeList di data
    const list = normalizeAnimeList(data.data?.animeList || data.data || []);
    return list.length > 0 ? list : MOCK_ANIME;
  } catch (error) {
    return MOCK_ANIME;
  }
}

// Fetch anime list (A-Z)
export async function fetchAnimeList(): Promise<any[]> {
  try {
    const response = await fetch(`${ANIME_API_URL}/list`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    // Key utama adalah data.list sesuai dokumentasi
    return data.data?.list || [];
  } catch (error) {
    return [];
  }
}

// ==================== KOMIK API FUNCTIONS ====================

export async function fetchKomikTop(): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/top`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = normalizeKomikList(pickArray(data, ['komikList', 'list']));
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

export async function fetchKomikLatest(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/latest/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = normalizeKomikList(pickArray(data, ['komikList', 'list']));
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

export async function fetchKomikPopuler(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/populer/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = normalizeKomikList(pickArray(data, ['komikList', 'list']));
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

export async function fetchKomikDetail(slug: string): Promise<KomikDetail | null> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/detail/${slug}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return (pickObject(data, ['komik', 'detail']) as KomikDetail | null) || null;
  } catch (error) {
    const mockKomik = MOCK_KOMIK.find(k => k.slug === slug);
    if (mockKomik) {
      return {
        ...mockKomik,
        synopsis: 'An amazing comic story with incredible artwork and compelling narrative.',
        genres: ['Action', 'Fantasy', 'Adventure'],
        author: 'Amazing Author',
        status: 'Ongoing',
      };
    }
    return null;
  }
}

export async function searchKomik(query: string, page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/search/${query}?q=${encodeURIComponent(query)}&page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['komikList', 'list']);
  } catch (error) {
    return MOCK_KOMIK.filter(komik =>
      komik.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Get list of genres
export async function fetchKomikGenres(): Promise<Genre[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/genres`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['genreList', 'genres']);
  } catch (error) {
    return [];
  }
}

// Get komik by genre
export async function fetchKomikByGenre(genre: string, page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/genre/${genre}/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

// Get manga only
export async function fetchKomikManga(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/only/manga/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK.filter(k => k.type === 'Manga');
  } catch (error) {
    return MOCK_KOMIK.filter(k => k.type === 'Manga');
  }
}

// Get manhwa only
export async function fetchKomikManhwa(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/only/manhwa/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK.filter(k => k.type === 'Manhwa');
  } catch (error) {
    return MOCK_KOMIK.filter(k => k.type === 'Manhwa');
  }
}

// Get manhua only
export async function fetchKomikManhua(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/only/manhua/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK.filter(k => k.type === 'Manhua');
  } catch (error) {
    return MOCK_KOMIK.filter(k => k.type === 'Manhua');
  }
}

// Get komik berwarna
export async function fetchKomikBerwarna(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/komikberwarna/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

// Get chapter detail
export async function fetchKomikChapter(slug: string): Promise<KomikChapterDetail | null> {
  try {
    const response = await fetch(`${COMIC_API_URL}/bacakomik/chapter/${slug}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return (pickObject(data, ['chapter', 'detail']) as KomikChapterDetail | null) || null;
  } catch (error) {
    return null;
  }
}

// Get pustaka (library)
export async function fetchKomikPustaka(page: number = 1): Promise<Komik[]> {
  try {
    const response = await fetch(`${COMIC_API_URL}/pustaka/${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const komik = pickArray(data, ['komikList', 'list']);
    return komik.length > 0 ? komik : MOCK_KOMIK;
  } catch (error) {
    return MOCK_KOMIK;
  }
}

// ==================== REELSHORT API FUNCTIONS ====================

export async function fetchReelShortHomepage() {
  try {
    const response = await fetch(`${API_BASE_URL}/reelshort/homepage`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const payload = pickObject(data, ['dramaList', 'homepage']);
    return payload || {};
  } catch (error) {
    return { dramas: MOCK_DRAMAS.slice(0, 6) };
  }
}

export async function searchReelShort(query: string, page: number = 1): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reelshort/search?query=${encodeURIComponent(query)}&page=${page}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['dramaList', 'bookList', 'list']);
  } catch (error) {
    return MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));
  }
}

// ==================== MELOLO API FUNCTIONS ====================

export async function fetchMeloloLatest(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/melolo/latest`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchMeloloTrending(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/melolo/trending`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function searchMelolo(query: string): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/melolo/search?query=${encodeURIComponent(query)}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['dramaList', 'bookList', 'list']);
  } catch (error) {
    return MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));
  }
}

// ==================== FLICKREELS API FUNCTIONS ====================

export async function fetchFlickReelsForYou(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/flickreels/foryou`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchFlickReelsLatest(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/flickreels/latest`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchFlickReelsHotRank(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/flickreels/hotrank`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function searchFlickReels(query: string): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/flickreels/search?query=${encodeURIComponent(query)}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['dramaList', 'bookList', 'list']);
  } catch (error) {
    return MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));
  }
}

// ==================== FREEREELS API FUNCTIONS ====================

export async function fetchFreeReelsForYou(): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/freereels/foryou`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const dramas = pickArray(data, ['dramaList', 'bookList', 'list']);
    return dramas.length > 0 ? dramas : MOCK_DRAMAS;
  } catch (error) {
    return MOCK_DRAMAS;
  }
}

export async function fetchFreeReelsHome() {
  try {
    const response = await fetch(`${API_BASE_URL}/freereels/home`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    const payload = pickObject(data, ['dramaList', 'homepage']);
    return payload || {};
  } catch (error) {
    return { dramas: MOCK_DRAMAS.slice(0, 6) };
  }
}

export async function searchFreeReels(query: string): Promise<Drama[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/freereels/search?query=${encodeURIComponent(query)}`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['dramaList', 'bookList', 'list']);
  } catch (error) {
    return MOCK_DRAMAS.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));
  }
}

// ==================== NETSHORT API FUNCTIONS ====================

export async function fetchNetShortTheaters() {
  try {
    const response = await fetch(`${API_BASE_URL}/netshort/theaters`, {
      mode: 'cors',
    });
    if (!response.ok) throw new Error('API not available');
    const data = await response.json();
    return pickArray(data, ['dramaList', 'bookList', 'list']);
  } catch (error) {
    return [];
  }
}
