import React from 'react';
import {
  Award,
  ShieldCheck,
  Star,
  Sparkles,
  MapPin,
  Briefcase,
  Package,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function SkillPassportCard({
  provider,
  skills = [],
  servicesCount = 0,
  productsCount = 0,
  completedCount = 0,
  trust = null,
  aiSummary = '',
  isPublic = false,
  onLocationClick = null
}) {
  if (!provider) return null;

  const rawSkills = provider.skills || skills || [];
  const ratingVal = trust?.avgRating || provider.rating || 4.8;
  const reviewVal = trust?.totalReviews != null ? trust.totalReviews : (provider.reputation?.reviewCount || 0);

  // Group skills by category for Opportunity Strengths
  const skillCategories = [...new Set(rawSkills.map(s => s.category || 'General'))];

  return (
    <div className="bg-gradient-to-br from-[#16382B] via-[#1a4233] to-[#10291f] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/80 relative overflow-hidden space-y-6">
      
      {/* Decorative Blur Effect */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* PASSPORT HEADER BADGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-editorial text-sm font-bold tracking-wider text-amber-200 uppercase block leading-none">
              SilverHands Digital Skill Passport
            </span>
            <span className="text-[10px] text-emerald-200/70 font-medium block mt-0.5">
              Verified Professional Capability Credential
            </span>
          </div>
        </div>

        <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Verified Skill Identity</span>
        </span>
      </div>

      {/* PROVIDER PROFILE IDENTITY ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
        <img
          src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
          alt={provider.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-300/50 shadow-md shrink-0"
        />

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">{provider.name}</h2>
            {provider.age && (
              <span className="text-xs text-emerald-200/80 font-medium">({provider.age} yrs)</span>
            )}
          </div>

          <p className="text-xs text-emerald-100/90 font-medium flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {onLocationClick ? (
              <button
                onClick={onLocationClick}
                className="hover:text-white transition-colors cursor-pointer underline underline-offset-2 decoration-emerald-400/50"
                title="View on map"
              >
                {provider.location?.city || 'Chennai'}, {provider.location?.state || 'Tamil Nadu'}, {provider.location?.country || 'India'}
              </button>
            ) : (
              <span>{provider.location?.city || 'Chennai'}, {provider.location?.state || 'Tamil Nadu'}, {provider.location?.country || 'India'}</span>
            )}
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {provider.verification?.phoneVerified && (
              <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-800 text-[10px] font-semibold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Phone Verified
              </span>
            )}
            {provider.verification?.profileVerified && (
              <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-800 text-[10px] font-semibold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Profile Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI CAPABILITY SUMMARY */}
      {aiSummary && (
        <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800/80 space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Capability Statement</span>
          </div>
          <p className="text-xs text-emerald-100/90 italic leading-relaxed">
            "{aiSummary}"
          </p>
        </div>
      )}

      {/* CORE SKILLS MATRIX */}
      <div className="space-y-3 relative z-10">
        <h3 className="font-editorial text-lg font-bold text-amber-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Core Skill Capabilities</span>
        </h3>

        {rawSkills && rawSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rawSkills.map((skill, idx) => (
              <div key={idx} className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-700/60 space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="font-bold text-xs text-white">{skill.name}</span>
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[9px] font-bold py-0.5 px-2 rounded-full uppercase">
                    {skill.proficiency || 'Experienced'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-200/80 pt-1">
                  <span>Category: {skill.category || 'General'}</span>
                  <span>{skill.experienceYears || 5}+ yrs exp</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800 text-xs text-emerald-200/70 italic">
            No skills registered yet in Digital Skill Passport.
          </div>
        )}
      </div>

      {/* PROFESSIONAL ACTIVITY & REPUTATION ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10 border-t border-emerald-800/80">
        <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80 text-center">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider block">Active Services</span>
          <span className="font-editorial text-2xl font-bold text-white flex items-center justify-center gap-1">
            <Briefcase className="w-4 h-4 text-emerald-400 inline" /> {servicesCount}
          </span>
        </div>

        <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80 text-center">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider block">Active Products</span>
          <span className="font-editorial text-2xl font-bold text-white flex items-center justify-center gap-1">
            <Package className="w-4 h-4 text-amber-400 inline" /> {productsCount}
          </span>
        </div>

        <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80 text-center">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider block">Completed Jobs</span>
          <span className="font-editorial text-2xl font-bold text-white">
            {completedCount}
          </span>
        </div>

        <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80 text-center">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider block">Community Rating</span>
          <span className="font-editorial text-2xl font-bold text-amber-300 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-300 inline" /> {ratingVal} <span className="text-[10px] text-emerald-200/60 font-sans">({reviewVal})</span>
          </span>
        </div>
      </div>

      {/* OPPORTUNITY STRENGTH DOMAINS */}
      {skillCategories && skillCategories.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-emerald-800/80 relative z-10">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider block">Primary Opportunity Domains</span>
          <div className="flex flex-wrap gap-2">
            {skillCategories.map((cat, i) => (
              <span key={i} className="bg-emerald-900/80 border border-emerald-700 text-emerald-100 text-xs font-semibold py-1 px-3 rounded-xl flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                <span>{cat}</span>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
