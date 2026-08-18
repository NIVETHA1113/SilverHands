import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Check, Eye, Package, Tag, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const productCategories = [
  'Food',
  'Handicrafts',
  'Clothing',
  'Jewellery',
  'Home Decor',
  'Art',
  'Beauty',
  'Traditional Products',
  'Other'
];

const unitOptions = ['piece', 'pack', 'kg', 'box', 'set', 'gm', 'bottle', 'jar'];
const deliveryOptionsList = ['Pickup', 'Local Delivery', 'Shipping'];

const sampleProductImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'
];

export default function ProductForm({ initialData = {}, onSubmit, loading, isEdit = false }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    category: initialData.category || 'Food',
    description: initialData.description || '',
    price: initialData.price || 250,
    quantity: initialData.quantity !== undefined ? initialData.quantity : 10,
    unit: initialData.unit || 'piece',
    images: initialData.images || [sampleProductImages[0]],
    location: initialData.location || (user?.location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' }),
    deliveryOptions: initialData.deliveryOptions || ['Pickup', 'Local Delivery'],
    status: initialData.status || 'published'
  });

  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(formData.images[0] || '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleDeliveryOption = (opt) => {
    if (formData.deliveryOptions.includes(opt)) {
      setFormData({ ...formData, deliveryOptions: formData.deliveryOptions.filter(o => o !== opt) });
    } else {
      setFormData({ ...formData, deliveryOptions: [...formData.deliveryOptions, opt] });
    }
  };

  const handleUpdateImage = (url) => {
    setFormData({ ...formData, images: [url] });
    setImageUrlInput(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleUpdateImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, images: [sampleProductImages[0]] });
    setImageUrlInput('');
  };

  const handleSubmit = (targetStatus = 'published') => {
    if (!formData.name.trim()) {
      setError('Please provide a name for your product.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please tell customers a little about this product.');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (formData.quantity === undefined || Number(formData.quantity) < 0) {
      setError('Please enter a valid inventory quantity.');
      return;
    }

    const qty = Number(formData.quantity);
    let finalStatus = targetStatus;
    if (qty === 0) finalStatus = 'out_of_stock';

    onSubmit({ ...formData, quantity: qty, status: finalStatus });
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
        
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-name">
            Product Name *
          </label>
          <input
            id="product-name"
            type="text"
            name="name"
            required
            placeholder="e.g. Homemade Mango Pickle"
            value={formData.name}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-category">
              Category *
            </label>
            <select
              id="product-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-editorial"
            >
              {productCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-unit">
              Unit Type *
            </label>
            <select
              id="product-unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="input-editorial"
            >
              {unitOptions.map((u, i) => (
                <option key={i} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-price">
              Price (₹) *
            </label>
            <input
              id="product-price"
              type="number"
              name="price"
              required
              min="0"
              placeholder="e.g. 250"
              value={formData.price}
              onChange={handleChange}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-quantity">
              Quantity Available (Stock) *
            </label>
            <input
              id="product-quantity"
              type="number"
              name="quantity"
              required
              min="0"
              placeholder="e.g. 10"
              value={formData.quantity}
              onChange={handleChange}
              className="input-editorial"
            />
            {Number(formData.quantity) === 0 && (
              <p className="text-xs text-amber-700 font-semibold mt-1">
                ⚠️ Setting quantity to 0 will mark product as Out of Stock.
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="product-description">
            Product Description *
          </label>
          <textarea
            id="product-description"
            name="description"
            rows="3"
            required
            placeholder="e.g. Traditional homemade mango pickle prepared using a family recipe with organic spices."
            value={formData.description}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        {/* Product Photos Upload & Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#16382B]">
            Product Photos
          </label>
          <div className="flex items-start gap-4 flex-wrap bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3]">
            <div className="relative group">
              <img
                src={formData.images[0]}
                alt="Product Preview"
                className="w-28 h-28 rounded-2xl object-cover border border-[#E2E7E3] shadow-xs"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                title="Remove Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 min-w-[200px]">
              <div>
                <label className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2 cursor-pointer bg-white">
                  <Upload className="w-4 h-4 text-[#16382B]" />
                  <span>+ Add Product Photos</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400 block mt-1">Supports JPG, PNG, WEBP files</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Or select sample image:</span>
                <div className="flex gap-2">
                  {sampleProductImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Sample ${idx + 1}`}
                      onClick={() => handleUpdateImage(img)}
                      className={`w-10 h-10 rounded-lg object-cover cursor-pointer border ${formData.images[0] === img ? 'border-2 border-[#16382B]' : 'border-slate-200 hover:border-[#16382B]'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider">
            Delivery Options Available:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {deliveryOptionsList.map((opt, idx) => {
              const isSelected = formData.deliveryOptions.includes(opt);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDeliveryOption(opt)}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16382B] text-white border-[#16382B]'
                      : 'bg-white text-slate-700 border-[#D2DDD5]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{opt}</span>
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
          <span>{showPreview ? 'Hide Preview' : 'Show Product Card Preview'}</span>
        </button>
      </div>

      {/* Live Preview Card */}
      {showPreview && (
        <div className="card-editorial bg-[#FBF9F4] p-6 rounded-2xl border border-[#D2DDD5] space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Product Card Preview</span>
          <div className="flex gap-4">
            <img src={formData.images[0]} alt="Preview" className="w-20 h-20 rounded-xl object-cover border" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="badge-sage text-xs mb-1">{formData.category}</span>
                  <h4 className="font-editorial text-xl font-bold text-[#16382B]">{formData.name || 'Product Name'}</h4>
                </div>
                <div className="text-right">
                  <span className="font-editorial text-xl font-bold text-[#16382B]">₹{formData.price || 0}</span>
                  <span className="text-xs text-slate-500 block">per {formData.unit}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic mt-1 font-normal">"{formData.description || 'Description preview...'}"</p>
            </div>
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
          {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
        </button>
      </div>
    </div>
  );
}
