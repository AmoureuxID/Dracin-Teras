import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchDramas, searchAnime, searchKomik, searchMovieBox, type Drama, type Anime, type Komik, type Movie } from '../utils/api';

type SearchResult = Drama | Anime | Komik | Movie;

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'drama' | 'movie' | 'anime' | 'komik'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (query) {
      setCurrentPage(1);
      performSearch(query, 1);
    }
  }, [query]);

  useEffect(() => {
    if (query && currentPage > 1) {
      performSearch(query, currentPage);
    }
  }, [currentPage]);

  const performSearch = async (searchQuery: string, page: number = 1) => {
    setLoading(true);
    const [dramaResults, movieResults, animeResults, komikResults] = await Promise.all([
      searchDramas(searchQuery),
      searchMovieBox(searchQuery, page),
      searchAnime(searchQuery, page),
      searchKomik(searchQuery, page),
    ]);
    
    // Combine all results with a type indicator
    const allResults = [
      ...dramaResults.map(d => ({ ...d, contentType: 'drama' as const })),
      ...movieResults.map(m => ({ ...m, contentType: 'movie' as const })),
      ...animeResults.map(a => ({ ...a, contentType: 'anime' as const })),
      ...komikResults.map(k => ({ ...k, contentType: 'komik' as const })),
    ];
    
    setResults(allResults);
    setLoading(false);
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter((r: any) => r.contentType === activeTab);

  const showPagination = ['movie', 'anime', 'komik'].includes(activeTab);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getItemLink = (item: any) => {
    if (item.contentType === 'anime') {
      return `/anime/${item.slug || item.id}`;
    } else if (item.contentType === 'komik') {
      return `/komik/${item.slug || item.id}`;
    } else if (item.contentType === 'movie') {
      return `/movie/${item.subjectId || item.id}`;
    }
    return `/detail/${item.id}`;
  };

  const getItemImage = (item: any) => {
    return item.coverVerticalUrl || item.thumbnail || item.cover || item.poster;
  };

  const getItemRating = (item: any) => {
    return item.score || item.rating;
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search size={32} className="text-orange-500" />
          <h1 className="text-3xl font-bold text-white">
            Search Results for "{query}"
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('drama')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'drama'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Drama ({results.filter((r: any) => r.contentType === 'drama').length})
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'movie'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movie ({results.filter((r: any) => r.contentType === 'movie').length})
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'anime'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Anime ({results.filter((r: any) => r.contentType === 'anime').length})
          </button>
          <button
            onClick={() => setActiveTab('komik')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'komik'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Komik ({results.filter((r: any) => r.contentType === 'komik').length})
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Searching...</div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredResults.map((item: any) => (
              <Link
                key={item.id}
                to={getItemLink(item)}
                className="group relative aspect-[2/3] rounded-lg overflow-hidden"
              >
                <img
                  src={getItemImage(item)}
                  alt={item.title}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                
                {/* Content Type Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                  item.contentType === 'anime' ? 'bg-purple-600' : 
                  item.contentType === 'komik' ? 'bg-red-600' : 
                  item.contentType === 'movie' ? 'bg-blue-600' : 'bg-orange-600'
                }`}>
                  {item.contentType.toUpperCase()}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {item.title}
                  </h3>
                  {getItemRating(item) && (
                    <div className="flex items-center gap-1 text-yellow-400 mt-1">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs">{getItemRating(item)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-center py-12">
            No results found for "{query}"
          </div>
        )}

        {showPagination && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {currentPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={filteredResults.length < 20}
              className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}