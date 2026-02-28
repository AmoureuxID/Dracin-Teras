import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  fetchAnimeOngoing, 
  fetchAnimeCompleted,
  fetchAnimeSchedule,
  fetchAnimeList,
  fetchAnimeGenres,
  fetchAnimeByGenre,
  Anime 
} from '../utils/api';
import { Play, Star, Calendar, List, Filter, Clock } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type AnimeTab = 'ongoing' | 'completed' | 'schedule' | 'list' | 'genre';

interface Genre {
  id?: string;
  name: string;
  slug: string;
  endpoint?: string;
}

export function AnimePage() {
  const [animeData, setAnimeData] = useState<Anime[]>([]);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [animeListData, setAnimeListData] = useState<any>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnimeTab>('ongoing');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, selectedGenre]);

  useEffect(() => {
    // Reset page when switching tabs
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    // Load genres when tab is genre
    if (activeTab === 'genre' && genres.length === 0) {
      loadGenres();
    }
  }, [activeTab]);

  const loadGenres = async () => {
    const response = await fetchAnimeGenres();
    console.log('Genres response:', response);
    
    // response sudah berupa array genreList langsung dari API
    let processedGenres: Genre[] = [];
    
    if (Array.isArray(response)) {
      processedGenres = response.map((item: any) => ({
        id: item.genreId || item.id || item.slug,
        name: item.title || item.name || item.genre_name,
        slug: item.genreId || item.slug || item.id,
        endpoint: item.endpoint || item.href
      }));
    }
    
    setGenres(processedGenres);
    if (processedGenres.length > 0 && !selectedGenre) {
      setSelectedGenre(processedGenres[0].slug);
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    try {
      if (activeTab === 'ongoing') {
        const data = await fetchAnimeOngoing(currentPage);
        console.log('Ongoing response:', data);
        setAnimeData(Array.isArray(data) ? data : []);
      } else if (activeTab === 'completed') {
        const data = await fetchAnimeCompleted(currentPage);
        console.log('Completed response:', data);
        setAnimeData(Array.isArray(data) ? data : []);
      } else if (activeTab === 'schedule') {
        const data = await fetchAnimeSchedule();
        console.log('Schedule response:', data);
        setScheduleData(data);
      } else if (activeTab === 'list') {
        const data = await fetchAnimeList();
        console.log('List response:', data);
        setAnimeListData(data);
      } else if (activeTab === 'genre' && selectedGenre) {
        const data = await fetchAnimeByGenre(selectedGenre, currentPage);
        console.log('Genre response:', data);
        setAnimeData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading anime:', error);
    }
    
    setLoading(false);
  };

  const handleTabChange = (tab: AnimeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleGenreChange = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    setCurrentPage(1);
  };

  const showPagination = ['ongoing', 'completed', 'genre'].includes(activeTab);

  // Render anime card
  const renderAnimeCard = (anime: any, compact: boolean = false) => {
    // Adaptasi untuk berbagai field name dari API
    const animeId = anime.animeId || anime.id || anime.slug;
    const animeSlug = anime.animeId || anime.slug || anime.id;
    const animeTitle = anime.title;
    const animeImage = anime.poster || anime.thumbnail || anime.cover;
    const animeType = anime.type;
    const animeScore = anime.score || anime.rating;
    const animeStatus = anime.status;
    const animeEpisode = anime.episode;
    
    if (compact) {
      return (
        <Link
          to={`/anime/${animeSlug}`}
          className="group"
        >
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            {animeImage ? (
              <img
                src={animeImage}
                alt={animeTitle}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {animeEpisode && (
              <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded text-xs font-semibold">
                {animeEpisode}
              </div>
            )}

            {animeScore && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{animeScore}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs line-clamp-2 group-hover:text-purple-400 transition-colors">
            {animeTitle}
          </p>
        </Link>
      );
    }

    return (
      <Link
        to={`/anime/${animeSlug}`}
        className="group"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          {animeImage ? (
            <img
              src={animeImage}
              alt={animeTitle}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Episode Badge */}
          {animeEpisode && (
            <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded text-xs font-semibold">
              {animeEpisode}
            </div>
          )}

          {/* Status Badge */}
          {animeStatus && (
            <div className="absolute top-2 right-2 bg-blue-600 px-2 py-1 rounded text-xs font-semibold">
              {animeStatus}
            </div>
          )}

          {/* Rating */}
          {animeScore && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{animeScore}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
            {animeTitle}
          </h3>
          {animeType && (
            <p className="text-xs text-gray-400 mt-1">{animeType}</p>
          )}
        </div>
      </Link>
    );
  };

  // Render schedule section
  const renderSchedule = () => {
    if (!scheduleData) {
      return (
        <div className="text-center text-gray-400 py-12">
          Tidak ada jadwal tersedia
        </div>
      );
    }

    // Handle if scheduleData.days is an array (sesuai dokumentasi: data.days)
    if (Array.isArray(scheduleData)) {
      return (
        <div className="space-y-8">
          {scheduleData.map((item: any, index: number) => {
            const day = item.day || item.hari || item.name || `Day ${index + 1}`;
            const animeList = item.anime || item.animeList || item.list || [];
            
            if (!Array.isArray(animeList) || animeList.length === 0) return null;

            return (
              <div key={index} className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-400 capitalize flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {day}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {animeList.map((anime: Anime, animeIdx: number) => (
                    <div key={anime.animeId || anime.id || anime.slug || `schedule-obj-${day}-${animeIdx}`}>
                      {renderAnimeCard(anime, true)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // Render anime list (A-Z)
  const renderAnimeList = () => {
    if (!animeListData) {
      return (
        <div className="text-center text-gray-400 py-12">
          Tidak ada data tersedia
        </div>
      );
    }

    // animeListData adalah array dengan struktur: [{ startWith: "#", animeList: [...] }, ...]
    if (Array.isArray(animeListData)) {
      // Check jika array berisi objek dengan startWith dan animeList
      const hasGroupStructure = animeListData.length > 0 && 
        animeListData[0].startWith !== undefined && 
        animeListData[0].animeList !== undefined;

      if (hasGroupStructure) {
        // Format yang benar dari API: array of { startWith, animeList }
        const letters = animeListData
          .map((group: any) => group.startWith)
          .filter((letter: string) => letter);

        return (
          <div className="space-y-8">
            {animeListData.map((group: any, index: number) => {
              const letter = group.startWith;
              const animeList = group.animeList || [];
              
              if (!Array.isArray(animeList) || animeList.length === 0) return null;

              return (
                <div key={index} id={letter} className="scroll-mt-20">
                  <div className="sticky top-16 z-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded px-4 py-1.5 mb-3 shadow-md">
                    <h2 className="text-xl font-bold">{letter}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {animeList.map((anime: any) => (
                      <Link
                        key={anime.animeId || anime.id}
                        to={`/anime/${anime.animeId || anime.slug || anime.id}`}
                        className="flex gap-4 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all group"
                      >
                        <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                          {anime.poster || anime.thumbnail || anime.cover ? (
                            <img
                              src={anime.poster || anime.thumbnail || anime.cover}
                              alt={anime.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                            {anime.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                            {anime.type && <span>{anime.type}</span>}
                            {anime.status && <span>• {anime.status}</span>}
                            {(anime.score || anime.rating) && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {anime.score || anime.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* A-Z Quick Navigation */}
            {letters.length > 0 && (
              <div className="fixed right-2 top-1/2 -translate-y-1/2 bg-gray-800/90 rounded-lg p-1 shadow-lg hidden lg:block z-20">
                <div className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto scrollbar-thin">
                  {letters.map((letter: string) => (
                    <a
                      key={letter}
                      href={`#${letter}`}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-purple-600 transition-colors text-[10px] font-bold"
                    >
                      {letter}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Fallback: jika array berisi anime langsung (format lama)
      const letters = [...new Set(animeListData.map((anime: any) => 
        (anime.title || '').charAt(0).toUpperCase()
      ))].sort();

      return (
        <div className="space-y-8">
          {letters.map((letter) => {
            const animeInLetter = animeListData.filter((anime: any) =>
              (anime.title || '').charAt(0).toUpperCase() === letter
            );

            if (animeInLetter.length === 0) return null;

            return (
              <div key={letter} id={letter} className="scroll-mt-20">
                <div className="sticky top-16 z-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg px-6 py-3 mb-4 shadow-lg">
                  <h2 className="text-3xl font-bold">{letter}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animeInLetter.map((anime: any) => (
                    <Link
                      key={anime.id}
                      to={`/anime/${anime.slug || anime.id}`}
                      className="flex gap-4 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all group"
                    >
                      <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={anime.thumbnail || anime.cover}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                          {anime.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                          {anime.type && <span>{anime.type}</span>}
                          {anime.status && <span>• {anime.status}</span>}
                          {anime.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {anime.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* A-Z Quick Navigation */}
          <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-gray-800/90 rounded-lg p-2 shadow-lg hidden lg:block">
            <div className="flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-purple-600 transition-colors text-xs font-semibold"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">Anime</h1>
            <p className="text-xl text-gray-300">Jelajahi koleksi anime terbaik dari Samehadaku</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b border-gray-700 pb-2">
          <button
            onClick={() => handleTabChange('ongoing')}
            className={`pb-3 px-4 md:px-6 text-sm md:text-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'ongoing'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            Ongoing
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={`pb-3 px-4 md:px-6 text-sm md:text-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            Completed
          </button>
          <button
            onClick={() => handleTabChange('schedule')}
            className={`pb-3 px-4 md:px-6 text-sm md:text-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal
          </button>
          <button
            onClick={() => handleTabChange('list')}
            className={`pb-3 px-4 md:px-6 text-sm md:text-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'list'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            Anime List
          </button>
          <button
            onClick={() => handleTabChange('genre')}
            className={`pb-3 px-4 md:px-6 text-sm md:text-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'genre'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Genre
          </button>
        </div>

        {/* Genre Selector */}
        {activeTab === 'genre' && genres.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <label className="text-lg font-semibold text-white">Pilih Genre:</label>
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Pilih genre..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {genres.map((genre) => (
                    <SelectItem 
                      key={genre.slug} 
                      value={genre.slug}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
                    >
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {/* Anime Grid for Ongoing, Completed, Genre */}
            {['ongoing', 'completed', 'genre'].includes(activeTab) && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {animeData.map((anime, idx) => (
                  <div key={anime.animeId || anime.id || anime.slug || `anime-${idx}`}>
                    {renderAnimeCard(anime)}
                  </div>
                ))}
              </div>
            )}

            {/* Schedule View */}
            {activeTab === 'schedule' && renderSchedule()}

            {/* Anime List View (A-Z) */}
            {activeTab === 'list' && renderAnimeList()}
          </>
        )}

        {/* Pagination */}
        {showPagination && animeData.length > 0 && (
          <div className="flex justify-center mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
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
                
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {currentPage + 2}
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
                      setCurrentPage((prev) => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
