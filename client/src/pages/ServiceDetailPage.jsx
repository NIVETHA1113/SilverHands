import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, ShieldCheck, Star, Briefcase, Check, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../utils/haversine';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactNotice, setContactNotice] = useState(false);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
        }
      } catch (err) {
        setError(err.message || 'Could not load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#16382B] font-semibold">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-700 font-bold">{error || 'Service not found.'}</p>
        <button onClick={() => navigate('/explore')} className="btn-secondary text-sm">
          Back to Explore
        </button>
      </div>
    );
  }

  const provider = service.providerId || {};
  const dist = calculateDistance(
    user?.location?.latitude,
    user?.location?.longitude,
    service.location?.latitude || provider.location?.latitude,
    service.location?.longitude || provider.location?.longitude
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

        {/* Main Service Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="badge-sage uppercase tracking-wider text-xs">{service.category}</span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                {service.title}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2 font-semibold">
                <span className="flex items-center gap-1 text-[#16382B]">
                  <MapPin className="w-4 h-4" /> {service.location?.city || provider.location?.city || 'Chennai'}
                  {dist ? ` (${dist} km away)` : ''}
                </span>
                <span>•</span>
                <span>Offered by {provider.name || 'Skill Provider'}</span>
              </p>
            </div>

            <div className="bg-[#FBF9F4] p-5 rounded-2xl border border-[#E2E7E3] text-center sm:text-right shrink-0">
              <span className="text-xs text-slate-500 uppercase font-bold block">Pricing</span>
              <span className="font-editorial text-3xl font-bold text-[#16382B]">₹{service.price}</span>
              <span className="text-xs text-slate-500 block font-medium">/ {service.priceType}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2 border-t border-[#E2E7E3]">
            <h3 className="font-editorial text-xl font-bold text-[#16382B]">About this Service</h3>
            <p className="text-slate-700 leading-relaxed text-base">
              {service.description}
            </p>
          </div>

          {/* Key Service Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FBF9F4] p-5 rounded-2xl border border-[#E2E7E3]">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Service Delivery Mode</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {service.deliveryMode?.map((mode, i) => (
                  <span key={i} className="py-1 px-3 rounded-lg bg-white border border-[#D2DDD5] text-xs font-bold text-[#16382B]">
                    {mode}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Availability</span>
              <p className="text-xs font-bold text-[#16382B] mt-1.5">
                {service.availability?.days?.join(', ') || 'Weekends'}
              </p>
            </div>
          </div>

          {/* Skills Used */}
          {service.skills && service.skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Skills & Expertise Used</span>
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill, idx) => (
                  <span key={idx} className="badge-sage text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

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
                    <h3 className="font-editorial text-2xl font-bold text-[#16382B]">{provider.name || 'Lakshmi Ammal'}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    📍 {provider.location?.city || 'Chennai'} • Age {provider.age || 62}
                  </p>
                  <p className="text-xs text-[#C07A46] font-bold flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> {provider.rating || 4.9} Trusted Provider
                  </p>
                </div>
              </div>

              <Link
                to={`/providers/${provider._id}`}
                className="btn-secondary text-xs py-2.5 px-5 bg-white shrink-0"
              >
                View Provider Profile
              </Link>
            </div>

            {/* Action Notice */}
            {contactNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                ℹ️ Direct customer request system will open in Phase 5. You can view {provider.name}'s verified profile today!
              </div>
            )}

            <button
              onClick={() => setContactNotice(true)}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Provider</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
