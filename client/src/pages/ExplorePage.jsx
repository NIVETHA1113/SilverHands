import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Star, ShieldCheck, X,
  ChevronLeft, ChevronRight, Briefcase, Package, UserCheck, ArrowRight,
  Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../services/api';
import { fetchProviderMatches } from '../services/matchingService';
import MatchScore from '../components/matching/MatchScore';
import MatchBreakdown from '../components/matching/MatchBreakdown';
import MatchReasons from '../components/matching/MatchReasons';

// ─── Static filter options ─────────────────────────────────────────────────
const categories = [
  'All', 'Cooking', 'Tailoring', 'Teaching', 'Tutoring', 'Gardening',
  'Handicrafts', 'Music', 'Dance', 'Traditional Arts', 'Beauty',
  'Language Training', 'Consulting', 'Other'
];
const citiesList = ['All Cities', 'Chennai', 'Bangalore', 'Coimbatore', 'Madurai', 'Hyderabad'];
const languages = ['Tamil', 'English', 'Kannada', 'Telugu', 'Hindi', 'Malayalam'];
const availabilityDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const deliveryModes = ['Online', 'In Person', 'Home Based', 'Customer Location'];
const deliveryOptions = ['Pickup', 'Local Delivery', 'Shipping'];
const experienceLevels = [
  { label: 'All Experience', min: null, max: null },
  { label: '0 – 5 years', min: 0, max: 5 },
  { label: '5 – 10 years', min: 5, max: 10 },
  { label: '10 – 20 years', min: 10, max: 20 },
  { label: '20 + years', min: 20, max: null },
];

// ─── Sort option lists ─────────────────────────────────────────────────────
const SORT_SERVICES_PRODUCTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];
const SORT_PROVIDERS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'experience', label: 'Experience' },
  { value: 'newest', label: 'Newest' },
];

// ─── FilterPanel: MUST be a top-level component, never defined inside a ─────
// render function. Defining it inside ExplorePage causes remount on every   ──
// state update, which destroys DOM focus mid-typing.                        ──
function FilterPanel({
  activeTab,
  selectedCity, setSelectedCity,
  sortBy, setSortBy,
  sortOptions,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  selectedAvailability, toggleAvailability,
  selectedDeliveryMode, toggleDeliveryMode,
  selectedDeliveryOption, toggleDeliveryOption,
  providerSkill, setProviderSkill,
  selectedExperience, setSelectedExperience,
  selectedLanguages, toggleLanguage,
  hasActiveFilters, clearAllFilters,
  setCurrentPage,
}) {
  return (
    <div className="space-y-6">
      {/* City */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">City</h4>
        <select
          value={selectedCity}
          onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
          className="input-editorial text-sm py-2 px-3 w-full bg-white"
        >
          {citiesList.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          className="input-editorial text-sm py-2 px-3 w-full bg-white"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── SERVICES-specific ── */}
      {activeTab === 'services' && (
        <>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Price Range (₹)</h4>
            <div className="flex gap-2">
              <input type="number" min="0" placeholder="Min" value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                className="input-editorial w-full text-sm py-2" />
              <input type="number" min="0" placeholder="Max" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                className="input-editorial w-full text-sm py-2" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Available Days</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {availabilityDays.map((day) => (
                <button key={day} onClick={() => { toggleAvailability(day); setCurrentPage(1); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-left ${selectedAvailability.includes(day)
                    ? 'bg-[#16382B] text-white'
                    : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                    }`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Delivery Mode</h4>
            <div className="space-y-1.5">
              {deliveryModes.map((mode) => (
                <label key={mode} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="checkbox" checked={selectedDeliveryMode.includes(mode)}
                    onChange={() => { toggleDeliveryMode(mode); setCurrentPage(1); }}
                    className="w-4 h-4 rounded accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── PRODUCTS-specific ── */}
      {activeTab === 'products' && (
        <>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Price Range (₹)</h4>
            <div className="flex gap-2">
              <input type="number" min="0" placeholder="Min" value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                className="input-editorial w-full text-sm py-2" />
              <input type="number" min="0" placeholder="Max" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                className="input-editorial w-full text-sm py-2" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Delivery Options</h4>
            <div className="space-y-1.5">
              {deliveryOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="checkbox" checked={selectedDeliveryOption.includes(opt)}
                    onChange={() => { toggleDeliveryOption(opt); setCurrentPage(1); }}
                    className="w-4 h-4 rounded accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── PROVIDERS-specific ── */}
      {activeTab === 'providers' && (
        <>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Skill</h4>
            <input
              type="text"
              placeholder="e.g. Tailoring, Cooking…"
              value={providerSkill}
              onChange={(e) => { setProviderSkill(e.target.value); setCurrentPage(1); }}
              className="input-editorial w-full text-sm py-2"
            />
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Experience</h4>
            <div className="space-y-1.5">
              {experienceLevels.map((lvl) => (
                <label key={lvl.label} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="radio" name="experience"
                    checked={selectedExperience.label === lvl.label}
                    onChange={() => { setSelectedExperience(lvl); setCurrentPage(1); }}
                    className="w-4 h-4 accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{lvl.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">Languages</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((lang) => (
                <button key={lang} onClick={() => { toggleLanguage(lang); setCurrentPage(1); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${selectedLanguages.includes(lang)
                    ? 'bg-[#16382B] text-white'
                    : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                    }`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <button onClick={clearAllFilters}
          className="w-full py-2 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-1.5">
          <X className="w-3.5 h-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'services');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All Cities');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // ── Filter state ──────────────────────────────────────────────────────
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(experienceLevels[0]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  // Provider-specific skill text filter (separate from category chips)
  const [providerSkill, setProviderSkill] = useState('');

  // ── UI state ──────────────────────────────────────────────────────────
  // showFilters: controls the filter sidebar on ALL screen sizes.
  // Defaults to true so filters are visible on first load.
  const [showFilters, setShowFilters] = useState(true);

  // ── Phase 6 matching state (providers tab only, non-breaking) ─────────
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [matchSkillInput, setMatchSkillInput] = useState('');
  const [matchSkills, setMatchSkills] = useState([]);
  const [matchCity, setMatchCity] = useState('');
  const [matchDays, setMatchDays] = useState([]);
  const [matchResults, setMatchResults] = useState(null);   // null = not yet run
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [expandedMatch, setExpandedMatch] = useState(null);  // providerId with open breakdown

  // ── Result state ──────────────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Sync state from URL whenever searchParams changes ────────────────
  // This handles navbar links like /explore?tab=services that update the
  // URL without remounting the component (React Router behaviour).
  useEffect(() => {
    const tab = searchParams.get('tab') || 'services';
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';
    const city = searchParams.get('city') || 'All Cities';
    const page = Number(searchParams.get('page')) || 1;

    setActiveTab(tab);
    setSearchQuery(q);
    setSelectedCategory(category);
    setSelectedCity(city);
    setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Push readable params to URL ───────────────────────────────────────
  const pushUrlParams = (overrides = {}) => {
    const next = {
      tab: activeTab,
      q: searchQuery,
      category: selectedCategory !== 'All' ? selectedCategory : '',
      city: selectedCity !== 'All Cities' ? selectedCity : '',
      page: String(currentPage),
      ...overrides,
    };
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    setSearchParams(p);
  };

  // ── Fetch from backend ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const p = new URLSearchParams();
        if (searchQuery.trim()) p.set('search', searchQuery.trim());
        if (selectedCategory !== 'All') p.set('category', selectedCategory);
        if (selectedCity !== 'All Cities') p.set('city', selectedCity);
        if (minPrice) p.set('minPrice', minPrice);
        if (maxPrice) p.set('maxPrice', maxPrice);
        p.set('sort', sortBy);
        p.set('page', currentPage);
        p.set('limit', 20);

        if (activeTab === 'services') {
          p.set('status', 'published');
          if (selectedAvailability.length) p.set('availableDays', selectedAvailability.join(','));
          if (selectedDeliveryMode.length) p.set('deliveryMode', selectedDeliveryMode.join(','));

          const res = await api.get(`/services?${p.toString()}`);
          if (res.data.success) {
            setResults(res.data.services || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.pages || 1);
          }

        } else if (activeTab === 'products') {
          p.set('status', 'published');
          if (selectedDeliveryOption.length) p.set('deliveryOption', selectedDeliveryOption.join(','));

          const res = await api.get(`/products?${p.toString()}`);
          if (res.data.success) {
            setResults(res.data.products || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.pages || 1);
          }

        } else if (activeTab === 'providers') {
          // Providers use skill (not category) + language + experience
          const pp = new URLSearchParams();
          if (searchQuery.trim()) pp.set('search', searchQuery.trim());
          if (selectedCity !== 'All Cities') pp.set('city', selectedCity);
          // skill: prefer explicit providerSkill; fall back to category chip if not "All"
          const skillVal = providerSkill.trim() || (selectedCategory !== 'All' ? selectedCategory : '');
          if (skillVal) pp.set('skill', skillVal);
          if (selectedLanguages.length) pp.set('language', selectedLanguages.join(','));
          if (selectedExperience.min != null) pp.set('minExperience', selectedExperience.min);
          if (selectedExperience.max != null) pp.set('maxExperience', selectedExperience.max);
          pp.set('sort', sortBy);
          pp.set('page', currentPage);
          pp.set('limit', 20);

          const res = await api.get(`/users/providers/public?${pp.toString()}`);
          if (res.data.success) {
            setResults(res.data.providers || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.pages || 1);
          }
        }
      } catch (err) {
        console.error('[Explore Fetch Error]:', err.message);
        setError(err.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab, searchQuery, selectedCategory, selectedCity,
    minPrice, maxPrice, sortBy, currentPage,
    selectedAvailability, selectedDeliveryMode, selectedDeliveryOption,
    selectedLanguages, selectedExperience, providerSkill,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    pushUrlParams({ q: searchQuery, page: '1' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // keep filter panel state as-is when switching tabs
    setSortBy('relevance');
    pushUrlParams({ tab, page: '1' });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    pushUrlParams({ category: cat !== 'All' ? cat : '', page: '1' });
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedAvailability([]);
    setSelectedDeliveryMode([]);
    setSelectedDeliveryOption([]);
    setSelectedExperience(experienceLevels[0]);
    setSelectedLanguages([]);
    setProviderSkill('');
    setSelectedCategory('All');
    setSelectedCity('All Cities');
    setSortBy('relevance');
    setCurrentPage(1);
    pushUrlParams({ category: '', city: '', page: '1' });
  };

  const hasActiveFilters =
    minPrice || maxPrice ||
    selectedAvailability.length > 0 ||
    selectedDeliveryMode.length > 0 ||
    selectedDeliveryOption.length > 0 ||
    selectedLanguages.length > 0 ||
    providerSkill ||
    selectedExperience.min != null ||
    selectedCategory !== 'All' ||
    selectedCity !== 'All Cities';

  const toggle = (setter) => (val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const toggleAvailability = toggle(setSelectedAvailability);
  const toggleDeliveryMode = toggle(setSelectedDeliveryMode);
  const toggleDeliveryOption = toggle(setSelectedDeliveryOption);
  const toggleLanguage = toggle(setSelectedLanguages);

  const sortOptions = activeTab === 'providers' ? SORT_PROVIDERS : SORT_SERVICES_PRODUCTS;

  // ── Phase 6 matching helpers ──────────────────────────────────────────

  const addMatchSkill = () => {
    const s = matchSkillInput.trim();
    if (s && !matchSkills.includes(s)) setMatchSkills(prev => [...prev, s]);
    setMatchSkillInput('');
  };

  const removeMatchSkill = (s) =>
    setMatchSkills(prev => prev.filter(k => k !== s));

  const toggleMatchDay = (day) =>
    setMatchDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleFindMatches = useCallback(async () => {
    setMatchLoading(true);
    setMatchError(null);
    setMatchResults(null);
    try {
      const requirement = {
        skills: matchSkills,
        location: matchCity ? { city: matchCity } : {},
        availability: matchDays,
      };
      const data = await fetchProviderMatches(requirement);
      setMatchResults(data.providers || []);
    } catch (err) {
      setMatchError(err.message || 'Matching failed. Please try again.');
    } finally {
      setMatchLoading(false);
    }
  }, [matchSkills, matchCity, matchDays]);

  const clearMatchResults = () => {
    setMatchResults(null);
    setMatchSkills([]);
    setMatchSkillInput('');
    setMatchCity('');
    setMatchDays([]);
    setMatchError(null);
    setExpandedMatch(null);
  };

  // Reset match results when tab changes away from providers
  useEffect(() => {
    if (activeTab !== 'providers') {
      setMatchResults(null);
      setShowMatchPanel(false);
    }
  }, [activeTab]);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FBF9F4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HERO + SEARCH ── */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="badge-sage uppercase tracking-wider text-xs">Public Marketplace</span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#16382B]">
              Discover skills, services &amp; products
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Find trusted local senior citizens and homemakers offering traditional skills, home tutoring, tailoring, and handmade crafts.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="What are you looking for? (e.g. Tailoring, Cooking, Mango Pickle, Math Tutor)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-editorial w-full text-base"
                style={{ paddingLeft: '3rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary py-3.5 px-8 text-base shadow-sm shrink-0 flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2 border-t border-[#E2E7E3] no-scrollbar">
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategorySelect(cat)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                  ? 'bg-[#16382B] text-white shadow-xs'
                  : 'bg-[#FBF9F4] text-slate-700 hover:bg-[#E6ECE7] border border-[#E2E7E3]'
                  }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E7E3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'services', label: 'Services', Icon: Briefcase },
              { id: 'products', label: 'Products', Icon: Package },
              { id: 'providers', label: 'Providers', Icon: UserCheck },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => handleTabChange(id)}
                className={`py-2.5 px-5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === id
                  ? 'bg-[#16382B] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-[#FBF9F4] hover:text-[#16382B]'
                  }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Filter toggle — visible on ALL screen sizes */}
          <button onClick={() => setShowFilters(v => !v)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <span className="ml-1 bg-[#16382B] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* ── MAIN CONTENT: sidebar + results ── */}
        <div className="flex gap-6 items-start">

          {/* Filter sidebar — toggled by showFilters on ALL screen sizes */}
          {showFilters && (
            <aside className="w-64 shrink-0 bg-white p-5 rounded-2xl border border-[#E2E7E3] sticky top-6 self-start">
              <h3 className="text-sm font-bold text-[#16382B] mb-5 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters &amp; Sort
              </h3>
              <FilterPanel
                activeTab={activeTab}
                selectedCity={selectedCity} setSelectedCity={setSelectedCity}
                sortBy={sortBy} setSortBy={setSortBy}
                sortOptions={sortOptions}
                minPrice={minPrice} setMinPrice={setMinPrice}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                selectedAvailability={selectedAvailability} toggleAvailability={toggleAvailability}
                selectedDeliveryMode={selectedDeliveryMode} toggleDeliveryMode={toggleDeliveryMode}
                selectedDeliveryOption={selectedDeliveryOption} toggleDeliveryOption={toggleDeliveryOption}
                providerSkill={providerSkill} setProviderSkill={setProviderSkill}
                selectedExperience={selectedExperience} setSelectedExperience={setSelectedExperience}
                selectedLanguages={selectedLanguages} toggleLanguage={toggleLanguage}
                hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters}
                setCurrentPage={setCurrentPage}
              />
            </aside>
          )}

          {/* Results column */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Result count + active filter summary */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {!loading && !error && (
                <p className="text-sm text-slate-600">
                  {total > 0
                    ? <><span className="font-bold text-[#16382B]">{total}</span> result{total !== 1 ? 's' : ''} found</>
                    : 'No results found'
                  }
                  {(searchQuery || selectedCategory !== 'All') && (
                    <span className="ml-2 text-slate-400">
                      {searchQuery && `for "${searchQuery}"`}
                      {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    </span>
                  )}
                </p>
              )}
              {loading && (
                <p className="text-sm text-slate-400 animate-pulse">Loading…</p>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-800 text-sm">
                <p className="font-semibold">Error loading results</p>
                <p className="text-xs mt-1">{error}</p>
                <button onClick={() => setError(null)}
                  className="mt-2 text-xs underline hover:no-underline">Dismiss</button>
              </div>
            )}

            {/* Loading spinner */}
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#16382B]">
                <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">Loading listings…</p>
              </div>
            )}

            {/* ── SERVICES grid ── */}
            {!loading && !error && activeTab === 'services' && (
              results.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">No services found</h3>
                  <p className="text-slate-500 text-sm">Try a different keyword or clear the filters.</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs text-red-600 underline">Clear filters</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((service) => {
                    const provider = service.providerId || {};
                    // Use backend-computed distance; fall back to city label
                    const distLabel = service.distance != null
                      ? `${service.distance.toFixed(1)} km away`
                      : (service.location?.city || provider.location?.city || '');

                    return (
                      <div key={service._id}
                        className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="badge-sage text-xs">{service.category}</span>
                            <span className="font-editorial text-xl font-bold text-[#16382B] whitespace-nowrap">
                              ₹{service.price}
                              <span className="text-xs text-slate-500 font-sans"> / {service.priceType}</span>
                            </span>
                          </div>

                          <h3 className="font-editorial text-lg font-bold text-[#16382B] line-clamp-2">
                            {service.title}
                          </h3>

                          {service.description && (
                            <p className="text-slate-500 text-sm italic line-clamp-2">
                              &ldquo;{service.description}&rdquo;
                            </p>
                          )}

                          {/* Availability / delivery info */}
                          {service.deliveryMode?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {service.deliveryMode.map((m) => (
                                <span key={m} className="text-[10px] bg-[#F0F4F1] text-[#16382B] font-semibold px-2 py-0.5 rounded-full">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {service.availability?.days?.length > 0 && (
                            <p className="text-xs text-slate-500">
                              Available: {service.availability.days.slice(0, 3).map(d => d.slice(0, 3)).join(', ')}
                              {service.availability.days.length > 3 && ` +${service.availability.days.length - 3} more`}
                            </p>
                          )}

                          {/* Provider row */}
                          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E7E3]">
                            <img
                              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name || 'Provider'}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                            <div className="text-xs min-w-0">
                              <span className="font-bold text-[#16382B] block truncate">{provider.name || 'Skill Provider'}</span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                <span className="truncate">{distLabel}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link to={`/services/${service._id}`}
                          className="btn-primary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1">
                          View Service <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── PRODUCTS grid ── */}
            {!loading && !error && activeTab === 'products' && (
              results.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">No products found</h3>
                  <p className="text-slate-500 text-sm">Try a different keyword or clear the filters.</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs text-red-600 underline">Clear filters</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((product) => {
                    const provider = product.providerId || {};
                    const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';
                    const distLabel = product.distance != null
                      ? `${product.distance.toFixed(1)} km away`
                      : (product.location?.city || provider.location?.city || '');

                    return (
                      <div key={product._id}
                        className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          {/* Product image */}
                          <div className="relative">
                            <img
                              src={(product.images?.[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                              alt={product.name}
                              className="w-full h-40 rounded-2xl object-cover border border-[#E2E7E3]"
                            />
                            {isOutOfStock ? (
                              <span className="absolute top-2 right-2 bg-red-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-full uppercase shadow-xs">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="absolute top-2 right-2 bg-white/90 text-[#16382B] text-[10px] font-bold py-1 px-2 rounded-full shadow-xs">
                                {product.quantity} {product.unit}s left
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <span className="badge-terracotta text-xs mb-1 inline-block">{product.category}</span>
                              <h3 className="font-editorial text-lg font-bold text-[#16382B] line-clamp-1">
                                {product.name}
                              </h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-editorial text-xl font-bold text-[#16382B]">₹{product.price}</span>
                              <span className="text-xs text-slate-500 block">per {product.unit}</span>
                            </div>
                          </div>

                          {product.description && (
                            <p className="text-slate-500 text-sm italic line-clamp-2">
                              &ldquo;{product.description}&rdquo;
                            </p>
                          )}

                          {/* Provider row */}
                          <div className="flex items-center gap-2.5 pt-2 border-t border-[#E2E7E3]">
                            <img
                              src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name || 'Provider'}
                              className="w-7 h-7 rounded-full object-cover border shrink-0"
                            />
                            <div className="text-xs min-w-0">
                              <span className="font-semibold text-[#16382B] block truncate">{provider.name || 'Skill Provider'}</span>
                              {distLabel && (
                                <span className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                  <span className="truncate">{distLabel}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link to={`/products/${product._id}`}
                          className="btn-primary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1 bg-[#C86D51] hover:bg-[#b55e43]">
                          View Product <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── MATCHING PANEL (providers tab only, non-breaking) ── */}
            {!loading && activeTab === 'providers' && (
              <div className="bg-white rounded-2xl border border-[#E2E7E3] overflow-hidden">
                {/* Panel header / toggle */}
                <button
                  onClick={() => setShowMatchPanel(v => !v)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#FBF9F4] transition-colors"
                  aria-expanded={showMatchPanel}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#16382B]">Find Best Match</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      — score &amp; rank providers against your requirements
                    </span>
                    {matchResults && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {matchResults.length} ranked
                      </span>
                    )}
                  </div>
                  {showMatchPanel
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  }
                </button>

                {/* Panel body */}
                {showMatchPanel && (
                  <div className="p-4 pt-0 border-t border-[#E2E7E3] space-y-4">

                    {/* Skills input */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Required Skills
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={matchSkillInput}
                          onChange={(e) => setMatchSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMatchSkill(); } }}
                          placeholder="e.g. Tailoring, Cooking…"
                          className="input-editorial flex-1 text-sm py-2"
                        />
                        <button
                          onClick={addMatchSkill}
                          disabled={!matchSkillInput.trim()}
                          className="btn-secondary text-xs py-2 px-3 disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                      {matchSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {matchSkills.map((s) => (
                            <span key={s}
                              className="inline-flex items-center gap-1 bg-[#16382B] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              {s}
                              <button onClick={() => removeMatchSkill(s)} aria-label={`Remove ${s}`}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* City + Availability row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          City
                        </label>
                        <select
                          value={matchCity}
                          onChange={(e) => setMatchCity(e.target.value)}
                          className="input-editorial w-full text-sm py-2 bg-white"
                        >
                          <option value="">Any city</option>
                          {citiesList.filter(c => c !== 'All Cities').map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Availability
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {availabilityDays.map((day) => (
                            <button key={day} onClick={() => toggleMatchDay(day)}
                              className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${matchDays.includes(day)
                                ? 'bg-[#16382B] text-white'
                                : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                                }`}>
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={handleFindMatches}
                        disabled={matchLoading}
                        className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-60"
                      >
                        {matchLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Matching…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Find Matches
                          </>
                        )}
                      </button>
                      {matchResults !== null && (
                        <button onClick={clearMatchResults}
                          className="text-xs text-slate-500 hover:text-red-600 underline">
                          Clear results
                        </button>
                      )}
                    </div>

                    {/* Match error */}
                    {matchError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                        {matchError}
                      </p>
                    )}

                    {/* Match results */}
                    {matchResults !== null && !matchLoading && (
                      matchResults.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No providers matched your requirements. Try broadening your criteria.
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {matchResults.length} providers ranked by match score
                          </p>
                          {matchResults.map((match) => {
                            const prov = match.provider || {};
                            const isExpanded = expandedMatch === match.providerId;
                            return (
                              <div key={match.providerId}
                                className="bg-[#FBF9F4] rounded-2xl border border-[#E2E7E3] p-4 space-y-3">

                                {/* Top row: avatar + name + score pill */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={prov.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                                      alt={prov.name || 'Provider'}
                                      className="w-11 h-11 rounded-full object-cover border-2 border-[#16382B] shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-editorial text-base font-bold text-[#16382B] truncate">
                                          {prov.name || 'Provider'}
                                        </span>
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      </div>
                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                        {match.provider?.distanceKm != null
                                          ? `${match.provider.distanceKm} km away`
                                          : (prov.location?.city || 'Location unavailable')}
                                      </p>
                                    </div>
                                  </div>
                                  {/* MatchScore inline pill — score from backend, never calculated here */}
                                  <MatchScore score={match.matchScore} inline />
                                </div>

                                {/* Compact breakdown (always visible) */}
                                <MatchBreakdown breakdown={match.breakdown} compact />

                                {/* Toggle detailed reasons */}
                                <button
                                  onClick={() => setExpandedMatch(isExpanded ? null : match.providerId)}
                                  className="text-xs text-[#16382B] font-semibold flex items-center gap-1 hover:underline"
                                  aria-expanded={isExpanded}
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  {isExpanded ? 'Hide details' : 'Why this match?'}
                                </button>

                                {isExpanded && (
                                  <div className="border-t border-[#E2E7E3] pt-3 space-y-3">
                                    <MatchReasons reasons={match.reasons} compact />
                                    {prov.skills?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {prov.skills.map((s, i) => (
                                          <span key={i} className="badge-sage text-xs">
                                            {s.name}{s.experienceYears ? ` (${s.experienceYears}+ yrs)` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <Link to={`/providers/${match.providerId}`}
                                      className="btn-secondary text-xs py-2 w-full text-center flex items-center justify-center gap-1 bg-white hover:bg-[#FBF9F4] mt-1">
                                      View Full Profile <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── PROVIDERS grid ── */}
            {!loading && !error && activeTab === 'providers' && (
              results.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">No providers found</h3>
                  <p className="text-slate-500 text-sm">Try a different skill or city.</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs text-red-600 underline">Clear filters</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((p) => (
                    <div key={p._id}
                      className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        {/* Provider header */}
                        <div className="flex items-center gap-3">
                          <img
                            src={p.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                            alt={p.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#16382B] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-editorial text-lg font-bold text-[#16382B] truncate">{p.name}</h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                              {p.location?.city || 'Chennai'}
                              {p.age ? ` · Age ${p.age}` : ''}
                            </p>
                            {p.rating && (
                              <p className="text-xs text-[#C07A46] font-bold flex items-center gap-0.5 mt-0.5">
                                <Star className="w-3 h-3 fill-current" /> {p.rating} Trusted
                              </p>
                            )}
                          </div>
                        </div>

                        {p.bio && (
                          <p className="text-slate-500 text-sm italic line-clamp-2">
                            &ldquo;{p.bio}&rdquo;
                          </p>
                        )}

                        {/* Skills */}
                        {p.skills?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.skills.map((s, i) => (
                                <span key={i} className="badge-sage text-xs">
                                  {s.name}{s.experienceYears ? ` (${s.experienceYears}+ yrs)` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Languages */}
                        {p.languages?.length > 0 && (
                          <p className="text-xs text-slate-500">
                            Speaks: {p.languages.join(', ')}
                          </p>
                        )}
                      </div>

                      <Link to={`/providers/${p._id}`}
                        className="btn-secondary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1 bg-white hover:bg-[#FBF9F4]">
                        View Profile <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── PAGINATION ── */}
            {!loading && !error && (
              <div className="flex justify-center items-center gap-4 pt-6 border-t border-[#E2E7E3]">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-secondary py-2.5 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="text-sm font-bold text-[#16382B] min-w-[80px] text-center">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary py-2.5 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>{/* end results column */}
        </div>{/* end sidebar + results row */}

      </div>
    </div>
  );
}
