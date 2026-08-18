import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, Star, Briefcase, Package, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
import api from '../services/api';
import SkillPassportCard from '../components/SkillPassportCard';
import ContactProviderModal from '../components/ContactProviderModal';

export default function PublicProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [trust, setTrust] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        // 1. Provider User info
        const userRes = await api.get(`/users/${id}`);
        if (userRes.data.success) {
          setProvider(userRes.data.user);
        }

        // 2. Services
        const svcRes = await api.get('/services', { params: { providerId: id } });
        if (svcRes.data.success) {
          setServices(svcRes.data.services || []);
        }

        // 3. Products
        const prdRes = await api.get('/products', { params: { providerId: id } });
        if (prdRes.data.success) {
          setProducts(prdRes.data.products || []);
        }

        // 4. Trust Summary
        try {
          const trustRes = await api.get(`/users/${id}/trust`);
          if (trustRes.data.success) {
            setTrust(trustRes.data.trust);
          }
        } catch (e) {
          console.warn('[Trust fetch warning]:', e.message);
        }

        // 5. Reviews
        try {
          const revRes = await api.get(`/users/${id}/reviews`);
          if (revRes.data.success) {
            setReviews(revRes.data.reviews || []);
          }
        } catch (e) {
          console.warn('[Reviews fetch warning]:', e.message);
        }
      } catch (err) {
        setError(err.message || 'Could not fetch provider profile.');
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
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setContactModalOpen(true)}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact {provider.name?.split(' ')[0]}</span>
          </button>
        </div>

        {/* 🪪 DIGITAL SKILL PASSPORT CARD */}
        <SkillPassportCard
          provider={provider}
          skills={provider.skills || []}
          servicesCount={services.length}
          productsCount={products.length}
          completedCount={trust ? trust.completedJobs : 0}
          trust={trust}
          aiSummary={provider.bio ? `Specialized in ${provider.skills?.map(s => s.name).join(', ') || 'traditional skills'}. ${provider.bio}` : ''}
          isPublic={true}
        />

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
                        <div>
                          <span className="badge-sage text-xs mb-1">{service.category}</span>
                          <h3 className="font-editorial text-xl font-bold text-[#16382B]">{service.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="font-editorial text-xl font-bold text-[#16382B]">₹{service.price}</span>
                          <span className="text-xs text-slate-500 block">/ {service.priceType}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm italic line-clamp-2">
                        "{service.description}"
                      </p>
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="btn-secondary text-xs py-2.5 text-center mt-2 flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
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
              <Package className="w-5 h-5 text-[#C86D51]" /> Handmade Products ({products.length})
            </h2>

            {products.length === 0 ? (
              <p className="text-slate-500 text-sm italic bg-white p-6 rounded-2xl border border-[#E2E7E3]">
                No products listed currently.
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

          {/* Trust & Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-[#E2E7E3]">
            <h2 className="font-editorial text-2xl font-bold text-[#16382B] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#C07A46] fill-[#C07A46]" /> Community Trust & Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Trust Summary Card */}
              <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Trust</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial text-5xl font-bold text-[#16382B]">
                    {trust && trust.totalReviews > 0 ? trust.avgRating : (provider.rating || 4.8)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">out of 5</span>
                </div>
                <div className="flex gap-1 text-[#C07A46]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(trust && trust.totalReviews > 0 ? trust.avgRating : (provider.rating || 4.8))
                          ? 'fill-current'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Based on {trust ? trust.totalReviews : 0} verified customer reviews.
                </p>
                <div className="pt-3 border-t border-[#F0F4F1] flex items-center gap-2 text-xs font-semibold text-[#16382B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{trust ? trust.completedJobs : 0} completed opportunities</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white p-6 rounded-3xl border border-[#E2E7E3] text-center py-8">
                    <p className="text-slate-500 text-sm italic">No reviews submitted yet for this provider.</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="bg-white p-5 rounded-2xl border border-[#E2E7E3] space-y-2 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-[#16382B]">{rev.customerId?.name || 'Verified Customer'}</span>
                        <div className="flex gap-0.5 text-[#C07A46]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
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
