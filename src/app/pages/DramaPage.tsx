import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, TrendingUp, Clock, Sparkles, Flame, Gift } from 'lucide-react';
import {
  fetchDramaBoxTrending,
  fetchDramaBoxLatest,
  fetchDramaBoxForYou,
  fetchReelShortHomepage,
  fetchMeloloLatest,
  fetchMeloloTrending,
  fetchFlickReelsForYou,
  fetchFlickReelsLatest,
  fetchFlickReelsHotRank,
  fetchFreeReelsForYou,
  fetchFreeReelsHome,
  fetchNetShortTheaters,
  type Drama,
} from '../utils/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

type Provider = 'dramabox' | 'reelshort' | 'melolo' | 'flickreels' | 'freereels' | 'netshort';

type DramaCategory = 'trending' | 'latest' | 'foryou' | 'homepage' | 'hotrank' | 'theaters';

export function DramaPage() {
  const [activeProvider, setActiveProvider] = useState<Provider>('dramabox');
  const [activeCategory, setActiveCategory] = useState<DramaCategory>('trending');
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const providers = [
    { id: 'dramabox', name: 'DramaBox', icon: <Sparkles size={18} />, color: 'orange' },
    { id: 'reelshort', name: 'ReelShort', icon: <Flame size={18} />, color: 'red' },
    { id: 'melolo', name: 'Melolo', icon: <Star size={18} />, color: 'yellow' },
    { id: 'flickreels', name: 'FlickReels', icon: <TrendingUp size={18} />, color: 'blue' },
    { id: 'freereels', name: 'FreeReels', icon: <Gift size={18} />, color: 'green' },
    { id: 'netshort', name: 'NetShort', icon: <Clock size={18} />, color: 'purple' },
  ];

  const getCategoriesForProvider = (provider: Provider): DramaCategory[] => {
    switch (provider) {
      case 'dramabox':
        return ['trending', 'latest', 'foryou'];
      case 'reelshort':
        return ['homepage'];
      case 'melolo':
        return ['trending', 'latest'];
      case 'flickreels':
        return ['foryou', 'latest', 'hotrank'];
      case 'freereels':
        return ['foryou', 'homepage'];
      case 'netshort':
        return ['theaters'];
      default:
        return ['trending'];
    }
  };

  useEffect(() => {
    loadDramas();
  }, [activeProvider, activeCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [activeProvider, activeCategory]);

  const supportsPagination = (provider: Provider, category: DramaCategory) => {
    if (provider === 'dramabox') return ['trending', 'latest', 'foryou'].includes(category);
    if (provider === 'melolo') return ['trending', 'latest'].includes(category);
    if (provider === 'flickreels') return ['foryou', 'latest'].includes(category);
    if (provider === 'freereels') return ['foryou', 'homepage'].includes(category);
    return false;
  };

  const loadDramas = async () => {
    setLoading(true);
    try {
      let data: any = [];

      switch (activeProvider) {
        case 'dramabox':
          if (activeCategory === 'trending') data = await fetchDramaBoxTrending(page);
          else if (activeCategory === 'latest') data = await fetchDramaBoxLatest(page);
          else if (activeCategory === 'foryou') data = await fetchDramaBoxForYou(page);
          break;

        case 'reelshort':
          const reelshortData = await fetchReelShortHomepage();
          data = reelshortData.dramas || reelshortData.data || [];
          break;

        case 'melolo':
          if (activeCategory === 'trending') data = await fetchMeloloTrending(page);
          else if (activeCategory === 'latest') data = await fetchMeloloLatest(page);
          break;

        case 'flickreels':
          if (activeCategory === 'foryou') data = await fetchFlickReelsForYou(page);
          else if (activeCategory === 'latest') data = await fetchFlickReelsLatest(page);
          else if (activeCategory === 'hotrank') data = await fetchFlickReelsHotRank();
          break;

        case 'freereels':
          if (activeCategory === 'foryou') data = await fetchFreeReelsForYou(page);
          else if (activeCategory === 'homepage') {
            const freeReelsData = await fetchFreeReelsHome(page);
            data = freeReelsData.dramas || freeReelsData.data || [];
          }
          break;

        case 'netshort':
          data = await fetchNetShortTheaters();
          break;

        default:
          data = await fetchDramaBoxTrending(page);
      }

      setDramas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading dramas:', error);
      setDramas([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: DramaCategory): string => {
    const labels: Record<DramaCategory, string> = {
      trending: 'Trending',
      latest: 'Latest',
      foryou: 'For You',
      homepage: 'Homepage',
      hotrank: 'Hot Rank',
      theaters: 'Theaters',
    };
    return labels[category];
  };

  const canPaginate = supportsPagination(activeProvider, activeCategory);

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Drama China</h1>
        <p className="text-white/70">
          Explore dramas from multiple platforms - DramaBox, ReelShort, Melolo, FlickReels, FreeReels, and NetShort
        </p>
      </div>

      {/* Provider Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                setActiveProvider(provider.id as Provider);
                setActiveCategory(getCategoriesForProvider(provider.id as Provider)[0]);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                activeProvider === provider.id
                  ? `bg-${provider.color}-600 text-white shadow-lg`
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {provider.icon}
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {getCategoriesForProvider(activeProvider).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-white text-xl py-12">
          Loading dramas...
        </div>
      )}

      {/* Empty State */}
      {!loading && dramas.length === 0 && (
        <div className="text-center text-white/70 py-12">
          <p className="text-xl mb-2">No dramas found</p>
          <p className="text-sm">Try selecting a different category</p>
        </div>
      )}

      {/* Drama Grid */}
      {!loading && dramas.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {dramas.map((drama, index) => (
              <Link
                key={`${drama.id || drama.bookId}-${index}`}
                to={`/detail/${drama.id || drama.bookId}?source=${activeProvider}`}
                className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5"
              >
                <img
                  src={drama.coverVerticalUrl || drama.coverHorizontalUrl || 'https://via.placeholder.com/300x450'}
                  alt={drama.title}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {drama.title}
                  </h3>
                  {drama.score && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs">{drama.score}</span>
                    </div>
                  )}
                  {drama.category && (
                    <div className="text-white/70 text-xs mt-1">{drama.category}</div>
                  )}
                </div>
                <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded uppercase">
                  {activeProvider}
                </div>
              </Link>
            ))}
          </div>
          {canPaginate && (
            <div className="flex justify-center mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {page > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(page - 1);
                        }}
                      >
                        {page - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      {page}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(page + 1);
                      }}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
