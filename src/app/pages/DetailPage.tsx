import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router';
import { Star, Play, Calendar, Users, X, BookOpen } from 'lucide-react';
import { 
  fetchDramaBoxDetail, 
  fetchDramaBoxEpisodes, 
  fetchAnimeDetail,
  fetchKomikDetail,
  type DramaDetail, 
  type Episode,
  type AnimeDetail,
  type KomikDetail
} from '../utils/api';
import { API_BASE_URL } from '../utils/env';

export function DetailPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [drama, setDrama] = useState<DramaDetail | null>(null);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [komik, setKomik] = useState<KomikDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSynopsis, setShowSynopsis] = useState(false);

  // Get source from URL params
  const source = searchParams.get('source') || 'dramabox';

  // Determine content type from path
  const isAnime = location.pathname.includes('/anime/');
  const isKomik = location.pathname.includes('/komik/');
  const isDrama = !isAnime && !isKomik;

  const extractObject = (payload: any) => {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return payload.data;
      }
      return payload;
    }
    return null;
  };

  const extractEpisodes = (payload: any): any[] => {
    const fromData = payload?.data;
    return (
      payload?.allEpisodes ||
      payload?.episodes ||
      fromData?.allEpisodes ||
      fromData?.episodes ||
      (Array.isArray(fromData) ? fromData : null) ||
      (Array.isArray(payload) ? payload : [])
    );
  };

  useEffect(() => {
    if (isAnime && slug) {
      loadAnimeDetail(slug);
    } else if (isKomik && slug) {
      loadKomikDetail(slug);
    } else if (id) {
      loadDramaDetail(id, source);
    }
  }, [id, slug, isAnime, isKomik, source]);

  const loadDramaDetail = async (bookId: string, provider: string) => {
    setLoading(true);
    try {
      let dramaData: any = null;
      let episodesData: any[] = [];

      switch (provider) {
        case 'dramabox':
          const response = await fetch(`${API_BASE_URL}/dramabox/detail/${bookId}`);
          if (response.ok) {
            const json = await response.json();
            dramaData = extractObject(json);
          }
          
          const episodesResponse = await fetch(`${API_BASE_URL}/dramabox/allepisode/${bookId}`);
          if (episodesResponse.ok) {
            const episodesJson = await episodesResponse.json();
            episodesData = extractEpisodes(episodesJson);
          }
          break;

        case 'reelshort':
          const reelshortResponse = await fetch(`${API_BASE_URL}/reelshort/detail?bookId=${bookId}`);
          if (reelshortResponse.ok) {
            const json = await reelshortResponse.json();
            dramaData = extractObject(json);
            episodesData = extractEpisodes(json);
          }
          break;

        case 'melolo':
          const meloloResponse = await fetch(`${API_BASE_URL}/melolo/detail?bookId=${bookId}`);
          if (meloloResponse.ok) {
            const json = await meloloResponse.json();
            dramaData = extractObject(json);
            episodesData = extractEpisodes(json);
          }
          break;

        case 'flickreels':
          const flickreelsResponse = await fetch(`${API_BASE_URL}/flickreels/detail?id=${bookId}`);
          if (flickreelsResponse.ok) {
            const json = await flickreelsResponse.json();
            dramaData = extractObject(json);
            episodesData = extractEpisodes(json);
          }
          break;

        case 'freereels':
          const freereelsResponse = await fetch(`${API_BASE_URL}/freereels/detail?id=${bookId}`);
          if (freereelsResponse.ok) {
            const json = await freereelsResponse.json();
            dramaData = extractObject(json);
            episodesData = extractEpisodes(json);
          }
          break;

        default:
          const defaultResponse = await fetch(`${API_BASE_URL}/dramabox/detail/${bookId}`);
          if (defaultResponse.ok) {
            const json = await defaultResponse.json();
            dramaData = extractObject(json);
          }
      }

      setDrama(dramaData);
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error loading drama detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnimeDetail = async (animeSlug: string) => {
    setLoading(true);
    const animeData = await fetchAnimeDetail(animeSlug);
    setAnime(animeData);
    setLoading(false);
  };

  const loadKomikDetail = async (komikSlug: string) => {
    setLoading(true);
    const komikData = await fetchKomikDetail(komikSlug);
    setKomik(komikData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Handle Drama Display
  if (isDrama && drama) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <img
            src={drama.coverHorizontalUrl || drama.coverVerticalUrl || 'https://via.placeholder.com/1920x1080'}
            alt={drama.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
            }}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {drama.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                {drama.score && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star size={24} fill="currentColor" />
                    <span className="text-2xl font-bold">{drama.score}</span>
                  </div>
                )}
                {drama.year && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar size={20} />
                    <span>{drama.year}</span>
                  </div>
                )}
                {drama.category && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                    {drama.category}
                  </span>
                )}
                <span className="px-3 py-1 bg-orange-600 rounded-full text-white text-sm uppercase">
                  {source}
                </span>
              </div>
              {episodes.length > 0 && (
                <Link
                  to={`/watch/${id}?source=${source}&episode=1`}
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold transition text-lg"
                >
                  <Play size={24} fill="currentColor" />
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 md:px-12 lg:px-16 py-12">
          {/* Synopsis */}
          {drama.introduction && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-white/80 leading-relaxed">
                {drama.introduction}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {drama.director && (
              <div>
                <h3 className="text-white/60 mb-2">Director</h3>
                <p className="text-white font-semibold">{drama.director}</p>
              </div>
            )}
            {drama.actors && (
              <div>
                <h3 className="text-white/60 mb-2">Cast</h3>
                <p className="text-white font-semibold">{drama.actors}</p>
              </div>
            )}
            {drama.totalEpisodes && (
              <div>
                <h3 className="text-white/60 mb-2">Total Episodes</h3>
                <p className="text-white font-semibold">{drama.totalEpisodes} Episodes</p>
              </div>
            )}
          </div>

          {/* Episodes */}
          {episodes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Episodes ({episodes.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {episodes.map((episode) => (
                  <Link
                    key={episode.episodeNumber}
                    to={`/watch/${id}?source=${source}&episode=${episode.episodeNumber}`}
                    className="bg-white/10 hover:bg-orange-600 text-white p-4 rounded-lg text-center font-semibold transition"
                  >
                    EP {episode.episodeNumber}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle Anime Display
  if (isAnime && anime) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <img
            src={anime.cover || anime.thumbnail || 'https://via.placeholder.com/1920x1080'}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {anime.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                {anime.rating && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star size={24} fill="currentColor" />
                    <span className="text-2xl font-bold">{anime.rating}</span>
                  </div>
                )}
                {anime.status && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                    {anime.status}
                  </span>
                )}
                {anime.type && (
                  <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm">
                    {anime.type}
                  </span>
                )}
              </div>
              {anime.episodes && anime.episodes.length > 0 && (
                <Link
                  to={`/watch/anime/${slug}?episode=${anime.episodes[0]?.id}`}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold transition text-lg"
                >
                  <Play size={24} fill="currentColor" />
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 md:px-12 lg:px-16 py-12">
          {anime.synopsis && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-white/80 leading-relaxed">{anime.synopsis}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <h3 className="text-white/60 mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {anime.studio && (
              <div>
                <h3 className="text-white/60 mb-2">Studio</h3>
                <p className="text-white font-semibold">{anime.studio}</p>
              </div>
            )}
          </div>

          {anime.episodes && anime.episodes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Episodes ({anime.episodes.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {anime.episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    to={`/watch/anime/${slug}?episode=${episode.id}`}
                    className="bg-white/10 hover:bg-purple-600 text-white p-4 rounded-lg text-center font-semibold transition"
                  >
                    EP {episode.episodeNumber}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle Komik Display
  if (isKomik && komik) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <img
            src={komik.cover || komik.thumbnail || 'https://via.placeholder.com/1920x1080'}
            alt={komik.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {komik.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                {komik.rating && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star size={24} fill="currentColor" />
                    <span className="text-2xl font-bold">{komik.rating}</span>
                  </div>
                )}
                {komik.type && (
                  <span className="px-3 py-1 bg-red-600 rounded-full text-white text-sm">
                    {komik.type}
                  </span>
                )}
                {komik.status && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                    {komik.status}
                  </span>
                )}
              </div>
              {komik.chapters && komik.chapters.length > 0 && (
                <Link
                  to={`/read/${slug}/${komik.chapters[0]?.id}`}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold transition text-lg"
                >
                  <BookOpen size={24} />
                  Read Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 md:px-12 lg:px-16 py-12">
          {komik.synopsis && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-white/80 leading-relaxed">{komik.synopsis}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {komik.genres && komik.genres.length > 0 && (
              <div>
                <h3 className="text-white/60 mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {komik.genres.map((genre, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {komik.author && (
              <div>
                <h3 className="text-white/60 mb-2">Author</h3>
                <p className="text-white font-semibold">{komik.author}</p>
              </div>
            )}
          </div>

          {komik.chapters && komik.chapters.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Chapters ({komik.chapters.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {komik.chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/read/${slug}/${chapter.id}`}
                    className="bg-white/10 hover:bg-red-600 text-white p-4 rounded-lg font-semibold transition"
                  >
                    Chapter {chapter.chapterNumber}
                    {chapter.title && <div className="text-sm text-white/70 mt-1">{chapter.title}</div>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-xl">Content not found</div>
    </div>
  );
}
