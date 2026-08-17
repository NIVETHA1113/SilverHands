import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import SkillGapSection from '../../components/SkillGapSection';
import {
  Sparkles,
  Star,
  CheckCircle2,
  Briefcase,
  Package,
  FileText,
  TrendingUp,
  MapPin,
  Award,
  ArrowRight,
  PlusCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Activity,
  Layers,
  Search
} from 'lucide-react';

export default function ProviderLivelihoodDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    profileCompleteness,
    skills,
    services,
    products,
    opportunities,
    applications,
    reputation,
    livelihoodActivity,
    growthSuggestions,
    aiSummary,
    recentActivity
  } = data;

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── 1. HEADER OVERVIEW BANNER ── */}
        <div className="bg-[#16382B] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                alt={provider.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-terracotta text-[10px] uppercase font-bold tracking-wider">Skill Provider</span>
                  {provider.verification?.profileVerified && (
                    <span className="bg-emerald-800 text-emerald-200 border border-emerald-700 text-[10px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified
                    </span>
                  )}
                </div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold">
                  Good day, {provider.name} 👋
                </h1>
                <p className="text-emerald-100/80 text-xs sm:text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{provider.location?.city || 'Chennai'}, {provider.location?.state || 'Tamil Nadu'}</span>
                </p>
              </div>
            </div>

            {/* Top Stat Badges */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto bg-emerald-950/60 p-3 sm:p-4 rounded-2xl border border-emerald-800/60">
              <div className="text-center px-2">
                <span className="text-[10px] text-emerald-200/80 uppercase tracking-wider font-bold block">Livelihood Score</span>
                <span className="font-editorial text-2xl font-bold text-emerald-300">
                  {livelihoodScore.overall} <span className="text-xs text-emerald-200/60 font-normal">/100</span>
                </span>
              </div>
              <div className="text-center border-x border-emerald-800/60 px-2">
                <span className="text-[10px] text-emerald-200/80 uppercase tracking-wider font-bold block">Rating</span>
                <span className="font-editorial text-2xl font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300 inline" /> {reputation.rating}
                </span>
              </div>
              <div className="text-center px-2">
                <span className="text-[10px] text-emerald-200/80 uppercase tracking-wider font-bold block">Completed</span>
                <span className="font-editorial text-2xl font-bold text-white">
                  {applications.completed} <span className="text-xs text-emerald-200/60 font-normal">jobs</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. AI-POWERED GROWTH INSIGHT ── */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#16382B] text-white p-5 rounded-3xl border border-emerald-800 shadow-md flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-editorial text-base font-bold text-emerald-200 flex items-center gap-2">
              <span>AI Platform Insights</span>
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed italic">
              "{aiSummary}"
            </p>
          </div>
        </div>

        {/* ── 3. LIVELIHOOD SCORE & BREAKDOWN ── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E7E3] pb-4">
            <div>
              <span className="badge-sage text-xs">Readiness Engine</span>
              <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Livelihood Score Breakdown</h2>
              <p className="text-slate-500 text-xs mt-0.5">Transparent readiness score calculated from real platform signals</p>
            </div>
            <div className="flex items-center gap-2 bg-[#FBF9F4] py-2 px-4 rounded-2xl border border-[#E2E7E3]">
              <Award className="w-5 h-5 text-[#C86D51]" />
              <span className="font-editorial text-xl font-bold text-[#16382B]">{livelihoodScore.overall} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Profile Completeness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Profile Completeness</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.profile}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#16382B] h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.profile}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Photo, bio, location, languages</span>
            </div>

            {/* Skill Diversity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Skill Diversity</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.skills}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.skills}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{skills.length} skills listed</span>
            </div>

            {/* Platform Offerings */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Platform Offerings</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.offerings}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#C86D51] h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.offerings}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{services.active} services, {products.active} products</span>
            </div>

            {/* Customer Trust */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Customer Trust</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.trust}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.trust}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{reputation.rating}★ avg rating ({reputation.reviewCount} reviews)</span>
            </div>

            {/* Work Activity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Work Activity</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.activity}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.activity}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{applications.completed} completed, {applications.accepted} accepted</span>
            </div>

            {/* Opportunity Readiness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Opportunity Matching</span>
                <span className="text-[#16382B] font-bold">{livelihoodScore.breakdown.matching}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${livelihoodScore.breakdown.matching}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">{opportunities.matchingCount} matching opportunities</span>
            </div>

          </div>
        </div>

        {/* ── 4. AI SKILL GAP → OPPORTUNITY UNLOCK SECTION ── */}
        <SkillGapSection />

        {/* ── 5. PROFILE COMPLETENESS & SKILLS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Completeness Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">Professional Profile</h3>
                <span className="badge-[#16382B] text-xs">{profileCompleteness.score}% Complete</span>
              </div>

              {profileCompleteness.missingFields.length > 0 ? (
                <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900 block">Complete these items to improve visibility:</span>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {profileCompleteness.missingFields.map((field, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your profile details are 100% complete and fully optimized!</span>
                </div>
              )}
            </div>

            <Link to="/onboarding" className="btn-primary text-xs py-2.5 px-4 w-full text-center flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>{profileCompleteness.score < 100 ? 'Complete Profile' : 'Edit Profile Details'}</span>
            </Link>
          </div>

          {/* Registered Skills List */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">Your Registered Skills</h3>
                <span className="text-xs text-slate-500 font-semibold">{skills.length} Listed</span>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="bg-[#FBF9F4] border border-[#E2E7E3] py-2 px-3.5 rounded-2xl flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#16382B]">{skill.name}</span>
                      <span className="badge-sage text-[9px] uppercase">{skill.proficiency || 'Experienced'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">No skills registered yet. Add your skills to match with local customer opportunities.</p>
              )}
            </div>

            <Link to="/onboarding" className="btn-secondary text-xs py-2.5 px-4 w-full text-center flex items-center justify-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Manage Skills</span>
            </Link>
          </div>

        </div>

        {/* ── 6. SERVICES & PRODUCTS OVERVIEW ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Services Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16382B] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">My Services</h3>
                  <span className="text-xs text-slate-500 font-semibold">{services.active} Published Services</span>
                </div>
              </div>
              <Link to="/provider/services/new" className="text-[#C86D51] font-bold text-xs hover:underline flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> + New
              </Link>
            </div>

            {services.items && services.items.length > 0 ? (
              <div className="space-y-2">
                {services.items.map((svc, i) => (
                  <div key={i} className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-[#16382B] block">{svc.title}</span>
                      <span className="text-[10px] text-slate-500">{svc.category}</span>
                    </div>
                    <span className="font-editorial font-bold text-xs text-[#16382B]">₹{svc.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#FBF9F4] rounded-2xl border border-dashed border-[#E2E7E3] space-y-2">
                <p className="text-xs text-slate-500">You haven't offered any services yet.</p>
              </div>
            )}

            <Link to="/provider/services" className="btn-secondary text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5">
              <span>Manage Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Products Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">My Products</h3>
                  <span className="text-xs text-slate-500 font-semibold">{products.active} Products Listed</span>
                </div>
              </div>
              <Link to="/provider/products/new" className="text-[#C86D51] font-bold text-xs hover:underline flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> + New
              </Link>
            </div>

            {products.items && products.items.length > 0 ? (
              <div className="space-y-2">
                {products.items.map((prd, i) => (
                  <div key={i} className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-[#16382B] block">{prd.name}</span>
                      <span className="text-[10px] text-slate-500">{prd.category} • Stock: {prd.quantity}</span>
                    </div>
                    <span className="font-editorial font-bold text-xs text-[#16382B]">₹{prd.price} / {prd.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#FBF9F4] rounded-2xl border border-dashed border-[#E2E7E3] space-y-2">
                <p className="text-xs text-slate-500">No products listed yet.</p>
              </div>
            )}

            <Link to="/provider/products" className="btn-secondary text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5">
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* ── 7. OPPORTUNITIES FOR YOU ── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E7E3] pb-4">
            <div>
              <span className="badge-terracotta text-xs">Intelligent Matching Engine</span>
              <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Opportunities For You</h2>
              <p className="text-slate-500 text-xs mt-0.5">Top customer requirements matched to your skills & location</p>
            </div>
            <Link to="/opportunities" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Explore All ({opportunities.matchingCount})</span>
            </Link>
          </div>

          {opportunities.topMatches && opportunities.topMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.topMatches.map((opp, idx) => (
                <div key={idx} className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="badge-sage text-[10px]">{opp.category}</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                        {opp.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="font-editorial text-base font-bold text-[#16382B] line-clamp-1">{opp.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      📍 {opp.city} • <span className="text-[#16382B] font-bold">₹{opp.budget}</span> ({opp.budgetType})
                    </p>

                    {opp.reasons && opp.reasons.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-[#E2E7E3] text-[10px] text-slate-600 space-y-0.5">
                        <span className="font-bold text-[#16382B] block">Why matched:</span>
                        <p className="line-clamp-2 italic">"{opp.reasons[0]}"</p>
                      </div>
                    )}
                  </div>

                  <Link to={`/opportunities/${opp.id}`} className="btn-secondary text-[11px] py-1.5 px-3 w-full text-center block">
                    View Opportunity Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#FBF9F4] rounded-2xl border border-dashed border-[#E2E7E3]">
              <p className="text-xs text-slate-500">No matching opportunities found right now. Check back soon!</p>
            </div>
          )}
        </div>

        {/* ── 8. APPLICATION BREAKDOWN & ESTIMATED WORK VALUE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications Status Breakdown (2 Columns) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-[#E2E7E3] pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#16382B]">Application Activity</h3>
                <p className="text-slate-500 text-xs">Track the status of your submitted job applications</p>
              </div>
              <Link to="/applications/my" className="btn-secondary text-xs py-2 px-3.5">
                View Applications
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Applied</span>
                <span className="font-editorial text-2xl font-bold text-[#16382B]">{applications.total}</span>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pending</span>
                <span className="font-editorial text-2xl font-bold text-amber-800">{applications.pending}</span>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Accepted</span>
                <span className="font-editorial text-2xl font-bold text-emerald-800">{applications.accepted}</span>
              </div>
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/60 text-center space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Completed</span>
                <span className="font-editorial text-2xl font-bold text-teal-800">{applications.completed}</span>
              </div>
            </div>
          </div>

          {/* Estimated Livelihood Activity Value */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="badge-terracotta text-xs">Work Value</span>
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">Estimated Service Value</h3>
                <p className="text-slate-500 text-xs">Estimated value of your accepted & completed work</p>
              </div>

              <div className="bg-[#FBF9F4] p-5 rounded-2xl border border-[#E2E7E3] space-y-3 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Total Service Value</span>
                <span className="font-editorial text-3xl font-bold text-[#16382B]">
                  ₹{livelihoodActivity.totalEstimatedValue.toLocaleString()}
                </span>
                <div className="pt-2 border-t border-[#E2E7E3] grid grid-cols-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Job Value</span>
                    <span className="font-bold text-[#16382B]">₹{livelihoodActivity.averageJobValue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jobs Count</span>
                    <span className="font-bold text-[#16382B]">{livelihoodActivity.completedOrAcceptedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── 9. GROWTH SUGGESTIONS & RECENT ACTIVITY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Growth Suggestions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#16382B] flex items-center gap-2">
                <span>Grow Your Livelihood</span>
                <TrendingUp className="w-5 h-5 text-[#C86D51]" />
              </h3>
              <p className="text-slate-500 text-xs">Actionable recommendations based on your profile signals</p>
            </div>

            {growthSuggestions && growthSuggestions.length > 0 ? (
              <div className="space-y-3">
                {growthSuggestions.map((sug) => (
                  <div key={sug.id} className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] flex justify-between items-center gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-[#16382B]">{sug.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{sug.description}</p>
                    </div>
                    <button
                      onClick={() => navigate(sug.actionRoute)}
                      className="btn-primary text-[10px] py-1.5 px-3 shrink-0"
                    >
                      {sug.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                🎉 Great job! You have satisfied all growth recommendations for your profile.
              </div>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#16382B] flex items-center gap-2">
                <span>Recent Platform Activity</span>
                <Clock className="w-5 h-5 text-[#16382B]" />
              </h3>
              <p className="text-slate-500 text-xs">Timeline of events from your account</p>
            </div>

            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3]">
                    <div className="w-2 h-2 rounded-full bg-[#16382B] shrink-0" />
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
              <p className="text-xs text-slate-500 italic py-4">No recent activity logged yet.</p>
            )}
          </div>

        </div>

        {/* ── 10. QUICK ACTIONS TOOLBAR ── */}
        <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
          <h3 className="font-editorial text-xl font-bold text-[#16382B]">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Link to="/provider/services/new" className="btn-primary text-xs py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> + Service
            </Link>
            <Link to="/provider/products/new" className="btn-secondary text-xs py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> + Product
            </Link>
            <Link to="/opportunities" className="btn-secondary text-xs py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
              <Search className="w-4 h-4" /> Opportunities
            </Link>
            <Link to="/onboarding" className="btn-secondary text-xs py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Edit Profile
            </Link>
            <Link to="/applications/my" className="btn-secondary text-xs py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4" /> Applications
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
