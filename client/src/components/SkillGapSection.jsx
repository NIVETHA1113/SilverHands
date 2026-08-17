import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function SkillGapSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGap, setSelectedGap] = useState(null);

  useEffect(() => {
    const fetchSkillGaps = async () => {
      try {
        setLoading(true);
        const res = await api.get('/providers/skill-gaps');
        if (res.data.success) {
          setData(res.data.data);
          if (res.data.data.topSkillGaps && res.data.data.topSkillGaps.length > 0) {
            setSelectedGap(res.data.data.topSkillGaps[0]);
          }
        }
      } catch (err) {
        console.error('[Skill Gap Fetch Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGaps();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs text-center py-10 space-y-3">
        <div className="w-8 h-8 border-3 border-[#16382B] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold">Analyzing your skills against open customer opportunities...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, readyNow, almostThere, topSkillGaps, aiExplanation } = data;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E7E3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-terracotta text-xs uppercase font-bold tracking-wider">Opportunity Unlocker</span>
            <Unlock className="w-4 h-4 text-[#C86D51]" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#16382B]">AI Skill Gap Analysis</h2>
          <p className="text-slate-500 text-xs mt-0.5">Discover opportunities you qualify for and high-impact skills to unlock more work</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-2xl text-center">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Ready Now</span>
            <span className="font-editorial text-lg font-bold text-emerald-900">{summary.readyCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-2xl text-center">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Almost There</span>
            <span className="font-editorial text-lg font-bold text-amber-900">{summary.almostThereCount}</span>
          </div>
        </div>
      </div>

      {/* AI EXPLANATION BOX */}
      {aiExplanation && (
        <div className="bg-[#FBF9F4] p-4 sm:p-5 rounded-2xl border border-[#E2E7E3] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#16382B] text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-editorial text-sm font-bold text-[#16382B]">AI Skill Recommendation</h4>
            <p className="text-xs text-slate-700 leading-relaxed italic">"{aiExplanation}"</p>
          </div>
        </div>
      )}

      {/* TOP UNLOCKABLE SKILL CARDS */}
      {topSkillGaps && topSkillGaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-editorial text-lg font-bold text-[#16382B]">Highest-Impact Skills to Learn</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSkillGaps.map((gap, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedGap(gap)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 shadow-2xs ${
                  selectedGap?.skillName === gap.skillName
                    ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-[#FBF9F4] border-[#E2E7E3] hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C86D51] text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h4 className="font-editorial text-base font-bold text-[#16382B]">{gap.skillName}</h4>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                    +{gap.count} Opp{gap.count > 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Adding this skill will make you eligible for <span className="font-bold text-[#16382B]">{gap.count} additional opportunities</span> on SilverHands.
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[#16382B]">
                  <span>See Details & Opportunities</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SELECTED SKILL GAP BREAKDOWN MODAL / PANEL */}
      {selectedGap && (
        <div className="bg-[#16382B] text-white p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-400" />
              <h3 className="font-editorial text-xl font-bold">
                Unlock Opportunities with <span className="text-amber-300">{selectedGap.skillName}</span>
              </h3>
            </div>
            <span className="bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold py-1 px-3 rounded-full">
              Appears in {selectedGap.count} Opportunities
            </span>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed">
            By developing <strong className="text-white">{selectedGap.skillName}</strong>, you satisfy the primary missing requirement for these near-match opportunities:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {selectedGap.opportunities.map((opp, i) => (
              <div key={i} className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 flex justify-between items-center gap-2">
                <div>
                  <h5 className="font-bold text-xs text-white line-clamp-1">{opp.title}</h5>
                  <span className="text-[10px] text-emerald-300">Match score: {opp.matchScore}%</span>
                </div>
                <Link
                  to={`/opportunities/${opp.id}`}
                  className="btn-secondary text-[10px] py-1 px-2.5 bg-white text-[#16382B] hover:bg-emerald-100 shrink-0"
                >
                  View Opp
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALMOST THERE OPPORTUNITIES LIST */}
      {almostThere && almostThere.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="font-editorial text-xl font-bold text-[#16382B] flex items-center gap-2">
            <span>Almost There (Near Matches)</span>
            <span className="text-xs font-normal text-slate-500">({almostThere.length} opportunities)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {almostThere.map((opp) => (
              <div key={opp.id} className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="badge-sage text-[10px]">{opp.category}</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold py-0.5 px-2 rounded-full">
                      {opp.matchScore}% Matched
                    </span>
                  </div>

                  <h4 className="font-editorial text-base font-bold text-[#16382B]">{opp.title}</h4>
                  <span className="text-xs text-slate-500 font-semibold block">📍 {opp.city} • ₹{opp.budget} ({opp.budgetType})</span>

                  {/* Skills Breakdown */}
                  <div className="bg-white p-3 rounded-xl border border-[#E2E7E3] space-y-1 text-xs">
                    {opp.matchedSkills && opp.matchedSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Matched: {opp.matchedSkills.join(', ')}</span>
                      </div>
                    )}
                    {opp.missingSkills && opp.missingSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Missing: {opp.missingSkills.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link to={`/opportunities/${opp.id}`} className="btn-secondary text-xs py-2 px-3 text-center block">
                  View Opportunity
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
