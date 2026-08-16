import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, RefreshCw, Eye, Edit3 } from 'lucide-react';
import { generateProfile } from '../../services/aiService';

/**
 * Reusable AI Profile / Bio Generator Component
 * 
 * Props:
 * - userData: { name: string, skills: Array<string|object>, experienceYears: number, location: string|object, languages: Array<string> }
 * - currentBio: string
 * - onApply: (suggestedBio: string) => void
 */
export default function AIProfileGenerator({
  userData = {},
  currentBio = '',
  onApply
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [editableSuggestion, setEditableSuggestion] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await generateProfile(userData);
      const desc = res.data?.description || res.description || '';
      if (!desc) {
        setError('Could not generate bio. Please write your bio manually.');
        return;
      }
      setSuggestion(desc);
      setEditableSuggestion(desc);
      setShowPreview(true);
    } catch (err) {
      console.error('[AI Profile Generator Error]:', err);
      setError(err.message || 'Failed to generate profile bio. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (onApply && editableSuggestion.trim()) {
      onApply(editableSuggestion.trim());
    }
    setShowPreview(false);
  };

  const handleKeepOriginal = () => {
    setShowPreview(false);
  };

  return (
    <div className="space-y-3">
      {/* Trigger Button & Status */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-medium">
          Need help writing a warm introduction?
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 border border-[#D2DDD5] bg-white text-[#16382B] font-bold rounded-lg hover:bg-[#FBF9F4] cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
          <span>{loading ? 'Writing Bio...' : 'Generate with AI'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestion Card with Optional Side-by-Side Review */}
      {showPreview && (
        <div className="bg-[#FBF9F4] p-5 rounded-2xl border border-[#D2DDD5] space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="badge-terracotta text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C86D51]" /> AI Bio Suggestion
            </span>
            <span className="text-[11px] text-slate-500 italic">
              Optional & Editable
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#16382B]">
              Preview & Edit Suggestion:
            </label>
            <textarea
              rows="3"
              value={editableSuggestion}
              onChange={(e) => setEditableSuggestion(e.target.value)}
              className="input-editorial text-xs leading-relaxed bg-white"
            />
          </div>

          {currentBio && currentBio.trim() && (
            <div className="p-3 bg-white rounded-xl border border-[#E2E7E3] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Your Current Bio</span>
              <p className="text-xs text-slate-600 italic">"{currentBio}"</p>
            </div>
          )}

          {/* Decision Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#E2E7E3]">
            <button
              type="button"
              onClick={handleKeepOriginal}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              Keep My Text
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Use Suggestion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
