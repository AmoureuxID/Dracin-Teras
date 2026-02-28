import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { 
  fetchDramaBoxVIP, 
  fetchDramaBoxTrending, 
  fetchAnimeOngoing,
  fetchKomikPopuler,
  fetchMovieBoxTrending,
  type Drama,
  type Anime,
  type Komik,
  type Movie
} from '../utils/api';

export function HomePage() {
  const [heroItems, setHeroItems] = useState<Drama[]>([]);
  const [dramaItems, setDramaItems] = useState<Drama[]>([]);
  const [animeItems, setAnimeItems] = useState<Anime[]>([]);
  const [komikItems, setKomikItems] = useState<Komik[]>([]);
  const [movieItems, setMovieItems] = useState<Movie[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [vip, trending, anime, komik, movies] = await Promise.all([
      fetchDramaBoxVIP(),
      fetchDramaBoxTrending(),
      fetchAnimeOngoing(1),
      fetchKomikPopuler(1),
      fetchMovieBoxTrending(0),
    ]);
    
    setHeroItems(vip.slice(0, 5));
    setDramaItems(trending.slice(0, 12));
    setAnimeItems(anime.slice(0, 12));
    setKomikItems(komik.slice(0, 12));
    setMovieItems(movies.slice(0, 12));
    setLoading(false);
  };

  const nextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % heroItems.length);
  };

  const prevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
  };

  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(nextHero, 5000);
    return () => clearInterval(interval);
  }, [heroItems.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const currentHero = heroItems[currentHeroIndex];

  return (
    <div className="pb-12">
      {/* Hero Carousel */}
      {currentHero && (
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <img
            src={currentHero.coverHorizontalUrl || currentHero.coverVerticalUrl}
            alt={currentHero.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {currentHero.title}
              </h1>
              {currentHero.introduction && (
                <p className="text-white/90 text-lg mb-6 line-clamp-3">
                  {currentHero.introduction}
                </p>
              )}
              <div className="flex items-center gap-4 mb-6">
                {currentHero.category && (
                  <span key="category" className="text-white/80">{currentHero.category}</span>
                )}
                {currentHero.year && (
                  <span key="year" className="text-white/80">• {currentHero.year}</span>
                )}
                {currentHero.score && (
                  <span key="score" className="flex items-center gap-1 text-white/80">
                    • <Star size={16} fill="currentColor" /> {currentHero.score}
                  </span>
                )}
              </div>
              <Link
                to={`/detail/${currentHero.id}`}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </Link>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevHero}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextHero}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
          >
            <ChevronRight size={32} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroItems.map((item, index) => (
              <button
                key={`hero-indicator-${item.id}-${index}`}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentHeroIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drama China Section */}
      <section className="mt-12 px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Trending Drama China</h2>
          <Link to="/drama" className="text-orange-500 hover:text-orange-400 transition">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {dramaItems.map((item) => (
            <Link
              key={item.id}
              to={`/detail/${item.id}`}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden"
            >
              <img
                src={item.coverVerticalUrl}
                alt={item.title}
                className="w-full h-full object-cover transition group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {item.title}
                </h3>
                {item.score && (
                  <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs">{item.score}</span>
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                DRAMA
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Movies Section */}
      <section className="mt-12 px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Trending Movies</h2>
          <Link to="/movie" className="text-blue-500 hover:text-blue-400 transition">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movieItems.map((item) => (
            <Link
              key={item.id}
              to={`/movie/${item.subjectId || item.id}`}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden"
            >
              <img
                src={item.coverVerticalUrl || item.poster}
                alt={item.title}
                className="w-full h-full object-cover transition group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {item.title}
                </h3>
                {item.rating && (
                  <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs">{item.rating}</span>
                  </div>
                )}
              </div>
              {item.category && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {item.category}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Anime Section */}
      <section className="mt-12 px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Ongoing Anime</h2>
          <Link to="/anime" className="text-purple-500 hover:text-purple-400 transition">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeItems.map((item) => (
            <Link
              key={item.id}
              to={`/anime/${item.slug || item.id}`}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden"
            >
              <img
                src={item.thumbnail || item.cover}
                alt={item.title}
                className="w-full h-full object-cover transition group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {item.title}
                </h3>
                {item.rating && (
                  <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs">{item.rating}</span>
                  </div>
                )}
              </div>
              {item.episode && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  {item.episode}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Komik Section */}
      <section className="mt-12 px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Popular Komik</h2>
          <Link to="/komik" className="text-red-500 hover:text-red-400 transition">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {komikItems.map((item) => (
            <Link
              key={item.id}
              to={`/komik/${item.slug || item.id}`}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden"
            >
              <img
                src={item.thumbnail || item.cover}
                alt={item.title}
                className="w-full h-full object-cover transition group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                <h3 className="text-white font-semibold text-sm line-clamp-2">
                  {item.title}
                </h3>
                {item.rating && (
                  <div className="flex items-center gap-1 text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs">{item.rating}</span>
                  </div>
                )}
              </div>
              {item.chapter && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  {item.chapter}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
