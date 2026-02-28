import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { fetchKomikTop, fetchKomikLatest, fetchKomikPopuler, Komik } from '../utils/api';
import { BookOpen, Star } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

export function KomikPage() {
  const [topKomik, setTopKomik] = useState<Komik[]>([]);
  const [latestKomik, setLatestKomik] = useState<Komik[]>([]);
  const [popularKomik, setPopularKomik] = useState<Komik[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top' | 'latest' | 'popular'>('top');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [currentPage, activeTab]);

  const loadData = async () => {
    setLoading(true);
    
    if (activeTab === 'top') {
      const top = await fetchKomikTop();
      setTopKomik(top);
    } else if (activeTab === 'latest') {
      const latest = await fetchKomikLatest(currentPage);
      setLatestKomik(latest);
    } else {
      const popular = await fetchKomikPopuler(currentPage);
      setPopularKomik(popular);
    }
    
    setLoading(false);
  };

  const handleTabChange = (tab: 'top' | 'latest' | 'popular') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const displayKomik =
    activeTab === 'top' ? topKomik : activeTab === 'latest' ? latestKomik : popularKomik;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-orange-900/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">Komik</h1>
            <p className="text-xl text-gray-300">Baca komik, manga, manhwa, dan manhua terbaru</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => handleTabChange('top')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === 'top'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Komik
          </button>
          <button
            onClick={() => handleTabChange('latest')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === 'latest'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Terbaru
          </button>
          <button
            onClick={() => handleTabChange('popular')}
            className={`pb-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === 'popular'
                ? 'text-red-400 border-b-2 border-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Populer
          </button>
        </div>

        {/* Komik Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {displayKomik.map((komik) => (
              <Link
                key={komik.id}
                to={`/komik/${komik.slug || komik.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <img
                    src={komik.thumbnail || komik.cover}
                    alt={komik.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Read Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Chapter Badge */}
                  {komik.chapter && (
                    <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-semibold">
                      {komik.chapter}
                    </div>
                  )}

                  {/* Type Badge */}
                  {komik.type && (
                    <div className="absolute top-2 right-2 bg-orange-600 px-2 py-1 rounded text-xs font-semibold">
                      {komik.type}
                    </div>
                  )}

                  {/* Rating */}
                  {komik.rating && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{komik.rating}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                    {komik.title}
                  </h3>
                  {komik.type && (
                    <p className="text-xs text-gray-400 mt-1">{komik.type}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {displayKomik.length > 0 && activeTab !== 'top' && (
          <div className="flex justify-center mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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