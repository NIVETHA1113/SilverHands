import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, MapPin, Clock, Tag, Check, Eye } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const serviceCategories = [
  'Cooking',
  'Tailoring',
  'Teaching',
  'Tutoring',
  'Gardening',
  'Childcare',
  'Handicrafts',
  'Music',
  'Dance',
  'Traditional Arts',
  'Beauty Services',
  'Language Training',
  'Consulting',
  'Other'
];

const priceTypes = ['Per Hour', 'Per Session', 'Per Item', 'Starting From', 'Custom'];
const deliveryModeOptions = ['Online', 'In Person', 'Home Based', 'Customer Location'];

export default function ServiceForm({ initialData = {}, onSubmit, loading, isEdit = false }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || 'Tailoring',
    description: initialData.description || '',
    skills: initialData.skills || (user?.skills?.map(s => s.name) || ['Tailoring']),
    price: initialData.price || 500,
    priceType: initialData.priceType || 'Per Item',
    location: initialData.location || (user?.location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' }),
    availability: initialData.availability || (user?.availability || { days: ['Saturday', 'Sunday'], timePreferences: ['Flexible'] }),
    deliveryMode: initialData.deliveryMode || ['Home Based'],
    images: initialData.images || ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'],
    status: initialData.status || 'published'
  });

  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleDeliveryMode = (mode) => {
    if (formData.deliveryMode.includes(mode)) {
      setFormData({ ...formData, deliveryMode: formData.deliveryMode.filter(m => m !== mode) });
    } else {
      setFormData({ ...formData, deliveryMode: [...formData.deliveryMode, mode] });
    }
  };

  const handleImproveWithAi = async () => {
    if (!formData.title.trim()) {
      setError('Please enter a service title first before improving description with AI.');
      return;
    }

    try {
      setAiLoading(true);
      const res = await api.post('/ai/generate-service-description', {
        title: formData.title,
        basicNotes: formData.description,
        category: formData.category
      });
      if (res.data.success && res.data.description) {
        setFormData({ ...formData, description: res.data.description });
      }
    } catch (err) {
      setError('Could not generate description right now. Please type your description manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (targetStatus = 'published') => {
    if (!formData.title.trim()) {
      setError('Please provide a title for your service.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please tell customers a little about this service.');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    onSubmit({ ...formData, status: targetStatus });
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Form Inputs */}
      <div className="space-y-6">
        
        {/* Service Title */}
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="service-title">
            Service Title *
          </label>
          <input
            id="service-title"
            type="text"
            name="title"
            required
            placeholder="e.g. Traditional Blouse Stitching"
            value={formData.title}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        {/* Category & Price Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="service-category">
              Category *
            </label>
            <select
              id="service-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-editorial"
            >
              {serviceCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="priceType">
              Pricing Structure *
            </label>
            <select
              id="priceType"
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              className="input-editorial"
            >
              {priceTypes.map((pt, i) => (
                <option key={i} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="service-price">
            Price (₹) *
          </label>
          <input
            id="service-price"
            type="number"
            name="price"
            required
            min="0"
            placeholder="e.g. 500"
            value={formData.price}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        {/* Description with AI Improver */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-semibold text-[#16382B]" htmlFor="service-description">
              Service Description *
            </label>
            <button
              type="button"
              onClick={handleImproveWithAi}
              disabled={aiLoading}
              className="text-xs font-bold text-[#C86D51] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Improving...' : 'Improve with AI'}</span>
            </button>
          </div>
          <textarea
            id="service-description"
            name="description"
            rows="4"
            required
            placeholder="e.g. Custom blouse stitching with careful fitting and traditional design options."
            value={formData.description}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        {/* Delivery Modes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
            How would you like to provide this service?
          </label>
          <div className="flex flex-wrap gap-2.5">
            {deliveryModeOptions.map((mode, idx) => {
              const isSelected = formData.deliveryMode.includes(mode);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDeliveryMode(mode)}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16382B] text-white border-[#16382B]'
                      : 'bg-white text-slate-700 border-[#D2DDD5]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Live Preview Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs font-bold text-[#16382B] hover:text-[#C86D51] flex items-center gap-1 border border-[#D2DDD5] px-3.5 py-2 rounded-xl bg-white"
        >
          <Eye className="w-4 h-4" />
          <span>{showPreview ? 'Hide Preview' : 'Show Customer Card Preview'}</span>
        </button>
      </div>

      {/* Live Preview Card */}
      {showPreview && (
        <div className="card-editorial bg-[#FBF9F4] p-6 rounded-2xl border border-[#D2DDD5] space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Card Preview</span>
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="badge-sage text-xs mb-1">{formData.category}</span>
              <h4 className="font-editorial text-xl font-bold text-[#16382B]">{formData.title || 'Service Title'}</h4>
            </div>
            <div className="text-right">
              <span className="font-editorial text-xl font-bold text-[#16382B]">₹{formData.price || 0}</span>
              <span className="text-xs text-slate-500 block">/ {formData.priceType}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 italic">"{formData.description || 'Description preview...'}"</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-[#E2E7E3]">
            <span>📍 {formData.location?.city || 'Chennai'}</span>
            <span>Available: {formData.availability?.days?.join(', ') || 'Weekends'}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#E2E7E3]">
        <button
          type="button"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          className="btn-secondary py-3 px-6 text-sm"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={loading}
          className="btn-primary py-3.5 px-8 text-base shadow-sm"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Publish Service'}
        </button>
      </div>
    </div>
  );
}
