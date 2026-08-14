import React, { useState } from 'react';
import { Briefcase, Calendar, Clock, ArrowRight, ArrowLeft, AlertCircle, Check } from 'lucide-react';

const workModesList = ['Home-based', 'In-person', 'Online', 'Either'];

const opportunityTypesList = [
  'Services',
  'Teaching',
  'Mentoring',
  'Consulting',
  'Handmade Products',
  'Part-time Work',
  'Flexible Work'
];

const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timesList = ['Morning', 'Afternoon', 'Evening', 'Flexible'];

export default function StepPreferences({ data, onNext, onBack }) {
  const [workPreferences, setWorkPreferences] = useState(
    data.workPreferences || ['Home-based']
  );
  const [interestedIn, setInterestedIn] = useState(
    data.interestedIn || ['Services', 'Flexible Work']
  );
  const [selectedDays, setSelectedDays] = useState(
    data.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );
  const [selectedTimes, setSelectedTimes] = useState(
    data.availability?.timePreferences || ['Flexible']
  );

  const [error, setError] = useState('');

  const toggleArrayItem = (item, currentList, setter) => {
    setError('');
    if (currentList.includes(item)) {
      setter(currentList.filter(i => i !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workPreferences.length === 0) {
      setError('Please select how you would like to work.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one day you are available.');
      return;
    }

    onNext({
      workPreferences,
      interestedIn,
      availability: {
        days: selectedDays,
        timePreferences: selectedTimes,
        preferredTime: selectedTimes[0] || 'Flexible',
        workPreference: workPreferences[0] || 'Home-based'
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          Preferences & Availability
        </h2>
        <p className="text-slate-600 text-base mt-1">
          Tell us your work preferences and when you are usually free.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* 1. Work Mode */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
          1. How would you like to work? *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {workModesList.map((mode, idx) => {
            const isSelected = workPreferences.includes(mode);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleArrayItem(mode, workPreferences, setWorkPreferences)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#16382B] text-white border-[#16382B] shadow-xs'
                    : 'bg-white text-slate-700 border-[#D2DDD5] hover:border-[#16382B]'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                <span>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Opportunities Interested In */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
          2. What kind of opportunities interest you?
        </label>
        <div className="flex flex-wrap gap-2.5">
          {opportunityTypesList.map((opp, idx) => {
            const isSelected = interestedIn.includes(opp);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleArrayItem(opp, interestedIn, setInterestedIn)}
                className={`py-2.5 px-4 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C86D51] text-white border-[#C86D51]'
                    : 'bg-white text-slate-700 border-[#D2DDD5] hover:border-[#C86D51]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{opp}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Availability Days */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
          3. Available Days *
        </label>
        <div className="flex flex-wrap gap-2">
          {daysList.map((day, idx) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleArrayItem(day, selectedDays, setSelectedDays)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#16382B] text-white border-[#16382B]'
                    : 'bg-white text-slate-700 border-[#D2DDD5] hover:border-[#16382B]'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Preferred Time */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
          4. Preferred Time of Day
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timesList.map((time, idx) => {
            const isSelected = selectedTimes.includes(time);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleArrayItem(time, selectedTimes, setSelectedTimes)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E6ECE7] text-[#16382B] border-[#16382B]'
                    : 'bg-white text-slate-600 border-[#D2DDD5]'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3]">
        <button type="button" onClick={onBack} className="btn-secondary py-3 px-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button type="submit" className="btn-primary py-3 px-8 text-base">
          <span>Next: Review Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
