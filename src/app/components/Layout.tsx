import { Link, Outlet, useNavigate } from 'react-router';
import { Search, Home, Film, Tv, Menu, Clapperboard, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

const logoUrl = new URL('../../logo-td.svg', import.meta.url).href;

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const existing = document.querySelector('link[data-fonts="teras-dracin"]');
    if (existing) return;

    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    preconnectGoogle.setAttribute('data-fonts', 'teras-dracin');

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = '';
    preconnectGstatic.setAttribute('data-fonts', 'teras-dracin');

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    stylesheet.setAttribute('data-fonts', 'teras-dracin');

    document.head.append(preconnectGoogle, preconnectGstatic, stylesheet);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav
        className={`backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-black/90' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2 group" aria-label="Beranda Teras Dracin">
              <img
                src={logoUrl}
                alt="Teras Dracin"
                className="w-6 h-6 group-hover:scale-110 transition-transform"
              />
              <span className="font-display text-xl font-bold tracking-tighter text-red-600">
                TERAS DRACIN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/" className="text-white/80 hover:text-red-600 transition flex items-center gap-2 text-sm">
                <Home size={18} />
                Home
              </Link>
              <Link to="/drama" className="text-white/80 hover:text-red-600 transition flex items-center gap-2 text-sm">
                <Tv size={18} />
                Drama
              </Link>
              <Link to="/movie" className="text-white/80 hover:text-red-600 transition flex items-center gap-2 text-sm">
                <Film size={18} />
                Movie
              </Link>
              <Link to="/anime" className="text-white/80 hover:text-red-600 transition flex items-center gap-2 text-sm">
                <Clapperboard size={18} />
                Anime
              </Link>
              <Link to="/komik" className="text-white/80 hover:text-red-600 transition flex items-center gap-2 text-sm">
                <BookOpen size={18} />
                Komik
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a show"
                  className="bg-white/10 text-white placeholder:text-white/50 px-4 py-1.5 pl-10 rounded-full border border-white/20 focus:outline-none focus:border-red-600 w-56 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
              </div>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white p-1.5"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-3 space-y-3">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-red-600 transition"
              >
                Home
              </Link>
              <Link
                to="/drama"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-red-600 transition"
              >
                Drama
              </Link>
              <Link
                to="/movie"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-red-600 transition"
              >
                Movie
              </Link>
              <Link
                to="/anime"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-red-600 transition"
              >
                Anime
              </Link>
              <Link
                to="/komik"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-red-600 transition"
              >
                Komik
              </Link>
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a show"
                    className="w-full bg-white/10 text-white placeholder:text-white/50 px-4 py-1.5 pl-10 rounded-full border border-white/20 focus:outline-none focus:border-red-600 text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
