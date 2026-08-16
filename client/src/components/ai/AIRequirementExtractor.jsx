import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, MapPin, Calendar, Tag, Layers, X } from 'lucide-react';
import { extractRequirement } from '../../services/aiService';

/**
 * Reusable AI Requirement Extractor Component
 * Allows customers to describe their requirements in plain text and extract structured filters/needs.
 * 
 * Props:
 * - onRequirementExtracted: (reqData: { category: string, skills: string[], availability: string[], locationPreference: string }) => void
 * - initialText: string
 */
export default function AIRequirementExtractor({
  onRequirementExtracted,
  initialText = ''
}) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setError('Please enter your requirement description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await extractRequirement(text.trim());
      const data = res.data || {};
      setExtractedData(data);
    } catch (err) {
      console.error('[AI Requirement Extractor Error]:', err);
      setError(err.message || 'Could not parse requirement details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (onRequirementExtracted && extractedData) {
      onRequirementExtracted(extractedData);
    }
  };

  const handleClear = () => {
    setExtractedData(null);
    setText('');
    setError('');
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E6ECE7] text-[#16382B] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#C86D51]" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#16382B]">
              AI Smart Requirement Finder
            </h3>
            <p className="text-xs text-slate-500">
              Describe what you need naturally (e.g. <em>"I need someone nearby to teach my daughter traditional Tamil cooking on weekends."</em>)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-3">
        <textarea
          rows="3"
          placeholder="Tell us what service you need, who it is for, location, and preferred days..."
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          className="input-editorial text-sm"
        />

        <div className="flex justify-end gap-2">
          {extractedData && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Analyzing Requirement...' : 'Extract Structured Need ✨'}</span>
          </button>
        </div>
      </div>

      {/* Structured Output Cards */}
      {extractedData && (
        <div className="p-4 bg-[#FBF9F4] rounded-2xl border border-[#D2DDD5] space-y-3 mt-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#E2E7E3] pb-2">
            <span className="text-xs font-bold text-[#16382B] uppercase tracking-wider">
              Structured Requirement Extracted
            </span>
            <span className="badge-sage text-[10px]">Preview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Category */}
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E7E3]">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                <Layers className="w-3.5 h-3.5 text-[#16382B]" />
                <span>Category</span>
              </div>
              <p className="font-bold text-[#16382B]">{extractedData.category || 'General'}</p>
            </div>

            {/* Location Preference */}
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E7E3]">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#16382B]" />
                <span>Location Preference</span>
              </div>
              <p className="font-bold text-[#16382B]">{extractedData.locationPreference || 'Nearby'}</p>
            </div>

            {/* Skills */}
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E7E3]">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                <Tag className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Skills Needed</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {extractedData.skills?.map((s, idx) => (
                  <span key={idx} className="badge-sage text-[11px] py-0.5 px-2">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="p-2.5 bg-white rounded-xl border border-[#E2E7E3]">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#16382B]" />
                <span>Availability</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {extractedData.availability?.map((a, idx) => (
                  <span key={idx} className="badge-terracotta text-[11px] py-0.5 px-2">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Filters / Requirements</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
