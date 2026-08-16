import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Menu, X, LogOut, User, Compass, Briefcase, Package, LayoutDashboard, FileText, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isProvider = user?.role === 'provider';

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-[#E2E7E3] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#16382B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#16382B] block leading-none">
                SilverHands
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#C86D51] uppercase block mt-1">
                Digital Livelihood
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 transition-colors ${
                location.pathname.startsWith('/explore') ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#16382B]" />
              <span>Explore</span>
            </Link>

            {isAuthenticated ? (
              <>
                {isProvider ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname === '/dashboard' ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/provider/services"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/provider/services') ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>My Services</span>
                    </Link>
                    <Link
                      to="/provider/products"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/provider/products') ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>My Products</span>
                    </Link>
                    <Link
                      to="/opportunities"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/opportunities') ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Opportunities</span>
                    </Link>
                    <Link
                      to="/applications/my"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/applications') && location.pathname !== '/applications/accepted' ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>My Applications</span>
                    </Link>
                    <Link
                      to="/applications/accepted"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname === '/applications/accepted' ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>My Accepted Services</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/explore?tab=services" className="hover:text-[#16382B]">Services</Link>
                    <Link to="/explore?tab=products" className="hover:text-[#16382B]">Products</Link>
                    <Link to="/explore?tab=providers" className="hover:text-[#16382B]">Providers</Link>
                    <Link
                      to="/opportunities"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/opportunities') && location.pathname !== '/opportunities/my' ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Opportunities</span>
                    </Link>
                    <Link
                      to="/opportunities/my"
                      className={`flex items-center gap-1.5 transition-colors ${
                        location.pathname === '/opportunities/my' ? 'text-[#16382B] font-bold' : 'hover:text-[#16382B]'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>My Posts</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-[#E2E7E3]">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#16382B]"
                    />
                    <div className="text-left text-xs">
                      <span className="font-bold text-[#16382B] block">{user?.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {isProvider ? 'Skill Provider' : 'Customer'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-xs py-2 px-4">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4 shadow-xs">
                  Join SilverHands
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 rounded-xl hover:bg-[#FBF9F4]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E7E3] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-[#16382B]"
          >
            🔍 Explore Marketplace
          </Link>

          {isAuthenticated ? (
            <>
              {isProvider ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Dashboard</Link>
                  <Link to="/provider/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">My Services</Link>
                  <Link to="/provider/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">My Products</Link>
                  <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Opportunities</Link>
                  <Link to="/applications/my" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">My Applications</Link>
                  <Link to="/applications/accepted" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">My Accepted Services</Link>
                  {user?._id && (
                    <Link to={`/providers/${user._id}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-[#C86D51]">View My Public Profile</Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/explore?tab=services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Services</Link>
                  <Link to="/explore?tab=products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Products</Link>
                  <Link to="/explore?tab=providers" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Providers</Link>
                  <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Opportunities</Link>
                  <Link to="/opportunities/my" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">My Posts</Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm font-semibold text-red-700 pt-2 border-t border-[#E2E7E3]"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2 border-t border-[#E2E7E3]">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block btn-secondary text-center py-2 text-xs">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block btn-primary text-center py-2 text-xs">Join SilverHands</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
