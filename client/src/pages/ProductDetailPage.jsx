import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, ShieldCheck, Star, MessageSquare, Tag } from 'lucide-react';
import api from '../services/api';
import ContactProviderModal from '../components/ContactProviderModal';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../utils/haversine';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(err.message || 'Could not load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#16382B] font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-700 font-bold">{error || 'Product not found.'}</p>
        <button onClick={() => navigate('/explore')} className="btn-secondary text-sm">
          Back to Explore
        </button>
      </div>
    );
  }

  const provider = product.providerId || {};
  const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';
  const dist = calculateDistance(
    user?.location?.latitude,
    user?.location?.longitude,
    product.location?.latitude || provider.location?.latitude,
    product.location?.longitude || provider.location?.longitude
  );

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        {/* Main Product Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                alt={product.name}
                className="w-full h-80 rounded-2xl object-cover border border-[#E2E7E3]"
              />
              {isOutOfStock ? (
                <span className="absolute top-4 right-4 bg-red-700 text-white text-xs font-bold py-1.5 px-4 rounded-full uppercase shadow-md">
                  Out of Stock
                </span>
              ) : (
                <span className="absolute top-4 right-4 bg-white/95 text-[#16382B] text-xs font-bold py-1.5 px-3 rounded-full shadow-xs">
                  📦 {product.quantity} {product.unit}s available
                </span>
              )}
            </div>

            {/* Title & Details */}
            <div className="space-y-5">
              <div>
                <span className="badge-terracotta uppercase tracking-wider text-xs mb-1">{product.category}</span>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-2 font-semibold mt-1">
                  <span className="flex items-center gap-1 text-[#16382B]">
                    <MapPin className="w-4 h-4" /> {product.location?.city || provider.location?.city || 'Chennai'}
                    {dist ? ` (${dist} km away)` : ''}
                  </span>
                  <span>•</span>
                  <span>Handmade by {provider.name || 'Skill Provider'}</span>
                </p>
              </div>

              <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3] inline-block">
                <span className="text-xs text-slate-500 uppercase font-bold block">Price</span>
                <span className="font-editorial text-3xl font-bold text-[#16382B]">₹{product.price}</span>
                <span className="text-xs text-slate-500 font-medium ml-1">per {product.unit}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E7E3]">
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">Description</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Delivery Options</span>
                <div className="flex flex-wrap gap-2">
                  {product.deliveryOptions?.map((opt, i) => (
                    <span key={i} className="py-1 px-3 rounded-lg bg-[#E6ECE7] text-xs font-bold text-[#16382B]">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Provider Summary Card */}
          <div className="bg-[#E6ECE7] p-6 rounded-3xl border border-[#D2DDD5] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                  alt={provider.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#16382B]"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-editorial text-2xl font-bold text-[#16382B]">{provider.name || 'Craft Artisan'}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    📍 {provider.location?.city || 'Chennai'}
                  </p>
                  <p className="text-xs text-[#C07A46] font-bold flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> {provider.rating || 4.8} Trusted Seller
                  </p>
                </div>
              </div>

              <Link
                to={`/providers/${provider._id}`}
                className="btn-secondary text-xs py-2.5 px-5 bg-white shrink-0"
              >
                View Seller Profile
              </Link>
            </div>

            <button
              disabled={isOutOfStock}
              onClick={() => setContactModalOpen(true)}
              className={`w-full py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
                isOutOfStock
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'btn-primary bg-[#C86D51] hover:bg-[#b55e43] shadow-xs'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isOutOfStock ? 'Product Out of Stock' : 'Contact Seller'}</span>
            </button>
          </div>

        </div>

      </div>

      {contactModalOpen && (
        <ContactProviderModal
          provider={provider}
          onClose={() => setContactModalOpen(false)}
        />
      )}
    </div>
  );
}
