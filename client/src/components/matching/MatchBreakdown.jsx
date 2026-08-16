/**
 * MatchBreakdown.jsx  —  SilverHands Phase 6
 *
 * Renders the four scoring components returned by the backend:
 *   skill · location · availability · rating
 *
 * Rules:
 *   - All values come from the backend breakdown object.
 *   - A null rating is displayed as "Unavailable" — never fabricated.
 *   - Progress bars are purely visual; the percentage shown is the real score.
 *
 * Props:
 *   breakdown  {object}  { skill, location, availability, rating }
 *                         Values are 0–100 integers or null.
 *   compact    {boolean}  Smaller layout for use inside cards (default false)
 */
import React from 'react';
import { Wrench, MapPin, Calendar, Star } from 'lucide-react';

const COMPONENTS = [
  { key: 'skill',        label: 'Skill',        Icon: Wrench,   weight: '50%' },
  { key: 'location',     label: 'Location',     Icon: MapPin,   weight: '25%' },
  { key: 'availability', label: 'Availability', Icon: Calendar, weight: '15%' },
  { key: 'rating',       label: 'Rating',       Icon: Star,     weight: '10%' },
];

const barColor = (score) => {
  if (score == null) return 'bg-slate-200';
  if (score >= 85)   return 'bg-emerald-500';
  if (score >= 60)   return 'bg-[#C07A46]';
  return 'bg-red-400';
};

const scoreLabel = (score) => {
  if (score == null) return { text: 'Unavailable', color: 'text-slate-400' };
  if (score >= 85)   return { text: `${score}%`,   color: 'text-emerald-700' };
  if (score >= 60)   return { text: `${score}%`,   color: 'text-[#C07A46]'  };
  return             { text: `${score}%`,           color: 'text-red-600'    };
};

function BreakdownRow({ label, Icon, score, weight, compact }) {
  const { text, color } = scoreLabel(score);
  const barW = score != null ? `${score}%` : '0%';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="text-xs text-slate-600 w-20 shrink-0">{label}</span>
        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor(score)}`}
            style={{ width: barW }}
            role="progressbar"
            aria-valuenow={score ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className={`text-xs font-bold ${color} w-16 text-right shrink-0`}>{text}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-[10px] text-slate-400 font-medium">({weight})</span>
        </div>
        <span className={`text-sm font-bold ${color}`}>{text}</span>
      </div>
      <div
        className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={score ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} score: ${text}`}
      >
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor(score)}`}
          style={{ width: barW }}
        />
      </div>
    </div>
  );
}

export default function MatchBreakdown({ breakdown, compact = false }) {
  if (!breakdown) return null;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {!compact && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Score Breakdown
        </h4>
      )}
      {COMPONENTS.map(({ key, label, Icon, weight }) => (
        <BreakdownRow
          key={key}
          label={label}
          Icon={Icon}
          score={breakdown[key] ?? null}
          weight={weight}
          compact={compact}
        />
      ))}
    </div>
  );
}
