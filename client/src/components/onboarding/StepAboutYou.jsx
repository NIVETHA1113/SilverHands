import React, { useState } from 'react';
import { User, Phone, Calendar, ArrowRight, AlertCircle, Image as ImageIcon } from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
];

export default function StepAboutYou({ data, onNext }) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    age: data.age || '',
    phone: data.phone || '',
    profileImage: data.profileImage || avatarPresets[0],
    bio: data.bio || ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please tell us your full name.');
      return;
    }
    if (!formData.age || Number(formData.age) < 18 || Number(formData.age) > 100) {
      setError('Please enter a valid age between 18 and 100.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide your phone number so local customers can reach you.');
      return;
    }

    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          Let's start with you
        </h2>
        <p className="text-slate-600 text-base mt-1">
          Tell us a little about yourself. You can always change these details later.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Profile Photo Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#16382B]">
          Profile Photo
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <img
            src={formData.profileImage}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#16382B] shadow-sm"
          />
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Select a friendly photo profile:</p>
            <div className="flex gap-2">
              {avatarPresets.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i + 1}`}
                  onClick={() => setFormData({ ...formData, profileImage: url })}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                    formData.profileImage === url ? 'border-[#16382B] ring-2 ring-[#16382B]/20' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="name">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          placeholder="e.g. Lakshmi Devi"
          value={formData.name}
          onChange={handleChange}
          className="input-editorial"
        />
      </div>

      {/* Age & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="age">
            Your Age *
          </label>
          <input
            id="age"
            type="number"
            name="age"
            required
            min="18"
            max="100"
            placeholder="e.g. 58"
            value={formData.age}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="phone">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            required
            placeholder="e.g. +91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>
      </div>

      {/* Short Bio / Intro */}
      <div>
        <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="bio">
          Short Introduction (Optional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows="3"
          placeholder="e.g. I have been tailoring clothes for 25 years and I love stitching blouses and teaching traditional cooking."
          value={formData.bio}
          onChange={handleChange}
          className="input-editorial"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E2E7E3]">
        <button type="submit" className="btn-primary py-3 px-8 text-base">
          <span>Next: Skills & Experience</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
