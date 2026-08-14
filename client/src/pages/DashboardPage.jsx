import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Star, Sparkles, MapPin, Search, Utensils, Scissors, BookOpen, Gift, Sprout } from 'lucide-react';


export default function DashboardPage() {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';

  return (
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
                  {isProvider ? 'Skill Provider' : 'Customer'}
                </span>
              </div>
              <p className="text-slate-600 text-base font-normal">
                {isProvider
                  ? 'You have 5 local opportunities matching your traditional expertise.'
                  : 'Discover trusted traditional services and homemade goods near you.'}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Phone Verified
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#16382B]" /> {user?.location?.city || 'Chennai'}
                </span>
                <span className="inline-flex items-center gap-1 text-[#C07A46]">
                  <Star className="w-4 h-4 fill-current text-[#C07A46]" /> {user?.rating || 4.8}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#E6ECE7] px-5 py-3 rounded-2xl border border-[#D2DDD5] text-center md:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#C86D51] block">Platform Status</span>
            <span className="text-sm font-semibold text-[#16382B]">Phase 1 Active</span>
          </div>
        </div>

        {/* ROLE-SPECIFIC DASHBOARD CONTENT */}
        {isProvider ? (
          /* PROVIDER DASHBOARD */
          <div className="space-y-8">
            
            {/* Minimal Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Profile Status', value: '80%', sub: 'Ready for skills' },
                { label: 'Opportunities', value: '5', sub: 'Matched nearby' },
                { label: 'Active Services', value: '0', sub: 'Phase 3' },
                { label: 'Products', value: '0', sub: 'Phase 3' },
                { label: 'Pending Requests', value: '0', sub: 'Phase 4' },
                { label: 'Rating', value: '⭐ 4.8', sub: 'Trusted Status' },
              ].map((m, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E2E7E3] text-center shadow-2xs">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                  <p className="font-editorial text-2xl font-bold text-[#16382B] mt-1">{m.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Next Feature Banner */}
            <div className="bg-[#E6ECE7] p-8 rounded-3xl border border-[#D2DDD5] space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-xs font-bold text-[#C86D51] tracking-widest uppercase block mb-1">
                    Next Step on Your Journey
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">
                    Share your experience with AI-assisted voice onboarding
                  </h2>
                  <p className="text-slate-700 text-sm mt-1 max-w-2xl">
                    In the next phase, you can simply speak or type naturally about your tailoring, cooking, or teaching background to generate your professional profile.
                  </p>
                </div>

                <div className="bg-white px-5 py-3 rounded-2xl border border-[#CBD8CE] text-center shrink-0">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">Upcoming</span>
                  <span className="font-bold text-[#16382B] text-sm">Phase 2: Skill Profile</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* CUSTOMER DASHBOARD */
          <div className="space-y-8">
            
            {/* Search Prompt Box */}
            <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] space-y-4">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">
                What service are you looking for today?
              </h2>
              <p className="text-slate-600 text-base">
                Find trusted home cooks, language tutors, blouse tailors, and handmade crafts in {user?.location?.city || 'Chennai'}.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    disabled
                    placeholder="Search traditional skills, tutors, or homemade goods..."
                    className="input-editorial pl-12 cursor-not-allowed opacity-75"
                  />
                </div>
                <button
                  disabled
                  className="btn-primary py-3.5 px-6 opacity-60 cursor-not-allowed text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Popular Service Categories */}
            <div className="bg-[#E6ECE7]/60 p-6 rounded-3xl border border-[#D2DDD5]">
              <h3 className="font-editorial text-xl font-bold text-[#16382B] mb-4">
                Recommended Local Categories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { icon: Scissors, name: 'Tailoring', count: '12 Providers' },
                  { icon: Utensils, name: 'Homemade Food', count: '18 Providers' },
                  { icon: BookOpen, name: 'Home Tutors', count: '9 Providers' },
                  { icon: Gift, name: 'Handicrafts', count: '15 Products' },
                  { icon: Sprout, name: 'Gardening', count: '7 Providers' }
                ].map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-[#E2E7E3] text-center">
                    <c.icon className="w-5 h-5 text-[#16382B] mx-auto mb-2" />
                    <p className="font-bold text-[#16382B] text-sm">{c.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{c.count}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
