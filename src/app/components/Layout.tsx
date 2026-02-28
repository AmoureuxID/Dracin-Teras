import { Link, Outlet, useNavigate } from 'react-router';
import { Search, Home, Film, Tv, Menu, Clapperboard, BookOpen } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

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
      <nav className="bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Teras Dracin
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-white/80 hover:text-white transition flex items-center gap-2">
                <Home size={18} />
                Home
              </Link>
              <Link to="/drama" className="text-white/80 hover:text-white transition flex items-center gap-2">
                <Tv size={18} />
                Drama
              </Link>
              <Link to="/movie" className="text-white/80 hover:text-white transition flex items-center gap-2">
                <Film size={18} />
                Movie
              </Link>
              <Link to="/anime" className="text-white/80 hover:text-white transition flex items-center gap-2">
                <Clapperboard size={18} />
                Anime
              </Link>
              <Link to="/komik" className="text-white/80 hover:text-white transition flex items-center gap-2">
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
                  className="bg-white/10 text-white placeholder:text-white/50 px-4 py-2 pl-10 rounded-full border border-white/20 focus:outline-none focus:border-orange-500 w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              </div>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white p-2"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-white transition"
              >
                Home
              </Link>
              <Link
                to="/drama"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-white transition"
              >
                Drama
              </Link>
              <Link
                to="/movie"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-white transition"
              >
                Movie
              </Link>
              <Link
                to="/anime"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-white transition"
              >
                Anime
              </Link>
              <Link
                to="/komik"
                onClick={() => setShowMobileMenu(false)}
                className="block text-white/80 hover:text-white transition"
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
                    className="w-full bg-white/10 text-white placeholder:text-white/50 px-4 py-2 pl-10 rounded-full border border-white/20 focus:outline-none focus:border-orange-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
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