import React, { useState, useEffect } from 'react';
import { Sparkles, Star, CheckCircle, Info } from 'lucide-react';
import { explainMatch } from '../../services/aiService';

/**
 * Reusable AI Match Explanation Component
 * Displays a friendly natural language AI summary of match reasons without calculating or altering score.
 * 
 * Props:
 * - matchScore: number (0-100)
 * - reasons: Array<string>
 * - providerName: string
 */
export default function AIMatchExplanation({
  matchScore = 90,
  reasons = [],
  providerName = 'This provider'
}) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchExplanation = async () => {
      if (reasons.length === 0 && !matchScore) return;
      try {
        setLoading(true);
        setError('');
        const res = await explainMatch({ matchScore, reasons });
        if (isMounted) {
          const exp = res.data?.explanation || res.explanation || '';
          setExplanation(exp);
        }
      } catch (err) {
        if (isMounted) {
          // Graceful fallback explanation
          setExplanation(`${providerName} is a strong match (${matchScore}%) based on your requested skills, location, and availability preferences.`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [matchScore, JSON.stringify(reasons), providerName]);

  return (
    <div className="bg-[#E6ECE7]/60 p-4 sm:p-5 rounded-2xl border border-[#D2DDD5] space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#16382B] text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-editorial text-base font-bold text-[#16382B]">
            AI Match Breakdown
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[#D2DDD5] text-xs font-bold text-[#16382B]">
          <Star className="w-3.5 h-3.5 text-[#C07A46] fill-current" />
          <span>{matchScore}% Match</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <div className="w-3.5 h-3.5 border-2 border-[#16382B] border-t-transparent rounded-full animate-spin" />
          <span>Generating match summary...</span>
        </div>
      ) : explanation ? (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-[#D2DDD5]">
          "{explanation}"
        </p>
      ) : null}

      {/* Breakdown Reasons Badges */}
      {reasons.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-[#16382B] uppercase tracking-wider block">
            Matching Factors:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((reason, idx) => (
              <span
                key={idx}
                className="badge-sage text-[11px] py-0.5 px-2.5 bg-white border border-[#D2DDD5] text-slate-700 flex items-center gap-1 font-semibold"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>{reason}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
