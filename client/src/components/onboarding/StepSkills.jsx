import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Edit2, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const predefinedSkills = [
  { name: 'Traditional Cooking', category: 'Food & Cooking' },
  { name: 'Blouse Stitching & Tailoring', category: 'Fashion & Tailoring' },
  { name: 'Home Tuition & Mentoring', category: 'Education & Tutoring' },
  { name: 'Gardening Assistance', category: 'Home & Nature' },
  { name: 'Handicrafts & Embroidery', category: 'Arts & Crafts' },
  { name: 'Homemade Pickles & Snacks', category: 'Food & Cooking' },
  { name: 'Childcare & Storytelling', category: 'Care & Service' },
  { name: 'Language Training (Tamil/Hindi)', category: 'Education & Tutoring' },
  { name: 'Baking & Confectionery', category: 'Food & Cooking' },
  { name: 'Beauty Services & Mehendi', category: 'Personal Care' }
];

const proficiencies = ['Beginner', 'Intermediate', 'Experienced', 'Expert'];

export default function StepSkills({ data, onNext, onBack }) {
  const [skills, setSkills] = useState(data.skills || []);
  const [error, setError] = useState('');

  // Skill Form State
  const [currentSkill, setCurrentSkill] = useState({
    name: '',
    category: 'General',
    experienceYears: 5,
    proficiency: 'Experienced'
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  // AI Extraction State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddOrUpdateSkill = (e) => {
    e.preventDefault();
    if (!currentSkill.name.trim()) {
      setError('Please select or type a skill name.');
      return;
    }

    if (editingIndex >= 0) {
      const updated = [...skills];
      updated[editingIndex] = currentSkill;
      setSkills(updated);
      setEditingIndex(-1);
    } else {
      setSkills([...skills, currentSkill]);
    }

    setCurrentSkill({ name: '', category: 'General', experienceYears: 5, proficiency: 'Experienced' });
    setError('');
  };

  const handleEditSkill = (index) => {
    setCurrentSkill(skills[index]);
    setEditingIndex(index);
  };

  const handleDeleteSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAiExtract = async () => {
    if (!aiText.trim()) return;
    try {
      setAiLoading(true);
      const res = await api.post('/ai/extract-skills', { text: aiText });
      if (res.data.success && res.data.skills?.length > 0) {
        setSkills([...skills, ...res.data.skills]);
        setShowAiModal(false);
        setAiText('');
      }
    } catch (err) {
      setError('AI extraction could not identify skills. Please add your skills manually below.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitStep = () => {
    if (skills.length === 0) {
      setError('Please add at least one skill to continue.');
      return;
    }
    onNext({ skills });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          What are you good at?
        </h2>
        <p className="text-slate-600 text-base mt-1">
          Tell us about the skills you've built over the years.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* AI Assistant Banner Option */}
      <div className="bg-[#E6ECE7] p-5 rounded-2xl border border-[#D2DDD5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#C86D51] tracking-wider uppercase block">
            Easy Skill Assistant
          </span>
          <p className="text-sm font-semibold text-[#16382B]">
            Not sure how to describe your skills?
          </p>
          <p className="text-xs text-slate-600">
            Tell us naturally about your experience in your own words.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="btn-secondary text-xs py-2.5 px-4 bg-white text-[#16382B] border border-[#16382B]/30 hover:bg-white shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#C86D51]" />
          <span>Tell us in your own words</span>
        </button>
      </div>

      {/* Selected Skills Cards */}
      {skills.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
            Your Selected Skills ({skills.length}):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((sk, idx) => (
              <div key={idx} className="card-editorial p-4 bg-white border border-[#E2E7E3] rounded-xl flex justify-between items-center shadow-xs">
                <div>
                  <h4 className="font-bold text-[#16382B] text-base">{sk.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-[#E6ECE7] text-[#16382B] px-2 py-0.5 rounded-md font-semibold">
                      {sk.experienceYears} yrs experience
                    </span>
                    <span className="bg-amber-50 text-[#C07A46] px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                      {sk.proficiency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditSkill(idx)}
                    className="p-1.5 text-slate-500 hover:text-[#16382B] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-700 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Skill Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E7E3] space-y-4">
        <h3 className="font-editorial text-lg font-bold text-[#16382B]">
          {editingIndex >= 0 ? 'Edit Skill Details' : 'Add a Skill'}
        </h3>

        {/* Quick Predefined Skill Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Popular Traditional Skills (Click to choose):
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedSkills.map((ps, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSkill({ ...currentSkill, name: ps.name, category: ps.category })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  currentSkill.name === ps.name
                    ? 'bg-[#16382B] text-white border-[#16382B]'
                    : 'bg-[#F5F2EA] text-slate-700 border-[#D2DDD5] hover:border-[#16382B]'
                }`}
              >
                + {ps.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-[#16382B] mb-1">Skill Name</label>
            <input
              type="text"
              placeholder="e.g. Blouse Stitching"
              value={currentSkill.name}
              onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
              className="input-editorial text-sm py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16382B] mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="60"
              value={currentSkill.experienceYears}
              onChange={(e) => setCurrentSkill({ ...currentSkill, experienceYears: Number(e.target.value) })}
              className="input-editorial text-sm py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#16382B] mb-1">Proficiency Level</label>
            <select
              value={currentSkill.proficiency}
              onChange={(e) => setCurrentSkill({ ...currentSkill, proficiency: e.target.value })}
              className="input-editorial text-sm py-2.5"
            >
              {proficiencies.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddOrUpdateSkill}
          className="btn-secondary text-sm py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          <span>{editingIndex >= 0 ? 'Update Skill' : 'Add Skill'}</span>
        </button>
      </div>

      {/* AI Extraction Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl border border-[#E2E7E3]">
            <div className="flex justify-between items-center">
              <h3 className="font-editorial text-xl font-bold text-[#16382B] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C86D51]" />
                Describe Your Experience
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <p className="text-xs text-slate-600">
              Type naturally e.g. "I've been cooking traditional South Indian meals for 20 years and tailoring blouses for my neighbors."
            </p>
            <textarea
              rows="4"
              placeholder="Tell us what you've done..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              className="input-editorial text-sm"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAiModal(false)} className="text-slate-600 font-semibold text-sm px-4">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={aiLoading}
                className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50"
              >
                {aiLoading ? 'Analyzing...' : 'Extract Skills ✨'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3]">
        <button type="button" onClick={onBack} className="btn-secondary py-3 px-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button type="button" onClick={handleSubmitStep} className="btn-primary py-3 px-8 text-base">
          <span>Next: Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
