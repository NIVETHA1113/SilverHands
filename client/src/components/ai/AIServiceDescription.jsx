import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { generateServiceDescription } from '../../services/aiService';

/**
 * Reusable AI Service Description Improver Component
 * 
 * Props:
 * - serviceData: { title: string, category: string, skills: Array<string>, details: string }
 * - currentDescription: string
 * - onApply: (suggestedDescription: string) => void
 */
export default function AIServiceDescription({
  serviceData = {},
  currentDescription = '',
  onApply
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [editableSuggestion, setEditableSuggestion] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleImprove = async () => {
    if (!serviceData.title || !serviceData.title.trim()) {
      setError('Please enter a service title first before generating a description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await generateServiceDescription({
        title: serviceData.title,
        category: serviceData.category || 'General',
        skills: serviceData.skills || [],
        details: serviceData.details || currentDescription || ''
      });

      const desc = res.data?.description || res.description || '';
      if (!desc) {
        setError('Could not generate service description.');
        return;
      }

      setSuggestion(desc);
      setEditableSuggestion(desc);
      setShowPreview(true);
    } catch (err) {
      console.error('[AI Service Description Error]:', err);
      setError(err.message || 'Could not improve description right now.');
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
      {/* Trigger Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Make your service description clear and inviting:
        </span>
        <button
          type="button"
          onClick={handleImprove}
          disabled={loading}
          className="text-xs font-bold text-[#C86D51] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Polishing...' : 'Improve with AI'}</span>
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
            <span className="badge-sage text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#16382B]" /> AI Enhanced Description
            </span>
            <span className="text-[11px] text-slate-500 italic">
              Optional & Editable
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#16382B]">
              Review & Customize Suggestion:
            </label>
            <textarea
              rows="3"
              value={editableSuggestion}
              onChange={(e) => setEditableSuggestion(e.target.value)}
              className="input-editorial text-xs leading-relaxed bg-white"
            />
          </div>

          {currentDescription && currentDescription.trim() && (
            <div className="p-3 bg-white rounded-xl border border-[#E2E7E3] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Your Original Notes</span>
              <p className="text-xs text-slate-600 italic">"{currentDescription}"</p>
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
