import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, ShieldCheck, Briefcase, Package, Languages, Calendar, Award, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PublicProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/providers/${id}/public`);
        if (res.data.success) {
          setProvider(res.data.provider);
          setServices(res.data.services || []);
          setProducts(res.data.products || []);
        }
      } catch (err) {
        setError(err.message || 'Could not load provider profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#16382B] font-semibold">Loading provider profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-700 font-bold">{error || 'Provider profile not found.'}</p>
        <button onClick={() => navigate('/explore')} className="btn-secondary text-sm">
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'}
              alt={provider.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#16382B] shadow-sm shrink-0"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                  {provider.name}
                </h1>
                <span className="badge-sage uppercase tracking-wider text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Verified Skill Provider
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#16382B]" /> {provider.location?.city || 'Chennai'}, {provider.location?.state || 'Tamil Nadu'}
                </span>
                <span>•</span>
                <span>Age {provider.age || 62}</span>
                <span>•</span>
                <span className="text-[#C07A46] font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> {provider.rating || 4.8} Trusted Provider
                </span>
              </div>

              {provider.languages && provider.languages.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">Languages Spoken: </span>
                  <span>{provider.languages.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / About Section */}
          <div className="space-y-2 pt-4 border-t border-[#E2E7E3]">
            <h3 className="font-editorial text-xl font-bold text-[#16382B]">About</h3>
            <p className="text-slate-700 leading-relaxed text-base italic">
              "{provider.bio || 'Passionate homemaker and senior citizen sharing lifelong skills with local community members.'}"
            </p>
          </div>

          {/* Skills Badges */}
          {provider.skills && provider.skills.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Skills & Traditional Experience</span>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((s, idx) => (
                  <div key={idx} className="bg-[#FBF9F4] p-3 rounded-xl border border-[#E2E7E3] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#16382B]" />
                    <span className="font-bold text-[#16382B] text-xs">{s.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({s.experienceYears || 10}+ yrs exp)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PUBLISHED OFFERINGS SECTION */}
        <div className="space-y-8">
          
          {/* Services Offered */}
          <div className="space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-[#16382B] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#16382B]" /> Services Offered by {provider.name?.split(' ')[0]} ({services.length})
            </h2>

            {services.length === 0 ? (
              <p className="text-slate-500 text-sm italic bg-white p-6 rounded-2xl border border-[#E2E7E3]">
                No services published currently.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="badge-sage text-xs">{service.category}</span>
                        <span className="font-editorial text-2xl font-bold text-[#16382B]">
                          ₹{service.price} <span className="text-xs text-slate-500 font-sans">/ {service.priceType}</span>
                        </span>
                      </div>
                      <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 text-sm italic line-clamp-2">
                        "{service.description}"
                      </p>
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="btn-primary text-xs py-2.5 text-center mt-2 flex items-center justify-center gap-1"
                    >
                      <span>View Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Offered */}
          <div className="space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-[#16382B] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C86D51]" /> Products Offered by {provider.name?.split(' ')[0]} ({products.length})
            </h2>

            {products.length === 0 ? (
              <p className="text-slate-500 text-sm italic bg-white p-6 rounded-2xl border border-[#E2E7E3]">
                No products published currently.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                          alt={product.name}
                          className="w-20 h-20 rounded-2xl object-cover border shrink-0"
                        />
                        <div>
                          <span className="badge-terracotta text-xs mb-1">{product.category}</span>
                          <h3 className="font-editorial text-xl font-bold text-[#16382B] line-clamp-1">{product.name}</h3>
                          <span className="font-editorial text-xl font-bold text-[#16382B] block mt-1">₹{product.price}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm italic line-clamp-2">
                        "{product.description}"
                      </p>
                    </div>

                    <Link
                      to={`/products/${product._id}`}
                      className="btn-primary text-xs py-2.5 text-center mt-2 flex items-center justify-center gap-1 bg-[#C86D51] hover:bg-[#b55e43]"
                    >
                      <span>View Product</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
