import React, { useState } from 'react';
import { Sparkles, Plus, Check, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { extractSkills } from '../../services/aiService';

/**
 * Reusable AI Skill Extractor Component
 * 
 * Props:
 * - onSkillsExtracted: (skills: Array<{ name: string, experienceYears: number|null, proficiency: string }>) => void
 * - initialText: string
 * - buttonLabel: string
 */
export default function AISkillExtractor({
  onSkillsExtracted,
  initialText = '',
  buttonLabel = 'Extract Skills with AI'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [showReview, setShowReview] = useState(false);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Please describe your background or skills first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await extractSkills(text.trim());
      const skills = res.data?.skills || res.skills || [];

      if (skills.length === 0) {
        setError('No specific skills could be detected. Please try describing your tasks or experience in more detail.');
        return;
      }

      setExtractedSkills(skills);
      setShowReview(true);
    } catch (err) {
      console.error('[AI Skill Extractor Error]:', err);
      setError(err.message || 'Could not extract skills. Please try again or add skills manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySkills = () => {
    if (onSkillsExtracted && extractedSkills.length > 0) {
      onSkillsExtracted(extractedSkills);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowReview(false);
    setError('');
  };

  const handleUpdateSkill = (index, field, value) => {
    const updated = [...extractedSkills];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedSkills(updated);
  };

  const handleRemoveSkill = (index) => {
    setExtractedSkills(extractedSkills.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 border border-[#D2DDD5] bg-white hover:bg-[#FBF9F4] text-[#16382B] font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#C86D51]" />
        <span>{buttonLabel}</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-xl border border-[#E2E7E3]">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6ECE7] text-[#16382B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#C86D51]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">
                  AI Skill Assistant
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {!showReview ? (
              /* Input State */
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Tell us about your experience in your own words (e.g. <em>"I have been stitching clothes for 20 years and I also teach sewing to neighbors"</em>).
                </p>
                <textarea
                  rows="4"
                  placeholder="Describe what you do, how many years you've done it, and any special techniques..."
                  value={text}
                  onChange={(e) => { setText(e.target.value); setError(''); }}
                  className="input-editorial text-sm"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExtract}
                    disabled={loading || !text.trim()}
                    className="btn-primary text-xs py-2.5 px-5 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loading ? 'Analyzing Experience...' : 'Identify Skills'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Edit State */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#16382B] uppercase tracking-wider">
                    Identified Skills ({extractedSkills.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReview(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-[#16382B]"
                  >
                    ← Edit Description
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {extractedSkills.map((sk, idx) => (
                    <div key={idx} className="p-3 bg-[#FBF9F4] rounded-xl border border-[#E2E7E3] flex justify-between items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={sk.name}
                          onChange={(e) => handleUpdateSkill(idx, 'name', e.target.value)}
                          className="font-bold text-sm text-[#16382B] bg-transparent border-b border-dashed border-slate-300 w-full focus:outline-none focus:border-[#16382B]"
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>
                            {sk.experienceYears !== null && sk.experienceYears !== undefined
                              ? `${sk.experienceYears} yrs experience`
                              : 'Experience: Not specified'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#C86D51]">{sk.proficiency || 'Experienced'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-red-700 text-xs p-1"
                        title="Remove skill"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E7E3]">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary text-xs py-2.5 px-4"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySkills}
                    disabled={extractedSkills.length === 0}
                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Use Identified Skills</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
