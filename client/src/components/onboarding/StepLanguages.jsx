import React, { useState } from 'react';
import { Languages, Plus, ArrowRight, ArrowLeft, AlertCircle, Check } from 'lucide-react';

const commonLanguages = [
  'English',
  'Tamil',
  'Hindi',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi'
];

export default function StepLanguages({ data, onNext, onBack }) {
  const [selectedLanguages, setSelectedLanguages] = useState(data.languages || ['Tamil', 'English']);
  const [customLang, setCustomLang] = useState('');
  const [error, setError] = useState('');

  const toggleLanguage = (lang) => {
    setError('');
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleAddCustomLanguage = (e) => {
    e.preventDefault();
    if (!customLang.trim()) return;
    const formatted = customLang.trim();
    if (!selectedLanguages.includes(formatted)) {
      setSelectedLanguages([...selectedLanguages, formatted]);
    }
    setCustomLang('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLanguages.length === 0) {
      setError('Please select at least one language.');
      return;
    }
    onNext({ languages: selectedLanguages });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          What languages do you speak?
        </h2>
        <p className="text-slate-600 text-base mt-1">
          Select all languages you feel comfortable communicating in.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Language Chips Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
          Common Indian Languages:
        </label>
        <div className="flex flex-wrap gap-3">
          {commonLanguages.map((lang, idx) => {
            const isSelected = selectedLanguages.includes(lang);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`py-3 px-5 rounded-2xl border font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#16382B] text-white border-[#16382B] shadow-xs scale-[1.02]'
                    : 'bg-white text-slate-700 border-[#D2DDD5] hover:border-[#16382B]'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Language Addition */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E7E3] space-y-3">
        <label className="block text-xs font-semibold text-[#16382B]" htmlFor="custom-lang">
          Add another language:
        </label>
        <div className="flex gap-3">
          <input
            id="custom-lang"
            type="text"
            placeholder="e.g. Gujarati, Punjabi"
            value={customLang}
            onChange={(e) => setCustomLang(e.target.value)}
            className="input-editorial text-sm py-2.5 flex-1"
          />
          <button
            type="button"
            onClick={handleAddCustomLanguage}
            className="btn-secondary text-sm py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Selected Summary */}
      <div className="bg-[#E6ECE7] p-4 rounded-xl border border-[#D2DDD5]">
        <span className="text-xs font-bold text-[#16382B] uppercase tracking-wider block mb-1">
          Selected ({selectedLanguages.length}):
        </span>
        <p className="text-sm font-semibold text-[#16382B]">
          {selectedLanguages.join(', ') || 'None selected yet'}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3]">
        <button type="button" onClick={onBack} className="btn-secondary py-3 px-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button type="submit" className="btn-primary py-3 px-8 text-base">
          <span>Next: Preferences & Availability</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
