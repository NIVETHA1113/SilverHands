import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { calculateProfileCompletion } from '../utils/profileUtils';
import api from '../services/api';
import { ShieldCheck, Star, Sparkles, MapPin, Search, Utensils, Scissors, BookOpen, Gift, Sprout, ArrowRight, CheckCircle2, Briefcase, Package, Plus, Eye, Compass, UserCheck } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProvider = user?.role === 'provider';

  const completionPercentage = calculateProfileCompletion(user);
  const isProfileComplete = completionPercentage === 100 || user?.onboarding?.completed;

  // Services & Products count state
  const [servicesCount, setServicesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isProvider && (user?._id || user?.id)) {
      const pId = user._id || user.id;
      const fetchCounts = async () => {
        try {
          const [sRes, pRes] = await Promise.all([
            api.get(`/services?providerId=${pId}`),
            api.get(`/products?providerId=${pId}`)
          ]);
          if (sRes.data.success) {
            setServicesCount(sRes.data.services.filter(s => s.status === 'published').length);
          }
          if (pRes.data.success) {
            setProductsCount(pRes.data.products.filter(p => p.status === 'published').length);
          }
        } catch (err) {
          console.error('[Dashboard Counts Error]:', err.message);
        }
      };
      fetchCounts();
    }
  }, [isProvider, user]);

  const handleCustomerSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Editorial Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#16382B] shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                  Welcome back, {user?.name || 'Friend'} 👋
                </h1>
                <span className="badge-sage uppercase tracking-wider text-xs">
                  {isProvider ? 'Skill Provider' : 'Customer'}
                </span>
              </div>
              <p className="text-slate-600 text-base font-normal">
                {isProvider
                  ? 'Manage your traditional skill offerings, products, and profile.'
                  : 'Discover trusted traditional services and homemade goods near you.'}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Phone Verified
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#16382B]" /> {user?.location?.city || 'Chennai'}
                </span>
                <span className="inline-flex items-center gap-1 text-[#C07A46]">
                  <Star className="w-4 h-4 fill-current text-[#C07A46]" /> {user?.rating || 4.8}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#E6ECE7] px-5 py-3 rounded-2xl border border-[#D2DDD5] text-center md:text-right shrink-0">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#C86D51] block">Profile Completion</span>
            <span className="font-editorial text-xl font-bold text-[#16382B]">{completionPercentage}%</span>
          </div>
        </div>

        {/* ROLE-SPECIFIC DASHBOARD CONTENT */}
        {isProvider ? (
          /* PROVIDER DASHBOARD */
          <div className="space-y-8">
            
            {/* PROFILE COMPLETION CARD */}
            {!isProfileComplete ? (
              <div className="bg-[#E6ECE7] p-8 rounded-3xl border border-[#D0DDD4] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="badge-terracotta uppercase tracking-wider text-xs">Action Required</span>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">
                    Complete your profile
                  </h2>
                  <p className="text-slate-700 text-sm max-w-xl">
                    Add your traditional skills and experience to start discovering local opportunities and earning income.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-48 h-2 bg-white rounded-full overflow-hidden border border-[#CBD8CE]">
                      <div
                        className="h-full bg-[#16382B] transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#16382B]">{completionPercentage}% Completed</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="btn-primary py-3.5 px-7 rounded-xl text-base shadow-sm shrink-0"
                >
                  <span>Continue Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* WHAT WOULD YOU LIKE TO OFFER SECTION */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#C86D51] tracking-widest uppercase block">
                Provider Offerings & Listings
              </span>
              <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
                What would you like to offer today?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Offer a Service Card */}
                <div className="card-editorial bg-white p-7 rounded-3xl border border-[#E2E7E3] space-y-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E6ECE7] text-[#16382B] flex items-center justify-center border border-[#D2DDD5]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                        Offer a Service
                      </h3>
                      <p className="text-slate-600 text-sm mt-1">
                        Share your skills, traditional knowledge, tailoring, cooking, or tutoring expertise with local neighbors.
                      </p>
                    </div>
                    <div className="bg-[#FBF9F4] p-3 rounded-xl border border-[#E2E7E3] inline-block">
                      <span className="text-xs text-slate-500 font-medium">Published Services: </span>
                      <span className="font-bold text-[#16382B] text-sm">{servicesCount} Active</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => navigate('/provider/services/new')}
                      className="btn-primary text-sm py-2.5 px-5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>
                    <button
                      onClick={() => navigate('/provider/services')}
                      className="btn-secondary text-sm py-2.5 px-4"
                    >
                      Manage Services
                    </button>
                  </div>
                </div>

                {/* Sell a Product Card */}
                <div className="card-editorial bg-white p-7 rounded-3xl border border-[#E2E7E3] space-y-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF0EC] text-[#C86D51] flex items-center justify-center border border-[#F8DACE]">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                        Sell a Product
                      </h3>
                      <p className="text-slate-600 text-sm mt-1">
                        Sell something you make or prepare, such as homemade pickles, traditional snacks, bags, or handicrafts.
                      </p>
                    </div>
                    <div className="bg-[#FBF9F4] p-3 rounded-xl border border-[#E2E7E3] inline-block">
                      <span className="text-xs text-slate-500 font-medium">Published Products: </span>
                      <span className="font-bold text-[#16382B] text-sm">{productsCount} Active</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => navigate('/provider/products/new')}
                      className="btn-primary text-sm py-2.5 px-5 bg-[#C86D51] hover:bg-[#b55e43]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                    <button
                      onClick={() => navigate('/provider/products')}
                      className="btn-secondary text-sm py-2.5 px-4"
                    >
                      Manage Products
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* SEE HOW YOUR OFFERINGS LOOK TO CUSTOMERS SECTION */}
            <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6ECE7] text-[#16382B] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                    See how your offerings look to customers
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Preview your published services, products, and public profile exactly as local customers see them.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate('/explore?tab=services')}
                  className="btn-secondary text-xs py-2.5 px-4 bg-white"
                >
                  <Briefcase className="w-4 h-4 text-[#16382B]" />
                  <span>View My Services</span>
                </button>
                <button
                  onClick={() => navigate('/explore?tab=products')}
                  className="btn-secondary text-xs py-2.5 px-4 bg-white"
                >
                  <Package className="w-4 h-4 text-[#C86D51]" />
                  <span>View My Products</span>
                </button>
                {user?._id && (
                  <button
                    onClick={() => navigate(`/providers/${user._id}`)}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>View Public Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Minimal Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Profile Status', value: `${completionPercentage}%`, sub: isProfileComplete ? 'Complete' : 'In Progress' },
                { label: 'Opportunities', value: '5', sub: 'Matched nearby' },
                { label: 'Active Services', value: `${servicesCount}`, sub: 'Published' },
                { label: 'Active Products', value: `${productsCount}`, sub: 'Published' },
                { label: 'Pending Requests', value: '0', sub: 'Phase 5' },
                { label: 'Rating', value: '⭐ 4.8', sub: 'Trusted Status' },
              ].map((m, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E2E7E3] text-center shadow-2xs">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                  <p className="font-editorial text-2xl font-bold text-[#16382B] mt-1">{m.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* CUSTOMER DASHBOARD */
          <div className="space-y-8">
            
            {/* Search Prompt Box */}
            <div className="bg-white p-8 rounded-3xl border border-[#E2E7E3] space-y-4">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B]">
                What service or product are you looking for today?
              </h2>
              <p className="text-slate-600 text-base">
                Find trusted home cooks, language tutors, blouse tailors, and handmade crafts in {user?.location?.city || 'Chennai'}.
              </p>

              <form onSubmit={handleCustomerSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    placeholder="Search traditional skills, tutors, or homemade goods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-editorial pl-12"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary py-3.5 px-6 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Marketplace</span>
                </button>
              </form>
            </div>

            {/* Popular Service Categories */}
            <div className="bg-[#E6ECE7]/60 p-6 rounded-3xl border border-[#D2DDD5]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-editorial text-xl font-bold text-[#16382B]">
                  Popular Local Categories
                </h3>
                <Link to="/explore" className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1">
                  View All in Explore <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { icon: Scissors, name: 'Tailoring', category: 'Tailoring' },
                  { icon: Utensils, name: 'Homemade Food', category: 'Cooking' },
                  { icon: BookOpen, name: 'Home Tutors', category: 'Tutoring' },
                  { icon: Gift, name: 'Handicrafts', category: 'Handicrafts' },
                  { icon: Sprout, name: 'Gardening', category: 'Gardening' }
                ].map((c, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/explore?category=${c.category}`)}
                    className="bg-white p-4 rounded-2xl border border-[#E2E7E3] text-center hover:border-[#16382B] transition-all cursor-pointer shadow-2xs"
                  >
                    <c.icon className="w-6 h-6 text-[#16382B] mx-auto mb-2" />
                    <p className="font-bold text-[#16382B] text-sm">{c.name}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
