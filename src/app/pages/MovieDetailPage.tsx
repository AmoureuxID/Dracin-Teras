import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Star, Calendar, Play, Users, Clapperboard, Film } from 'lucide-react';
import { fetchMovieBoxDetail, type MovieDetail, type MovieSeason } from '../utils/api';

type SeasonBlock = {
  season: number;
  episodes: { episode: number; title?: string }[];
};

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [seasons, setSeasons] = useState<SeasonBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const toSafeNumber = (value: any, fallback: number) => {
    const parsed = Number.parseInt(String(value ?? ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizeSeasons = (detail: any): SeasonBlock[] => {
    const seasonList =
      detail?.seasons ||
      detail?.seasonList ||
      detail?.seasonInfoList ||
      detail?.season ||
      [];
    if (Array.isArray(seasonList) && seasonList.length > 0) {
      return seasonList.map((seasonItem: any, index: number) => {
        const seasonNumber = toSafeNumber(
          seasonItem?.season ?? seasonItem?.seasonNumber ?? seasonItem?.seasonIndex ?? seasonItem?.id,
          index + 1,
        );
        const episodeList = seasonItem?.episodes || seasonItem?.episodeList || seasonItem?.episode || [];
        const episodes = Array.isArray(episodeList)
          ? episodeList.map((ep: any, epIndex: number) => ({
              episode: toSafeNumber(ep?.episode ?? ep?.episodeNumber ?? ep?.index, epIndex + 1),
              title: ep?.title || ep?.name,
            }))
          : [];
        return {
          season: seasonNumber,
          episodes: episodes.length > 0 ? episodes : [{ episode: 1 }],
        };
      });
    }
    return [{ season: 0, episodes: [{ episode: 0, title: detail?.title }] }];
  };

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      const detail = await fetchMovieBoxDetail(id);
      setMovie(detail);
      setSeasons(detail ? normalizeSeasons(detail) : []);
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Movie not found</div>
      </div>
    );
  }

  const subjectId = movie.subjectId || movie.id;
  const cover = movie.coverHorizontalUrl || movie.coverVerticalUrl || movie.poster;
  const genreList = Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genres === 'string'
    ? movie.genres.split(',').map((genre) => genre.trim()).filter(Boolean)
    : typeof movie.category === 'string'
    ? movie.category.split(',').map((genre) => genre.trim()).filter(Boolean)
    : [];
  const directorText = Array.isArray(movie.director) ? movie.director.join(', ') : movie.director;
  const castText = Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast;
  const firstSeason = seasons[0]?.season ?? 0;
  const firstEpisode = seasons[0]?.episodes?.[0]?.episode ?? 0;

  return (
    <div className="min-h-screen">
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        <img
          src={cover || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {movie.rating && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star size={24} fill="currentColor" />
                  <span className="text-2xl font-bold">{movie.rating}</span>
                </div>
              )}
              {movie.year && (
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={20} />
                  <span>{movie.year}</span>
                </div>
              )}
              {genreList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genreList.slice(0, 3).map((genre) => (
                    <span key={genre} className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <span className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm uppercase">moviebox</span>
            </div>
            <Link
              to={`/watch/${subjectId}?source=moviebox&season=${firstSeason}&episode=${firstEpisode}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition text-lg"
            >
              <Play size={24} fill="currentColor" />
              Watch Now
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-12 lg:px-16 py-12">
        {movie.description && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <p className="text-white/80 leading-relaxed">{movie.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {directorText && (
            <div className="flex items-start gap-3">
              <Clapperboard size={20} className="text-white/60 mt-1" />
              <div>
                <h3 className="text-white/60 mb-2">Director</h3>
                <p className="text-white font-semibold">{directorText}</p>
              </div>
            </div>
          )}
          {castText && (
            <div className="flex items-start gap-3">
              <Users size={20} className="text-white/60 mt-1" />
              <div>
                <h3 className="text-white/60 mb-2">Cast</h3>
                <p className="text-white font-semibold">{castText}</p>
              </div>
            </div>
          )}
          {movie.duration && (
            <div className="flex items-start gap-3">
              <Film size={20} className="text-white/60 mt-1" />
              <div>
                <h3 className="text-white/60 mb-2">Duration</h3>
                <p className="text-white font-semibold">{movie.duration}</p>
              </div>
            </div>
          )}
        </div>

        {seasons.length > 0 && (
          <div className="space-y-8">
            {seasons.map((season) => (
              <div key={`season-${season.season}`}>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {season.season > 0 ? `Season ${season.season}` : 'Movie'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {season.episodes.map((episode) => (
                    <Link
                      key={`season-${season.season}-ep-${episode.episode}`}
                      to={`/watch/${subjectId}?source=moviebox&season=${season.season}&episode=${episode.episode}`}
                      className="bg-white/10 hover:bg-blue-600 text-white p-4 rounded-lg text-center font-semibold transition"
                    >
                      {season.season > 0 ? `EP ${episode.episode}` : 'Play'}
                      {episode.title && <div className="text-sm text-white/70 mt-1">{episode.title}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
