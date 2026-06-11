import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LayoutDashboard, LogOut, PlusCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsMobileMenuOpen(false);
    navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-chalk/95 backdrop-blur-sm border-b border-smoke">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="font-display font-bold text-2xl tracking-tight text-ink">
              Market<span className="text-rust">.</span>
            </span>
          </Link>

          {/* Upgraded Desktop Search Group with Sleek Rounded Pill Borders */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-1 max-w-2xl mx-8 group"
          >
            {/* Added rounded-full and overflow-hidden to cleanly clip the corners */}
            <div className="flex w-full items-center bg-white border-2 border-smoke focus-within:border-ink transition-colors duration-200 rounded-full overflow-hidden">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-5 h-5 w-5 text-steel group-focus-within:text-ink transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bikes, parts, and gear..."
                  className="w-full bg-transparent pl-14 pr-4 py-3 font-body text-ink placeholder:text-steel focus:outline-none text-base"
                />
              </div>
              {/* The right edge of the button automatically curves due to parent overflow-hidden */}
              <button 
                type="submit" 
                className="bg-ink hover:bg-rust text-white font-mono uppercase text-xs tracking-wider px-7 py-3.5 font-bold h-full border-l-2 border-transparent transition-colors duration-150"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/listings" className="font-semibold text-ink hover:text-rust transition-colors">
              Browse
            </Link>
            
            {user ? (
              <>
                <Link to="/sell" className="font-semibold text-ink hover:text-rust transition-colors">
                  Sell
                </Link>
                <div className="h-6 w-px bg-smoke"></div>
                <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-ink hover:text-rust transition-colors">
                  <LayoutDashboard className="h-4 w-4" /> {user.name}
                </Link>
                <button onClick={handleLogout} className="text-slate hover:text-rust transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-ink hover:text-rust transition-colors">
                  Log in
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="py-2 px-4 rounded-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button Trigger */}
          <div className="flex items-center md:hidden gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-ink p-2 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Complete Mobile Dropdown Panel Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-smoke bg-white shadow-xl absolute w-full left-0 z-40 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-4">
            
            {/* Mobile Rounded Search Form */}
            <form onSubmit={handleSearch} className="w-full mb-2">
              <div className="flex w-full items-center bg-chalk border-2 border-smoke focus-within:border-ink transition-colors rounded-full overflow-hidden">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-steel" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gear..."
                    className="w-full bg-transparent pl-11 pr-4 py-2.5 font-body text-ink placeholder:text-steel focus:outline-none text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-ink text-white font-mono text-xs uppercase px-5 py-3 font-bold transition-colors"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Core Navigation Links */}
            <Link 
              to="/listings" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-ink hover:bg-chalk transition-colors rounded-lg"
            >
              <ShoppingBag className="h-5 w-5 text-slate" /> Browse Marketplace
            </Link>

            {user ? (
              <>
                <Link 
                  to="/sell" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-ink hover:bg-chalk transition-colors rounded-lg"
                >
                  <PlusCircle className="h-5 w-5 text-slate" /> List an Item
                </Link>
                
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-ink hover:bg-chalk transition-colors rounded-lg"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate" /> Dashboard ({user.name})
                </Link>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-rust hover:bg-rust/5 transition-colors text-left border-t border-smoke pt-4"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </>
            ) : (
              <div className="pt-4 border-t border-smoke flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 font-semibold text-ink border-2 border-ink transition-colors rounded-full">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-ink text-white font-semibold transition-transform active:scale-98 rounded-full">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};