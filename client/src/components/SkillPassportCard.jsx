import React, { useState } from 'react';
import { Award, ShieldCheck, Star, MapPin, Briefcase, Package, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expanded, setExpanded] = useState(false);

  if (!provider) return null;

  const rawSkills = provider.skills || skills || [];
  const primarySkill = rawSkills[0]?.name || (typeof rawSkills[0] === 'string' ? rawSkills[0] : 'Skill Provider');
  const expYears = rawSkills[0]?.experienceYears || provider.experienceYears || 10;
  const ratingVal = trust?.avgRating || provider.rating || 4.8;
  const reviewVal = trust?.totalReviews != null ? trust.totalReviews : (provider.reputation?.reviewCount || 0);

  return (
    <div className="bg-gradient-to-br from-[#16382B] via-[#1a4233] to-[#10291f] text-white rounded-3xl p-6 shadow-xl border border-emerald-800/80 relative overflow-hidden flex flex-col h-full">
      
      {/* Decorative Glow */}
      <div className="absolute -right-12 -top-12 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* CARD HEADER / BRANDING */}
      <div className="flex justify-between items-center border-b border-emerald-800/80 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-editorial text-xs font-bold tracking-wider text-amber-200 uppercase">
            SilverHands Digital Skill Passport
          </span>
        </div>

        <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[10px] font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>VERIFIED IDENTITY</span>
        </span>
      </div>

      {/* COMPACT ID CARD ROW - Flex to fill space when collapsed */}
      <div className="flex-1 flex flex-col justify-between relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          
          {/* Profile Info */}
          <div className="flex items-center gap-4 flex-1">
            <img
              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
              alt={provider.name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-300/50 shadow-md shrink-0"
            />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-editorial text-xl font-bold text-white">{provider.name}</h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  {provider.role === 'provider' ? 'Skilled Provider' : 'Provider'}
                </span>
              </div>
              
              <p className="text-xs text-emerald-200 font-semibold flex items-center gap-1">
                <span className="text-amber-300 font-bold">{primarySkill}</span>
                <span className="text-emerald-400/80">•</span>
                <span>{expYears}+ yrs exp</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-emerald-100/80 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {provider.location?.city || 'Chennai'}
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3 h-3 fill-amber-300" />
                  {ratingVal} <span className="text-[10px] text-emerald-200/60">({reviewVal})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EXPANDABLE FULL PASSPORT DETAILS - Shows when expanded */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t border-emerald-800/80 animate-fade-in relative z-10 flex-1">
            
            {/* AI Capability summary */}
            {aiSummary && (
              <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800/80 text-xs italic text-emerald-100/90 leading-relaxed">
                "{aiSummary}"
              </div>
            )}

            {/* All registered skills */}
            {rawSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block">Registered Skills & Expertise</span>
                <div className="flex flex-wrap gap-2">
                  {rawSkills.map((sk, idx) => (
                    <span key={idx} className="bg-emerald-900/80 border border-emerald-700 text-white text-xs font-semibold py-1 px-3 rounded-xl flex items-center gap-1.5">
                      <span>{sk.name || sk}</span>
                      {sk.proficiency && (
                        <span className="text-[9px] text-amber-300 uppercase">({sk.proficiency})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity counters */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 text-center">
                <span className="text-[9px] text-emerald-300/80 font-bold uppercase block">Active Services</span>
                <span className="font-editorial text-lg font-bold text-white">{servicesCount}</span>
              </div>
              <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 text-center">
                <span className="text-[9px] text-emerald-300/80 font-bold uppercase block">Active Products</span>
                <span className="font-editorial text-lg font-bold text-white">{productsCount}</span>
              </div>
              <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 text-center">
                <span className="text-[9px] text-emerald-300/80 font-bold uppercase block">Completed Work</span>
                <span className="font-editorial text-lg font-bold text-white">{completedCount}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Expand / View Full Passport Button - Always at bottom */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-secondary text-xs py-2 px-4 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 border-emerald-700/80 flex items-center gap-1.5 justify-center mt-4 shrink-0 relative z-10"
      >
        <span>{expanded ? 'Collapse Passport' : 'View Full Passport'}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

    </div>
  );
}
