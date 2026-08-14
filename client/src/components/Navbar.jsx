import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#FBF9F4]/90 backdrop-blur-md border-b border-[#E2E7E3] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#16382B] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#16382B] flex items-center gap-1.5">
                SilverHands
              </span>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Skills that matter. Opportunities that grow.
              </p>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-[#16382B] transition-colors">
              Home
            </Link>
            <a href="#how-it-works" className="hover:text-[#16382B] transition-colors">
              How It Works
            </a>
            <a href="#explore" className="hover:text-[#16382B] transition-colors">
              Explore
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#E6ECE7] hover:bg-[#D8E3DA] text-[#16382B] font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-[#D2DDD5]"
                >
                  <User className="w-4 h-4 text-[#16382B]" />
                  <span>Dashboard</span>
                  <span className="text-[11px] bg-white text-[#16382B] px-2 py-0.5 rounded-full font-bold uppercase border border-[#CBD8CE]">
                    {user?.role === 'provider' ? 'Provider' : 'Customer'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-slate-900 font-medium text-sm px-2 py-2 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-[#16382B] font-semibold text-sm px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2.5 px-5 shadow-sm"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
