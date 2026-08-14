import React from 'react';
import { User, MapPin, Languages, Briefcase, Calendar, Star, CheckCircle, ArrowLeft, Edit2 } from 'lucide-react';

export default function StepReview({ data, onComplete, onGoToStep, loading }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          Profile Review
        </h2>
        <p className="text-slate-600 text-base mt-1">
          Review your SilverHands provider profile before finalizing.
        </p>
      </div>

      {/* Summary Card */}
      <div className="card-editorial bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E7E3] space-y-6 shadow-sm">
        
        {/* Header User Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E2E7E3]">
          <div className="flex items-center gap-4">
            <img
              src={data.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
              alt={data.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#16382B]"
            />
            <div>
              <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                {data.name || 'Provider Name'}
              </h3>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-0.5">
                <span>Age: {data.age || 58}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#16382B]" />
                  {data.location?.city || 'Chennai'}, {data.location?.state || 'Tamil Nadu'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs font-bold text-[#16382B] hover:text-[#C86D51] flex items-center gap-1 border border-[#D2DDD5] px-3 py-1.5 rounded-lg"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Basic Info
          </button>
        </div>

        {/* Bio */}
        {data.bio && (
          <div className="bg-[#FBF9F4] p-4 rounded-xl border border-[#E2E7E3]">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">About Me</p>
            <p className="text-sm text-slate-700 italic">"{data.bio}"</p>
          </div>
        )}

        {/* Skills Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-[#16382B] text-sm uppercase tracking-wider">
              Skills ({data.skills?.length || 0})
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs text-[#16382B] font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.skills?.map((sk, idx) => (
              <div key={idx} className="bg-[#E6ECE7]/60 p-3 rounded-xl border border-[#D2DDD5] flex justify-between items-center">
                <span className="font-bold text-[#16382B] text-sm">{sk.name}</span>
                <span className="text-xs font-semibold bg-white text-[#16382B] px-2 py-0.5 rounded-md border border-[#C5D5C9]">
                  {sk.experienceYears} yrs • {sk.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Languages & Location Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#E2E7E3]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#16382B] text-xs uppercase tracking-wider">
                Languages Spoken
              </h4>
              <button onClick={() => onGoToStep(4)} className="text-xs text-[#16382B] font-semibold hover:underline">
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.languages?.map((lang, idx) => (
                <span key={idx} className="badge-sage text-xs">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#16382B] text-xs uppercase tracking-wider">
                Work Mode & Availability
              </h4>
              <button onClick={() => onGoToStep(5)} className="text-xs text-[#16382B] font-semibold hover:underline">
                Edit
              </button>
            </div>
            <p className="text-xs text-slate-700 font-semibold">
              Mode: {data.workPreferences?.join(', ') || 'Home-based'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Days: {data.availability?.days?.join(', ') || 'Mon-Fri'} ({data.availability?.timePreferences?.join(', ') || 'Flexible'})
            </p>
          </div>
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3]">
        <button type="button" onClick={() => onGoToStep(5)} className="btn-secondary py-3 px-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Preferences</span>
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={loading}
          className="btn-primary py-3.5 px-9 text-base shadow-md disabled:opacity-50"
        >
          {loading ? 'Completing Profile...' : 'Complete Profile ✓'}
        </button>
      </div>
    </div>
  );
}
