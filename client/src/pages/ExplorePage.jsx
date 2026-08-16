import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, ShieldCheck, Sparkles, X, ChevronLeft, ChevronRight, Briefcase, Package, UserCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../utils/haversine';

const categories = [
  'All',
  'Cooking',
  'Tailoring',
  'Teaching',
  'Tutoring',
  'Gardening',
  'Handicrafts',
  'Music',
  'Dance',
  'Traditional Arts',
  'Beauty',
  'Language Training',
  'Consulting',
  'Other'
];

const citiesList = ['All Cities', 'Chennai', 'Bangalore', 'Coimbatore', 'Madurai', 'Hyderabad'];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Discovery Tab: 'services' | 'products' | 'providers'
  const tabParam = searchParams.get('tab') || 'services';
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const cityParam = searchParams.get('city') || 'All Cities';

  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Synchronize state with URL parameters
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'services');
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedCity(searchParams.get('city') || 'All Cities');
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch results based on active tab & filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
        if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sortBy) params.set('sort', sortBy);
        params.set('page', currentPage);
        params.set('limit', 12);

        if (activeTab === 'services') {
          params.set('status', 'published');
          const res = await api.get(`/services?${params.toString()}`);
          if (res.data.success) {
            setServices(res.data.services || []);
            setTotalPages(res.data.pages || 1);
          }
        } else if (activeTab === 'products') {
          params.set('status', 'published');
          const res = await api.get(`/products?${params.toString()}`);
          if (res.data.success) {
            setProducts(res.data.products || []);
            setTotalPages(res.data.pages || 1);
          }
        } else if (activeTab === 'providers') {
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
          if (selectedCategory && selectedCategory !== 'All') params.set('skill', selectedCategory);
          const res = await api.get(`/users/providers/public?${params.toString()}`);
          if (res.data.success) {
            setProviders(res.data.providers || []);
            setTotalPages(res.data.pages || 1);
          }
        }
      } catch (err) {
        console.error('[Explore Fetch Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, selectedCategory, selectedCity, minPrice, maxPrice, sortBy, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery, page: 1 });
  };

  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateUrlParams({ tab, page: 1 });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    updateUrlParams({ category: cat === 'All' ? '' : cat, page: 1 });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* EXPLORE HERO & SEARCH BAR */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="badge-sage uppercase tracking-wider text-xs">Public Marketplace</span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#16382B]">
              Discover skills, services & products
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Find trusted local senior citizens and homemakers offering traditional skills, home tutoring, tailoring, and handmade crafts.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="What are you looking for? (e.g. Tailoring, Cooking, Mango Pickle, Math Tutor)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-editorial pl-12 text-base py-3.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); updateUrlParams({ q: '' }); }}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary py-3.5 px-8 text-base shadow-sm shrink-0">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Category Chips Scrollbar */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2 border-t border-[#E2E7E3] no-scrollbar">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategorySelect(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#16382B] text-white shadow-xs'
                      : 'bg-[#FBF9F4] text-slate-700 hover:bg-[#E6ECE7] border border-[#E2E7E3]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* DISCOVERY TABS & FILTER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E7E3]">
          
          {/* Tabs: Services | Products | Providers */}
          <div className="flex gap-2 border-b md:border-b-0 pb-2 md:pb-0 w-full md:w-auto overflow-x-auto">
            {[
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'providers', label: 'Providers', icon: UserCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2.5 px-5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#16382B] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-[#FBF9F4] hover:text-[#16382B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); updateUrlParams({ city: e.target.value === 'All Cities' ? '' : e.target.value }); }}
              className="input-editorial text-xs py-2 px-3 bg-white w-auto"
            >
              {citiesList.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-editorial text-xs py-2 px-3 bg-white w-auto"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="md:hidden btn-secondary text-xs py-2 px-3 flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* CONTENT RESULTS GRID */}
        {loading ? (
          <div className="py-16 text-center text-[#16382B] font-semibold flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#16382B] border-t-transparent rounded-full animate-spin" />
            <p>Loading discovery listings...</p>
          </div>
        ) : (
          <div>
            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              services.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto my-8">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No services found</h3>
                  <p className="text-slate-600 text-sm">Try searching for a different keyword or selecting "All Categories".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => {
                    const provider = service.providerId || {};
                    const dist = calculateDistance(
                      user?.location?.latitude,
                      user?.location?.longitude,
                      service.location?.latitude || provider.location?.latitude,
                      service.location?.longitude || provider.location?.longitude
                    );

                    return (
                      <div key={service._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <span className="badge-sage text-xs">{service.category}</span>
                            <span className="font-editorial text-2xl font-bold text-[#16382B]">
                              ₹{service.price} <span className="text-xs text-slate-500 font-sans">/ {service.priceType}</span>
                            </span>
                          </div>

                          <h3 className="font-editorial text-2xl font-bold text-[#16382B] line-clamp-1">
                            {service.title}
                          </h3>

                          <p className="text-slate-600 text-sm italic line-clamp-2">
                            "{service.description}"
                          </p>

                          {/* Provider Info Row */}
                          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E7E3]">
                            <img
                              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-[#16382B] block">{provider.name || 'Skill Provider'}</span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#16382B]" />
                                {service.location?.city || provider.location?.city || 'Chennai'}
                                {dist ? ` (${dist} km away)` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/services/${service._id}`}
                          className="btn-primary text-xs py-2.5 w-full text-center mt-2 flex items-center justify-center gap-1"
                        >
                          <span>View Service Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              products.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto my-8">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No products found</h3>
                  <p className="text-slate-600 text-sm">Try searching for a different handmade product or category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const provider = product.providerId || {};
                    const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';

                    return (
                      <div key={product._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                              alt={product.name}
                              className="w-full h-44 rounded-2xl object-cover border border-[#E2E7E3]"
                            />
                            {isOutOfStock ? (
                              <span className="absolute top-3 right-3 bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-full uppercase shadow-xs">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="absolute top-3 right-3 bg-white/90 text-[#16382B] text-xs font-bold py-1 px-2.5 rounded-full shadow-xs">
                                {product.quantity} {product.unit}s available
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="badge-terracotta text-xs mb-1">{product.category}</span>
                              <h3 className="font-editorial text-2xl font-bold text-[#16382B] line-clamp-1">
                                {product.name}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-editorial text-2xl font-bold text-[#16382B]">₹{product.price}</span>
                              <span className="text-xs text-slate-500 block">per {product.unit}</span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-sm italic line-clamp-2">
                            "{product.description}"
                          </p>

                          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E7E3]">
                            <img
                              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name}
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <span className="text-xs font-semibold text-[#16382B]">
                              {provider.name || 'Skill Provider'} • {product.location?.city || 'Chennai'}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/products/${product._id}`}
                          className="btn-primary text-xs py-2.5 w-full text-center mt-2 flex items-center justify-center gap-1 bg-[#C86D51] hover:bg-[#b55e43]"
                        >
                          <span>View Product Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* PROVIDERS TAB */}
            {activeTab === 'providers' && (
              providers.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto my-8">
                  <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No providers found</h3>
                  <p className="text-slate-600 text-sm">Try searching for a different skill or city.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {providers.map((p) => {
                    const topSkill = p.skills?.[0];

                    return (
                      <div key={p._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={p.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                              alt={p.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-[#16382B]"
                            />
                            <div>
                              <div className="flex items-center gap-1">
                                <h3 className="font-editorial text-2xl font-bold text-[#16382B]">{p.name}</h3>
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                                <MapPin className="w-3.5 h-3.5 text-[#16382B]" /> {p.location?.city || 'Chennai'} • Age {p.age || 60}
                              </p>
                              <p className="text-xs text-[#C07A46] font-bold flex items-center gap-1 mt-0.5">
                                <Star className="w-3.5 h-3.5 fill-current" /> {p.rating || 4.8} Trusted Provider
                              </p>
                            </div>
                          </div>

                          <p className="text-slate-600 text-sm italic line-clamp-2">
                            "{p.bio || 'Experienced senior citizen offering traditional skill services.'}"
                          </p>

                          {/* Skills Chips */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.skills?.map((s, idx) => (
                                <span key={idx} className="badge-sage text-xs">
                                  {s.name} ({s.experienceYears || 10}+ yrs)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/providers/${p._id}`}
                          className="btn-secondary text-xs py-2.5 w-full text-center mt-3 flex items-center justify-center gap-1 bg-white hover:bg-[#FBF9F4]"
                        >
                          <span>View Public Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs font-bold text-[#16382B]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
