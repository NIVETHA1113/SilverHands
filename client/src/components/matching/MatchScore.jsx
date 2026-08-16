/**
 * MatchScore.jsx  —  SilverHands Phase 6
 *
 * Displays the overall match score badge returned by the backend.
 * The score is NEVER calculated in this component — it is always
 * received from the POST /api/matching/providers response.
 *
 * Props:
 *   score   {number|null}  0–100 integer from the backend
 *   size    {'sm'|'md'|'lg'}  visual size (default 'md')
 *   inline  {boolean}  when true renders as a small pill (default false)
 */
import React from 'react';
import { Sparkles } from 'lucide-react';

const colorFor = (score) => {
  if (score >= 85) return { ring: 'border-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score >= 65) return { ring: 'border-[#C07A46]',  text: 'text-[#C07A46]',  bg: 'bg-amber-50'   };
  return           { ring: 'border-slate-400',          text: 'text-slate-600',  bg: 'bg-slate-50'   };
};

export default function MatchScore({ score, size = 'md', inline = false }) {
  if (score == null) return null;

  const { ring, text, bg } = colorFor(score);

  // ── Inline pill (used inside provider cards) ──────────────────────────
  if (inline) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${ring} ${text} ${bg}`}
        title={`${score}% match score`}
        aria-label={`${score}% match`}
      >
        <Sparkles className="w-3 h-3" aria-hidden="true" />
        {score}% Match
      </span>
    );
  }

  // ── Standalone display (used in match panel) ──────────────────────────
  const sizeClasses = {
    sm: { wrap: 'w-16 h-16', num: 'text-xl',  label: 'text-[10px]' },
    md: { wrap: 'w-20 h-20', num: 'text-2xl', label: 'text-xs'     },
    lg: { wrap: 'w-24 h-24', num: 'text-3xl', label: 'text-xs'     },
  }[size] || sizeClasses?.md;

  const { wrap, num, label } = {
    sm: { wrap: 'w-16 h-16', num: 'text-xl',  label: 'text-[10px]' },
    md: { wrap: 'w-20 h-20', num: 'text-2xl', label: 'text-xs'     },
    lg: { wrap: 'w-24 h-24', num: 'text-3xl', label: 'text-xs'     },
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center ${wrap} rounded-full border-4 ${ring} ${bg} shadow-xs`}
      aria-label={`Match score: ${score}%`}
    >
      <span className={`${num} font-editorial font-bold ${text} leading-none`}>
        {score}
      </span>
      <span className={`${label} font-bold ${text} uppercase tracking-wide leading-tight`}>
        Match
      </span>
    </div>
  );
}
