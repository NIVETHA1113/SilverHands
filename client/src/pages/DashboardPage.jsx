import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { calculateProfileCompletion } from '../utils/profileUtils';
import api from '../services/api';
import ProviderLivelihoodDashboardPage from './provider/ProviderLivelihoodDashboardPage';
import LocationMapModal from '../components/LocationMapModal';
import useVoiceSearch from '../hooks/useVoiceSearch';
import { ShieldCheck, Star, Sparkles, MapPin, Search, Utensils, Scissors, BookOpen, Gift, Sprout, ArrowRight, CheckCircle2, Briefcase, Package, Plus, Eye, Compass, UserCheck, Mic } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProvider = user?.role === 'provider';

  // If user is a provider, render the dedicated Provider Livelihood Dashboard
  if (isProvider) {
    return <ProviderLivelihoodDashboardPage />;
  }

  const completionPercentage = calculateProfileCompletion(user);

  const [searchQuery, setSearchQuery] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const handleVoiceResult = useCallback((text) => {
    setSearchQuery(text);
    // Trigger search immediately after voice input
    if (text.trim()) navigate(`/explore?q=${encodeURIComponent(text.trim())}`);
  }, [navigate]);

  const { listening: micListening, supported: micSupported, toggle: toggleMic } = useVoiceSearch(handleVoiceResult);

  const handleCustomerSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Editorial Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#16382B] shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                  Welcome back, {user?.name || 'Friend'} 👋
                </h1>
                <span className="badge-sage uppercase tracking-wider text-xs">
                  Customer
                </span>
              </div>
              <p className="text-slate-600 text-base font-normal">
                Discover trusted traditional services and homemade goods near you.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Phone Verified
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <button
                    onClick={() => setMapOpen(true)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#16382B] transition-colors cursor-pointer"
                    title="View on map"
                  >
                    <MapPin className="w-4 h-4 text-[#16382B]" /> {user?.location?.city || 'Chennai'}
                  </button>
                </span>
                <span className="inline-flex items-center gap-1 text-[#C07A46]">
                  <Star className="w-4 h-4 fill-current text-[#C07A46]" /> {user?.rating || 4.8}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#E6ECE7] px-5 py-3 rounded-2xl border border-[#D2DDD5] text-center md:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#C86D51] block">Account Status</span>
            <span className="font-editorial text-xl font-bold text-[#16382B]">Active Customer</span>
          </div>
        </div>

        {/* CUSTOMER DASHBOARD */}
        <div className="space-y-8">
          
          {/* Search Prompt Box */}
          <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] space-y-4">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">
              What service or product are you looking for today?
            </h2>
            <p className="text-slate-600 text-base">
              Find trusted home cooks, language tutors, blouse tailors, and handmade crafts in {user?.location?.city || 'Chennai'}.
            </p>

            <form onSubmit={handleCustomerSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <input
                  type="text"
                  placeholder="Search traditional skills, tutors, or homemade goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-editorial pl-12 pr-12"
                />
                {micSupported && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    aria-label={micListening ? 'Stop voice search' : 'Search by voice'}
                    title={micListening ? 'Listening… click to stop' : 'Search by voice'}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${micListening ? 'mic-listening text-red-500 bg-red-50' : 'text-slate-400 hover:text-[#16382B] hover:bg-[#F0F4F1]'}`}
                  >
                    {micListening && (
                      <span className="mic-ripple absolute inset-0 rounded-full bg-red-400 opacity-0" />
                    )}
                    <Mic className="w-4 h-4 relative z-10" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary py-3.5 px-6 text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Marketplace</span>
              </button>
            </form>
          </div>

          {/* Popular Service Categories */}
          <div className="bg-[#E6ECE7]/60 p-6 rounded-3xl border border-[#D2DDD5]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-editorial text-xl font-bold text-[#16382B]">
                Popular Local Categories
              </h3>
              <Link to="/explore" className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1">
                View All in Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { icon: Scissors, name: 'Tailoring', category: 'Tailoring' },
                { icon: Utensils, name: 'Homemade Food', category: 'Cooking' },
                { icon: BookOpen, name: 'Home Tutors', category: 'Tutoring' },
                { icon: Gift, name: 'Handicrafts', category: 'Handicrafts' },
                { icon: Sprout, name: 'Gardening', category: 'Gardening' }
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/explore?category=${c.category}`)}
                  className="bg-white p-4 rounded-2xl border border-[#E2E7E3] text-center hover:border-[#16382B] transition-all cursor-pointer shadow-2xs"
                >
                  <c.icon className="w-6 h-6 text-[#16382B] mx-auto mb-2" />
                  <p className="font-bold text-[#16382B] text-sm">{c.name}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>

    {mapOpen && <LocationMapModal user={user} onClose={() => setMapOpen(false)} />}
    </>
  );
}
