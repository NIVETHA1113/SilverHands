import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ContactProviderModal from '../components/ContactProviderModal';
import { ArrowLeft, Star, ShieldCheck, MapPin, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
        } else {
          setError(res.data.message || 'Service not found.');
        }
      } catch (err) {
        console.error('[Fetch Service Error]:', err.message);
        setError('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FBF9F4]">
        <div className="w-10 h-10 border-4 border-[#16382B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Service Unavailable</h2>
        <p className="text-slate-600 text-sm">{error || 'This service listing could not be found.'}</p>
        <button onClick={() => navigate('/explore')} className="btn-primary text-xs py-2.5 px-5">
          Browse Marketplace
        </button>
      </div>
    );
  }

  const provider = service.providerId || {};
  const serviceImages = service.images && service.images.length > 0
    ? service.images
    : ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'];

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-[#E2E7E3] p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* Top Banner / Image */}
          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#E2E7E3]">
            <img
              src={serviceImages[0]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Category & Pricing */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge-sage text-xs">{service.category}</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-0.5 px-2.5 rounded-full uppercase">
                  Active Service
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                {service.title}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5" /> Offered in {service.location?.city || provider.location?.city || 'Chennai'}
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
                {service.availability?.days?.join(', ') || 'Flexible'}
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
                    <h3 className="font-editorial text-2xl font-bold text-[#16382B]">{provider.name || 'Skilled Provider'}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    📍 {provider.location?.city || 'Chennai'}
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

            <button
              onClick={() => setContactModalOpen(true)}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Provider</span>
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
