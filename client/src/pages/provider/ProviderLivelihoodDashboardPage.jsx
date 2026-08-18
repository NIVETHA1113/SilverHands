import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import SkillGapSection from '../../components/SkillGapSection';
import SkillPassportCard from '../../components/SkillPassportCard';
import LocationMapModal from '../../components/LocationMapModal';
import {
  Sparkles,
  Star,
  Briefcase,
  Package,
  FileText,
  Award,
  ArrowRight,
  PlusCircle,
  Clock,
  AlertCircle,
  Bot,
  UserRound,
  GraduationCap,
  Gift,
  ClipboardCheck,
  Target,
  MessageSquare
} from 'lucide-react';

export default function ProviderLivelihoodDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/providers/dashboard');
        if (res.data.success) {
          setData(res.data);
        } else {
          setError(res.data.message || 'Failed to load dashboard.');
        }
      } catch (err) {
        console.error('[Dashboard Error]:', err.message);
        setError('Unable to load livelihood dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 bg-[#FBF9F4]">
        <div className="w-12 h-12 border-4 border-[#16382B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#16382B] font-semibold text-sm">Calculating your Livelihood Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Dashboard Offline</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">{error || 'Could not fetch your statistics.'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-xs py-2.5 px-5">
          Retry
        </button>
      </div>
    );
  }

  const {
    provider,
    livelihoodScore,
    skills,
    services,
    products,
    opportunities,
    applications,
    reputation,
    growthSuggestions,
    aiSummary,
    recentActivity
  } = data;

  return (
    <>
      <div className="min-h-screen bg-[#FBF9F4] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── 1. WELCOME HEADER ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="badge-sage uppercase tracking-wider text-[10px] font-bold">Livelihood Command Center</span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B] mt-0.5">
                Welcome back, {provider.name?.split(' ')[0]}!
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Here's what needs your attention today.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/provider/services/new" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-xs">
                <PlusCircle className="w-4 h-4" /> Service
              </Link>
              <Link to="/provider/products/new" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Product
              </Link>
            </div>
          </div>

          {/* ── 2. TOP SECTION (LEFT: PASSPORT, RIGHT: COPILOT) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* LEFT: Compact Skill Passport */}
            <div className="h-full">
              <SkillPassportCard
                provider={provider}
                skills={skills}
                servicesCount={services.active}
                productsCount={products.active}
                completedCount={applications.completed}
                trust={reputation}
                aiSummary={aiSummary}
                onLocationClick={() => setMapOpen(true)}
              />
            </div>

            {/* RIGHT: SilverHands Copilot / Next Action */}
            <div className="bg-gradient-to-br from-emerald-950 via-[#16382B] to-emerald-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/80 shadow-lg flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-amber-300 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-editorial text-lg font-bold text-white block">SilverHands Copilot</span>
                      <span className="text-[10px] text-emerald-200/80 font-medium">AI Contextual Livelihood Assistant</span>
                    </div>
                  </div>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[9px] font-bold py-0.5 px-2.5 rounded-full uppercase shrink-0">
                    Active Guidance
                  </span>
                </div>

                <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-700/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next Recommended Action</span>
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    {growthSuggestions?.[0]?.description || `Maintain active listings and profile completeness to maximize local client discoverability.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  to={growthSuggestions?.[0]?.actionRoute || '/opportunities'}
                  className="btn-primary py-2.5 px-5 text-xs bg-amber-400 text-[#16382B] hover:bg-amber-300 font-bold shadow-md flex items-center gap-1.5 flex-1 justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{growthSuggestions?.[0]?.actionLabel || 'Explore Opportunities'}</span>
                </Link>
                <Link
                  to="/messages"
                  className="btn-secondary py-2.5 px-4 text-xs bg-emerald-900 text-emerald-100 border-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Messages</span>
                </Link>
              </div>
            </div>

          </div>

          {/* ── 3. LIVELIHOOD SNAPSHOT ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strong Matches</span>
              <span className="font-editorial text-3xl font-bold text-[#16382B] block">{opportunities.matchingCount}</span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Relevant opportunities</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Applications</span>
              <span className="font-editorial text-3xl font-bold text-[#16382B] block">{applications.total}</span>
              <span className="text-[11px] text-amber-700 font-semibold block">{applications.pending} pending responses</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Services</span>
              <span className="font-editorial text-3xl font-bold text-[#16382B] block">{services.active}</span>
              <span className="text-[11px] text-slate-500 font-semibold block">{products.active} active products</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E7E3] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
              <span className="font-editorial text-3xl font-bold text-[#16382B] block">{applications.completed}</span>
              <span className="text-[11px] text-teal-700 font-semibold block">⭐ {reputation.rating} rating</span>
            </div>
          </div>

          {/* ── 4. LIVELIHOOD SCORE & BREAKDOWN ── */}
          <div className="bg-white rounded-3xl border border-[#E2E7E3] shadow-xs overflow-hidden">
            <div className="px-6 sm:px-8 pt-7 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 border-b border-[#EEF1EE]">
              <div className="space-y-1">
                <span className="badge-sage text-xs">Readiness Engine</span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">Livelihood Score Breakdown</h2>
                <p className="text-slate-400 text-xs">Transparent readiness score calculated from real platform signals</p>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-br from-[#FFFBF4] to-[#FFF5E6] py-3 px-5 rounded-2xl border border-[#F5DFB8] shadow-sm shrink-0">
                <Award className="w-7 h-7 text-[#C86D51]" />
                <div>
                  <span className="font-editorial text-2xl font-bold text-[#16382B] leading-none">{livelihoodScore.overall}</span>
                  <span className="text-slate-400 text-sm font-semibold"> / 100</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Overall Livelihood Score</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EEF1EE]">
              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <UserRound className="w-5 h-5 text-[#16382B]" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Profile Completeness</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.profile}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-[#16382B]" style={{ '--bar-pct': `${livelihoodScore.breakdown.profile}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">Photo, bio, location, languages</span>
              </div>

              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Skill Diversity</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.skills}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-emerald-500" style={{ '--bar-pct': `${livelihoodScore.breakdown.skills}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">{skills.length} skills listed</span>
              </div>

              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-[#C86D51]" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Platform Offerings</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.offerings}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-[#C86D51]" style={{ '--bar-pct': `${livelihoodScore.breakdown.offerings}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">{services.active} services, {products.active} products</span>
              </div>

              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Customer Trust</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.trust}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-amber-500" style={{ '--bar-pct': `${livelihoodScore.breakdown.trust}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">{reputation.rating}★ avg rating ({reputation.reviewCount} reviews)</span>
              </div>

              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Work Activity</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.activity}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-teal-500" style={{ '--bar-pct': `${livelihoodScore.breakdown.activity}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">{applications.completed} completed, {applications.accepted} accepted</span>
              </div>

              <div className="bg-white px-6 py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Opportunity Matching</span>
                    <span className="text-sm font-bold text-[#16382B]">{livelihoodScore.breakdown.matching}%</span>
                  </div>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill bg-indigo-500" style={{ '--bar-pct': `${livelihoodScore.breakdown.matching}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 block">{opportunities.matchingCount} matching opportunities</span>
              </div>
            </div>
          </div>

          {/* ── 5. AI SKILL GAP SECTION ── */}
          <SkillGapSection />

          {/* ── 6. OFFERINGS OVERVIEW SUMMARY (No Duplication) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Services Overview */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16382B] flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-[#16382B]">My Services</h3>
                      <span className="text-xs text-slate-500 font-semibold">{services.active} Active Published Services</span>
                    </div>
                  </div>
                  <Link to="/provider/services/new" className="text-[#C86D51] font-bold text-xs hover:underline flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" /> + New
                  </Link>
                </div>

                {services.items && services.items.length > 0 ? (
                  <div className="space-y-2">
                    {services.items.slice(0, 2).map((svc, i) => (
                      <div key={i} className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3] flex justify-between items-center text-xs">
                        <span className="font-bold text-[#16382B]">{svc.title}</span>
                        <span className="font-editorial font-bold text-[#16382B]">₹{svc.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">No services published yet.</p>
                )}
              </div>

              <Link to="/provider/services" className="btn-secondary text-xs py-2.5 px-4 w-full text-center flex items-center justify-center gap-1.5">
                <span>Manage Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Products Overview */}
            <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-[#16382B]">My Products</h3>
                      <span className="text-xs text-slate-500 font-semibold">{products.active} Active Handmade Products</span>
                    </div>
                  </div>
                  <Link to="/provider/products/new" className="text-[#C86D51] font-bold text-xs hover:underline flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" /> + New
                  </Link>
                </div>

                {products.items && products.items.length > 0 ? (
                  <div className="space-y-2">
                    {products.items.slice(0, 2).map((prd, i) => (
                      <div key={i} className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3] flex justify-between items-center text-xs">
                        <span className="font-bold text-[#16382B]">{prd.name}</span>
                        <span className="font-editorial font-bold text-[#16382B]">₹{prd.price} / {prd.unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">No products listed yet.</p>
                )}
              </div>

              <Link to="/provider/products" className="btn-secondary text-xs py-2.5 px-4 w-full text-center flex items-center justify-center gap-1.5">
                <span>Manage Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* ── 7. RECENT PLATFORM ACTIVITY TIMELINE ── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#16382B] flex items-center gap-2">
                <span>Recent Platform Activity</span>
                <Clock className="w-5 h-5 text-[#16382B]" />
              </h3>
              <p className="text-slate-500 text-xs">Real timeline of activity on your account</p>
            </div>

            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16382B] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs text-[#16382B] block truncate">{act.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">Your recent activity will appear here.</p>
            )}
          </div>

        </div>
      </div>

      {mapOpen && <LocationMapModal user={provider} onClose={() => setMapOpen(false)} />}
    </>
  );
}
