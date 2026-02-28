import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { fetchMovieBoxTrending, fetchMovieBoxHomepage, Movie } from '../utils/api';
import { Film, Star, Play } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

export function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadMovies();
  }, [page]);

  const loadMovies = async () => {
    setLoading(true);
    const data = await fetchMovieBoxTrending(page);
    setMovies(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Film size={80} className="mx-auto mb-4 text-blue-400" />
            <h1 className="text-6xl font-bold mb-4">Movies</h1>
            <p className="text-xl text-gray-300">Discover the latest movies and series</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Trending Movies</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.subjectId || movie.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src={movie.coverVerticalUrl || movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* Rating */}
                  {movie.rating && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{movie.rating}</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {movie.category && (
                    <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded text-xs font-semibold">
                      {movie.category}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {movie.title}
                  </h3>
                  {movie.year && (
                    <p className="text-xs text-gray-400 mt-1">{movie.year}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {movies.length > 0 && (
          <div className="flex justify-center mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 0) setPage(page - 1);
                    }}
                    className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {page > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(0);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}
                
                {page > 0 && (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(page - 1);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(page + 1);
                    }}
                  >
                    {page + 2}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(page + 2);
                    }}
                  >
                    {page + 3}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
