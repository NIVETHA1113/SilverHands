/**
 * MatchReasons.jsx  —  SilverHands Phase 6
 *
 * Renders the human-readable match reasons returned by the backend.
 * Reasons are NEVER regenerated in React — they come directly from
 * the POST /api/matching/providers response.
 *
 * Positive reasons (containing "no ", "not ", "unavailable", "only",
 * "outside", "limited") are rendered with a warning/neutral style;
 * everything else gets a green tick.
 *
 * Props:
 *   reasons  {string[]}  Array of reason strings from the backend
 *   compact  {boolean}   Smaller layout for cards (default false)
 */
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const WEAK_PATTERNS = /no |not |unavailable|only partially|outside|limited|information unavail/i;

export default function MatchReasons({ reasons, compact = false }) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {!compact && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Why this provider?
        </h4>
      )}
      <ul className={compact ? 'space-y-1' : 'space-y-2'} role="list">
        {reasons.map((reason, i) => {
          const isWeak = WEAK_PATTERNS.test(reason);
          return (
            <li
              key={i}
              className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
            >
              {isWeak ? (
                <AlertCircle
                  className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-amber-500 mt-0.5 shrink-0`}
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle
                  className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-600 mt-0.5 shrink-0`}
                  aria-hidden="true"
                />
              )}
              <span className={isWeak ? 'text-slate-500' : 'text-slate-700'}>
                {reason}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
