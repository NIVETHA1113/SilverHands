import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityAPI } from '../../services/api';
import { ArrowLeft, Briefcase, Plus, X } from 'lucide-react';

const CATEGORIES = [
  'Cooking', 'Tailoring', 'Teaching', 'Tutoring', 'Gardening',
  'Handicrafts', 'Music', 'Dance', 'Traditional Arts', 'Beauty',
  'Language Training', 'Consulting', 'Cleaning', 'Caregiving', 'Other'
];

const AVAILABILITY_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Weekdays', 'Weekends', 'Flexible', 'Morning', 'Afternoon', 'Evening'
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_day', label: 'Per Day' },
];

export default function OpportunityCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budgetType: 'fixed',
    locationCity: user?.location?.city || '',
    availability: [],
    skillInput: '',
    skills: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (user?.role !== 'customer') {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center max-w-sm">
          <p className="text-slate-600">Only customers can post opportunities.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm py-2 px-5">Go Back</button>
        </div>
      </div>
    );
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !form.skills.includes(s)) {
      set('skills', [...form.skills, s]);
    }
    set('skillInput', '');
  };

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill));

  const toggleAvailability = (opt) => {
    set('availability', form.availability.includes(opt)
      ? form.availability.filter(a => a !== opt)
      : [...form.availability, opt]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.budget) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        skills: form.skills,
        budget: Number(form.budget),
        budgetType: form.budgetType,
        location: { city: form.locationCity.trim() },
        availability: form.availability,
      };
      const res = await opportunityAPI.create(payload);
      if (res.data.success) {
        navigate('/opportunities/my');
      }
    } catch (err) {
      setError(err.message || 'Failed to create opportunity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-[#E6ECE7] text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-editorial text-3xl font-bold text-[#16382B]">Post an Opportunity</h1>
            <p className="text-slate-600 text-sm mt-1">Describe what you need — providers will apply to help you.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E2E7E3] p-8 space-y-7 shadow-xs">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#16382B]">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Need a blouse stitching expert for saree function"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="input-editorial"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#16382B]">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              placeholder="Describe exactly what you need, including any specific requirements, timing, or preferences..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="input-editorial resize-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#16382B]">Category <span className="text-red-500">*</span></label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="input-editorial"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#16382B]">Budget (₹) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
                className="input-editorial"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#16382B]">Budget Type</label>
              <select
                value={form.budgetType}
                onChange={e => set('budgetType', e.target.value)}
                className="input-editorial"
              >
                {BUDGET_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#16382B]">City</label>
            <input
              type="text"
              placeholder="e.g. Chennai"
              value={form.locationCity}
              onChange={e => set('locationCity', e.target.value)}
              className="input-editorial"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#16382B]">Skills Required</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Blouse stitching"
                value={form.skillInput}
                onChange={e => set('skillInput', e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="input-editorial flex-1"
              />
              <button type="button" onClick={addSkill} className="btn-secondary text-sm py-2 px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 badge-sage text-xs px-3 py-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#16382B]">Availability</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleAvailability(opt)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    form.availability.includes(opt)
                      ? 'bg-[#16382B] text-white border-[#16382B]'
                      : 'bg-white text-slate-600 border-[#E2E7E3] hover:border-[#16382B]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary py-3.5 px-8 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>{saving ? 'Posting...' : 'Post Opportunity'}</span>
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm py-3.5 px-6">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
