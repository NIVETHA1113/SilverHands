import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, MapPin, Star, ShieldCheck, X,
  ChevronLeft, ChevronRight, Briefcase, Package, UserCheck, ArrowRight,
  Sparkles, ChevronDown, ChevronUp, Mic, AlertCircle, Languages
} from 'lucide-react';
import api from '../services/api';
import { fetchProviderMatches } from '../services/matchingService';
import MatchScore from '../components/matching/MatchScore';
import MatchBreakdown from '../components/matching/MatchBreakdown';
import MatchReasons from '../components/matching/MatchReasons';
import useVoiceSearch from '../hooks/useVoiceSearch';
import { useExploreLocale, LOCALES } from '../locales/exploreLocales';

// ─── Static filter data (keys only — labels come from locale) ─────────────────
const CATEGORY_KEYS = [
  'All','Cooking','Tailoring','Teaching','Tutoring','Gardening',
  'Handicrafts','Music','Dance','Traditional Arts','Beauty',
  'Language Training','Consulting','Other',
];
const CITY_KEYS      = ['All Cities','Chennai','Bangalore','Coimbatore','Madurai','Hyderabad'];
const LANGUAGE_KEYS  = ['Tamil','English','Kannada','Telugu','Hindi','Malayalam'];
const AVAIL_DAY_KEYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DELIVERY_MODE_KEYS   = ['Online','In Person','Home Based','Customer Location'];
const DELIVERY_OPTION_KEYS = ['Pickup','Local Delivery','Shipping'];

const EXPERIENCE_LEVELS = [
  { key: 'expAll',    min: null, max: null },
  { key: 'exp0to5',   min: 0,    max: 5    },
  { key: 'exp5to10',  min: 5,    max: 10   },
  { key: 'exp10to20', min: 10,   max: 20   },
  { key: 'exp20plus', min: 20,   max: null },
];

// Sort options: value stays stable, label comes from locale
const SORT_SERVICES_PRODUCTS_KEYS = [
  { value: 'relevance', key: 'sortRelevance' },
  { value: 'newest',    key: 'sortNewest'    },
  { value: 'price_asc', key: 'sortPriceAsc'  },
  { value: 'price_desc',key: 'sortPriceDesc' },
];
const SORT_PROVIDERS_KEYS = [
  { value: 'relevance', key: 'sortRelevance'  },
  { value: 'experience',key: 'sortExperience' },
  { value: 'newest',    key: 'sortNewest'     },
];

// ─── FilterPanel ──────────────────────────────────────────────────────────────
// Top-level component (never inside render) to avoid remount on state change.
function FilterPanel({
  t,
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
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.filterCity}</h4>
        <select
          value={selectedCity}
          onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
          className="input-editorial text-sm py-2 px-3 w-full bg-white"
        >
          {CITY_KEYS.map((c) => (
            <option key={c} value={c}>
              {c === 'All Cities' ? t.allCities : c}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.filterSortBy}</h4>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          className="input-editorial text-sm py-2 px-3 w-full bg-white"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{t[o.key]}</option>
          ))}
        </select>
      </div>

      {/* ── SERVICES-specific ── */}
      {activeTab === 'services' && (
        <>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterPriceRange}</h4>
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
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterAvailDays}</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {AVAIL_DAY_KEYS.map((day) => (
                <button key={day} onClick={() => { toggleAvailability(day); setCurrentPage(1); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    selectedAvailability.includes(day)
                      ? 'bg-[#16382B] text-white'
                      : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                  }`}>
                  {t.days[day]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterDeliveryMode}</h4>
            <div className="space-y-1.5">
              {DELIVERY_MODE_KEYS.map((mode) => (
                <label key={mode} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="checkbox" checked={selectedDeliveryMode.includes(mode)}
                    onChange={() => { toggleDeliveryMode(mode); setCurrentPage(1); }}
                    className="w-4 h-4 rounded accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{t.deliveryModes[mode]}</span>
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
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterPriceRange}</h4>
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
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterDeliveryOpts}</h4>
            <div className="space-y-1.5">
              {DELIVERY_OPTION_KEYS.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="checkbox" checked={selectedDeliveryOption.includes(opt)}
                    onChange={() => { toggleDeliveryOption(opt); setCurrentPage(1); }}
                    className="w-4 h-4 rounded accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{t.deliveryOptions[opt]}</span>
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
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterSkill}</h4>
            <input type="text" placeholder={t.filterSkillPh} value={providerSkill}
              onChange={(e) => { setProviderSkill(e.target.value); setCurrentPage(1); }}
              className="input-editorial w-full text-sm py-2" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterExperience}</h4>
            <div className="space-y-1.5">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <label key={lvl.key} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-[#FBF9F4] rounded-lg">
                  <input type="radio" name="experience"
                    checked={selectedExperience.key === lvl.key}
                    onChange={() => { setSelectedExperience(lvl); setCurrentPage(1); }}
                    className="w-4 h-4 accent-[#16382B]" />
                  <span className="text-sm text-slate-700">{t[lvl.key]}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#16382B] mb-3">{t.filterLanguages}</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGE_KEYS.map((lang) => (
                <button key={lang} onClick={() => { toggleLanguage(lang); setCurrentPage(1); }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedLanguages.includes(lang)
                      ? 'bg-[#16382B] text-white'
                      : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                  }`}>
                  {t.spokenLanguages[lang]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {hasActiveFilters && (
        <button onClick={clearAllFilters}
          className="w-full py-2 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-1.5">
          <X className="w-3.5 h-3.5" /> {t.filterClearAll}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang, setLang } = useExploreLocale();

  // ── URL-synced state ──────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState(searchParams.get('tab') || 'services');
  const [searchQuery,      setSearchQuery]      = useState(searchParams.get('q')   || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCity,     setSelectedCity]     = useState(searchParams.get('city') || 'All Cities');
  const [currentPage,      setCurrentPage]      = useState(Number(searchParams.get('page')) || 1);

  // ── Filter state ──────────────────────────────────────────────────────
  const [minPrice,              setMinPrice]              = useState('');
  const [maxPrice,              setMaxPrice]              = useState('');
  const [sortBy,                setSortBy]                = useState('relevance');
  const [selectedAvailability,  setSelectedAvailability]  = useState([]);
  const [selectedDeliveryMode,  setSelectedDeliveryMode]  = useState([]);
  const [selectedDeliveryOption,setSelectedDeliveryOption]= useState([]);
  const [selectedExperience,    setSelectedExperience]    = useState(EXPERIENCE_LEVELS[0]);
  const [selectedLanguages,     setSelectedLanguages]     = useState([]);
  const [providerSkill,         setProviderSkill]         = useState('');
  const [showFilters,           setShowFilters]           = useState(true);

  // ── Phase 6 matching state ────────────────────────────────────────────
  const [showMatchPanel,  setShowMatchPanel]  = useState(false);
  const [matchSkillInput, setMatchSkillInput] = useState('');
  const [matchSkills,     setMatchSkills]     = useState([]);
  const [matchCity,       setMatchCity]       = useState('');
  const [matchDays,       setMatchDays]       = useState([]);
  const [matchResults,    setMatchResults]    = useState(null);
  const [matchLoading,    setMatchLoading]    = useState(false);
  const [matchError,      setMatchError]      = useState(null);
  const [expandedMatch,   setExpandedMatch]   = useState(null);

  // ── Result state ──────────────────────────────────────────────────────
  const [results,     setResults]     = useState([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Voice search ──────────────────────────────────────────────────────
  const handleVoiceResult = useCallback((text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    const p = new URLSearchParams();
    p.set('tab', activeTab);
    if (text.trim()) p.set('q', text.trim());
    setSearchParams(p);
  }, [activeTab, setSearchParams]);

  const {
    listening:  micListening,
    supported:  micSupported,
    toggle:     toggleMic,
    errorMsg:   micError,
    clearError: clearMicError,
  } = useVoiceSearch(handleVoiceResult, t.langCode);  // ← lang-aware

  // ── Sync from URL ─────────────────────────────────────────────────────
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'services');
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedCity(searchParams.get('city') || 'All Cities');
    setCurrentPage(Number(searchParams.get('page')) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Push URL params ───────────────────────────────────────────────────
  const pushUrlParams = (overrides = {}) => {
    const next = {
      tab:      activeTab,
      q:        searchQuery,
      category: selectedCategory !== 'All' ? selectedCategory : '',
      city:     selectedCity !== 'All Cities' ? selectedCity : '',
      page:     String(currentPage),
      ...overrides,
    };
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    setSearchParams(p);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────
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
          if (selectedDeliveryMode.length) p.set('deliveryMode',  selectedDeliveryMode.join(','));
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
          const pp = new URLSearchParams();
          if (searchQuery.trim()) pp.set('search', searchQuery.trim());
          if (selectedCity !== 'All Cities') pp.set('city', selectedCity);
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
    setSortBy('relevance');
    pushUrlParams({ tab, page: '1' });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    pushUrlParams({ category: cat !== 'All' ? cat : '', page: '1' });
  };

  const clearAllFilters = () => {
    setMinPrice(''); setMaxPrice('');
    setSelectedAvailability([]); setSelectedDeliveryMode([]);
    setSelectedDeliveryOption([]); setSelectedExperience(EXPERIENCE_LEVELS[0]);
    setSelectedLanguages([]); setProviderSkill('');
    setSelectedCategory('All'); setSelectedCity('All Cities');
    setSortBy('relevance'); setCurrentPage(1);
    pushUrlParams({ category: '', city: '', page: '1' });
  };

  const hasActiveFilters =
    minPrice || maxPrice ||
    selectedAvailability.length > 0 || selectedDeliveryMode.length > 0 ||
    selectedDeliveryOption.length > 0 || selectedLanguages.length > 0 ||
    providerSkill || selectedExperience.min != null ||
    selectedCategory !== 'All' || selectedCity !== 'All Cities';

  const toggler = (setter) => (val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const toggleAvailability   = toggler(setSelectedAvailability);
  const toggleDeliveryMode   = toggler(setSelectedDeliveryMode);
  const toggleDeliveryOption = toggler(setSelectedDeliveryOption);
  const toggleLanguage       = toggler(setSelectedLanguages);

  const sortOptionKeys = activeTab === 'providers' ? SORT_PROVIDERS_KEYS : SORT_SERVICES_PRODUCTS_KEYS;

  // ── Matching helpers ──────────────────────────────────────────────────
  const addMatchSkill = () => {
    const s = matchSkillInput.trim();
    if (s && !matchSkills.includes(s)) setMatchSkills(prev => [...prev, s]);
    setMatchSkillInput('');
  };
  const removeMatchSkill = (s) => setMatchSkills(prev => prev.filter(k => k !== s));
  const toggleMatchDay   = (day) =>
    setMatchDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleFindMatches = useCallback(async () => {
    setMatchLoading(true); setMatchError(null); setMatchResults(null);
    try {
      const data = await fetchProviderMatches({
        skills:       matchSkills,
        location:     matchCity ? { city: matchCity } : {},
        availability: matchDays,
      });
      setMatchResults(data.providers || []);
    } catch (err) {
      setMatchError(err.message || 'Matching failed. Please try again.');
    } finally {
      setMatchLoading(false);
    }
  }, [matchSkills, matchCity, matchDays]);

  const clearMatchResults = () => {
    setMatchResults(null); setMatchSkills([]); setMatchSkillInput('');
    setMatchCity(''); setMatchDays([]); setMatchError(null); setExpandedMatch(null);
  };

  useEffect(() => {
    if (activeTab !== 'providers') { setMatchResults(null); setShowMatchPanel(false); }
  }, [activeTab]);

  // ── Language toggle helper ────────────────────────────────────────────
  const toggleLang = () => setLang(l => l === 'en' ? 'ta' : 'en');

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FBF9F4] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* ── HERO + SEARCH ── */}
        <div className="bg-white px-6 pt-7 pb-5 sm:px-10 sm:pt-9 sm:pb-6 rounded-3xl border border-[#E2E7E3] shadow-xs">

          {/* Heading + language toggle row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="space-y-1 min-w-0">
              <span className="badge-sage uppercase tracking-wider text-xs">{t.badgeMarketplace}</span>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16382B] mt-2 leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            {/* ── Language toggle ── */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={`Switch to ${t.altLabel}`}
              title={`Switch to ${t.altLabel}`}
              className="lang-toggle shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D2DDD5] bg-white text-[#16382B] text-xs font-bold hover:border-[#16382B] hover:bg-[#F0F4F1] transition-all"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t.altLabel}</span>
            </button>
          </div>

          {/* ── Search row ── */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="search-bar-wrap relative flex-1 group">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input input-editorial w-full pr-44 pl-4"
                style={{ height: '3.25rem' }}
                aria-label={t.searchAriaLabel}
              />
              <button
                type="button"
                onClick={micSupported ? toggleMic : undefined}
                aria-label={micListening ? t.voiceAriaStop : t.voiceAriaStart}
                title={micListening ? t.voiceStopTitle : t.voiceStartTitle}
                className={`voice-trigger absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg z-10 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16382B] ${
                  micListening
                    ? 'voice-trigger--listening text-red-500'
                    : micSupported
                      ? 'text-slate-400 hover:text-[#16382B] cursor-pointer'
                      : 'text-slate-300 cursor-default'
                }`}
              >
                {micListening && (
                  <>
                    <span className="mic-ripple-ring mic-ripple-ring--1 absolute inset-0 rounded-lg" />
                    <span className="mic-ripple-ring mic-ripple-ring--2 absolute inset-0 rounded-lg" />
                  </>
                )}
                <Mic className="w-4 h-4 relative z-10 shrink-0" strokeWidth={micListening ? 2.5 : 2} />
                <span className="relative z-10 text-xs font-medium whitespace-nowrap">
                  {micListening ? t.voiceListening : t.voiceClickLabel}
                </span>
              </button>
            </div>
            <button type="submit" className="explore-search-btn btn-primary shrink-0 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              <span>{t.searchBtn}</span>
            </button>
          </form>

          {/* Voice error */}
          {micError && (
            <div role="alert" className="voice-error-banner flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span className="flex-1">{micError}</span>
              <button type="button" onClick={clearMicError} aria-label={t.voiceErrorDismiss}
                className="text-amber-400 hover:text-amber-700 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-5 pt-4 border-t border-[#E2E7E3] no-scrollbar">
            {CATEGORY_KEYS.map((cat) => (
              <button key={cat} onClick={() => handleCategorySelect(cat)}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#16382B] text-white shadow-xs'
                    : 'bg-[#FBF9F4] text-slate-700 hover:bg-[#E6ECE7] border border-[#E2E7E3]'
                }`}>
                {t.categories[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-[#E2E7E3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'services',  labelKey: 'tabServices',  Icon: Briefcase  },
              { id: 'products',  labelKey: 'tabProducts',  Icon: Package    },
              { id: 'providers', labelKey: 'tabProviders', Icon: UserCheck  },
            ].map(({ id, labelKey, Icon }) => (
              <button key={id} onClick={() => handleTabChange(id)}
                className={`py-2 px-5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === id ? 'bg-[#16382B] text-white shadow-xs' : 'text-slate-600 hover:bg-[#FBF9F4] hover:text-[#16382B]'
                }`}>
                <Icon className="w-4 h-4" />
                {t[labelKey]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? t.hideFilters : t.showFilters}
            {hasActiveFilters && (
              <span className="ml-1 bg-[#16382B] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex gap-5 items-start">

          {/* Filter sidebar */}
          {showFilters && (
            <aside className="w-60 shrink-0 bg-white p-5 rounded-2xl border border-[#E2E7E3] sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h3 className="text-sm font-bold text-[#16382B] mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> {t.filterHeading}
              </h3>
              <FilterPanel
                t={t}
                activeTab={activeTab}
                selectedCity={selectedCity}     setSelectedCity={setSelectedCity}
                sortBy={sortBy}                 setSortBy={setSortBy}
                sortOptions={sortOptionKeys}
                minPrice={minPrice}             setMinPrice={setMinPrice}
                maxPrice={maxPrice}             setMaxPrice={setMaxPrice}
                selectedAvailability={selectedAvailability}     toggleAvailability={toggleAvailability}
                selectedDeliveryMode={selectedDeliveryMode}     toggleDeliveryMode={toggleDeliveryMode}
                selectedDeliveryOption={selectedDeliveryOption} toggleDeliveryOption={toggleDeliveryOption}
                providerSkill={providerSkill}   setProviderSkill={setProviderSkill}
                selectedExperience={selectedExperience}         setSelectedExperience={setSelectedExperience}
                selectedLanguages={selectedLanguages}           toggleLanguage={toggleLanguage}
                hasActiveFilters={hasActiveFilters}             clearAllFilters={clearAllFilters}
                setCurrentPage={setCurrentPage}
              />
            </aside>
          )}

          {/* Results column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Result count */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {!loading && !error && (
                <p className="text-sm text-slate-600">
                  {total > 0
                    ? <><span className="font-bold text-[#16382B]">{total}</span> {t.resultsFound(total).replace(/^\d+\s*/, '')}</>
                    : t.noResults
                  }
                  {(searchQuery || selectedCategory !== 'All') && (
                    <span className="ml-2 text-slate-400">
                      {searchQuery && t.resultsFor(searchQuery)}
                      {selectedCategory !== 'All' && ` ${t.resultsIn(t.categories[selectedCategory] ?? selectedCategory)}`}
                    </span>
                  )}
                </p>
              )}
              {loading && <p className="text-sm text-slate-400 animate-pulse">{t.loading}</p>}
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-800 text-sm">
                <p className="font-semibold">{t.errorTitle}</p>
                <p className="text-xs mt-1">{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-xs underline hover:no-underline">{t.errorDismiss}</button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#16382B]">
                <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">{t.loadingListings}</p>
              </div>
            )}

            {/* ── SERVICES grid ── */}
            {!loading && !error && activeTab === 'services' && (
              results.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">{t.noServicesFound}</h3>
                  <p className="text-slate-500 text-sm">{t.noServicesHint}</p>
                  {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs text-red-600 underline">{t.clearFilters}</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((service) => {
                    const provider = service.providerId || {};
                    const distLabel = service.distance != null
                      ? t.kmAway(service.distance.toFixed(1))
                      : (service.location?.city || provider.location?.city || '');
                    return (
                      <div key={service._id} className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="badge-sage text-xs">{t.categories[service.category] ?? service.category}</span>
                            <span className="font-editorial text-xl font-bold text-[#16382B] whitespace-nowrap">
                              ₹{service.price}
                              <span className="text-xs text-slate-500 font-sans"> / {t.priceTypes[service.priceType] ?? service.priceType}</span>
                            </span>
                          </div>
                          <h3 className="font-editorial text-lg font-bold text-[#16382B] line-clamp-2">{service.title}</h3>
                          {service.description && (
                            <p className="text-slate-500 text-sm italic line-clamp-2">&ldquo;{service.description}&rdquo;</p>
                          )}
                          {service.deliveryMode?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {service.deliveryMode.map((m) => (
                                <span key={m} className="text-[10px] bg-[#F0F4F1] text-[#16382B] font-semibold px-2 py-0.5 rounded-full">
                                  {t.deliveryModes[m] ?? m}
                                </span>
                              ))}
                            </div>
                          )}
                          {service.availability?.days?.length > 0 && (
                            <p className="text-xs text-slate-500">
                              {service.availability.days.slice(0, 3).map(d => (t.days[d] ?? d).slice(0, 3)).join(', ')}
                              {service.availability.days.length > 3 && ` +${service.availability.days.length - 3}`}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E7E3]">
                            <img src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name || t.skillProvider} className="w-9 h-9 rounded-full object-cover border" />
                            <div className="text-xs min-w-0">
                              <span className="font-bold text-[#16382B] block truncate">{provider.name || t.skillProvider}</span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                <span className="truncate">{distLabel}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/services/${service._id}`} className="btn-primary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1">
                          {t.viewService} <ArrowRight className="w-3.5 h-3.5" />
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
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">{t.noProductsFound}</h3>
                  <p className="text-slate-500 text-sm">{t.noProductsHint}</p>
                  {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs text-red-600 underline">{t.clearFilters}</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((product) => {
                    const provider = product.providerId || {};
                    const isOutOfStock = product.quantity === 0 || product.status === 'out_of_stock';
                    const distLabel = product.distance != null
                      ? t.kmAway(product.distance.toFixed(1))
                      : (product.location?.city || provider.location?.city || '');
                    return (
                      <div key={product._id} className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="relative">
                            <img src={(product.images?.[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                              alt={product.name} className="w-full h-40 rounded-2xl object-cover border border-[#E2E7E3]" />
                            {isOutOfStock ? (
                              <span className="absolute top-2 right-2 bg-red-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-full uppercase shadow-xs">{t.outOfStock}</span>
                            ) : (
                              <span className="absolute top-2 right-2 bg-white/90 text-[#16382B] text-[10px] font-bold py-1 px-2 rounded-full shadow-xs">
                                {t.unitsLeft(product.quantity, product.unit)}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <span className="badge-terracotta text-xs mb-1 inline-block">{t.categories[product.category] ?? product.category}</span>
                              <h3 className="font-editorial text-lg font-bold text-[#16382B] line-clamp-1">{product.name}</h3>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-editorial text-xl font-bold text-[#16382B]">₹{product.price}</span>
                              <span className="text-xs text-slate-500 block">{t.perUnit(product.unit)}</span>
                            </div>
                          </div>
                          {product.description && (
                            <p className="text-slate-500 text-sm italic line-clamp-2">&ldquo;{product.description}&rdquo;</p>
                          )}
                          <div className="flex items-center gap-2.5 pt-2 border-t border-[#E2E7E3]">
                            <img src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                              alt={provider.name || t.skillProvider} className="w-7 h-7 rounded-full object-cover border shrink-0" />
                            <div className="text-xs min-w-0">
                              <span className="font-semibold text-[#16382B] block truncate">{provider.name || t.skillProvider}</span>
                              {distLabel && (
                                <span className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                  <span className="truncate">{distLabel}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link to={`/products/${product._id}`} className="btn-primary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1 bg-[#C86D51] hover:bg-[#b55e43]">
                          {t.viewProduct} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── MATCHING PANEL ── */}
            {!loading && activeTab === 'providers' && (
              <div className="bg-white rounded-2xl border border-[#E2E7E3] overflow-hidden">
                <button onClick={() => setShowMatchPanel(v => !v)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#FBF9F4] transition-colors"
                  aria-expanded={showMatchPanel}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span className="text-sm font-bold text-[#16382B]">{t.matchPanelTitle}</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">{t.matchPanelSubtitle}</span>
                    {matchResults && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {t.matchRankedBadge(matchResults.length)}
                      </span>
                    )}
                  </div>
                  {showMatchPanel ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {showMatchPanel && (
                  <div className="p-4 pt-0 border-t border-[#E2E7E3] space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{t.matchReqSkills}</label>
                      <div className="flex gap-2">
                        <input type="text" value={matchSkillInput}
                          onChange={(e) => setMatchSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMatchSkill(); } }}
                          placeholder={t.matchSkillPh} className="input-editorial flex-1 text-sm py-2" />
                        <button onClick={addMatchSkill} disabled={!matchSkillInput.trim()} className="btn-secondary text-xs py-2 px-3 disabled:opacity-40">{t.matchAddSkill}</button>
                      </div>
                      {matchSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {matchSkills.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 bg-[#16382B] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              {s}
                              <button onClick={() => removeMatchSkill(s)} aria-label={`Remove ${s}`}><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{t.matchCity}</label>
                        <select value={matchCity} onChange={(e) => setMatchCity(e.target.value)} className="input-editorial w-full text-sm py-2 bg-white">
                          <option value="">{t.anyCity}</option>
                          {CITY_KEYS.filter(c => c !== 'All Cities').map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{t.matchAvailability}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {AVAIL_DAY_KEYS.map((day) => (
                            <button key={day} onClick={() => toggleMatchDay(day)}
                              className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                                matchDays.includes(day) ? 'bg-[#16382B] text-white' : 'bg-[#FBF9F4] text-slate-700 border border-[#E2E7E3] hover:border-[#16382B]'
                              }`}>
                              {(t.days[day] ?? day).slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={handleFindMatches} disabled={matchLoading}
                        className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-60">
                        {matchLoading
                          ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t.matchBtnLoading}</>
                          : <><Sparkles className="w-3.5 h-3.5" />{t.matchBtnFind}</>
                        }
                      </button>
                      {matchResults !== null && (
                        <button onClick={clearMatchResults} className="text-xs text-slate-500 hover:text-red-600 underline">{t.matchClearResults}</button>
                      )}
                    </div>

                    {matchError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{matchError}</p>}

                    {matchResults !== null && !matchLoading && (
                      matchResults.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          {t.matchNoResults}
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.matchRankedHeading(matchResults.length)}</p>
                          {matchResults.map((match) => {
                            const prov = match.provider || {};
                            const isExpanded = expandedMatch === match.providerId;
                            return (
                              <div key={match.providerId} className="bg-[#FBF9F4] rounded-2xl border border-[#E2E7E3] p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img src={prov.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                                      alt={prov.name || t.providerFallback} className="w-11 h-11 rounded-full object-cover border-2 border-[#16382B] shrink-0" />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-editorial text-base font-bold text-[#16382B] truncate">{prov.name || t.providerFallback}</span>
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      </div>
                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                                        {match.provider?.distanceKm != null ? `${match.provider.distanceKm} km away` : (prov.location?.city || t.locationUnavail)}
                                      </p>
                                    </div>
                                  </div>
                                  <MatchScore score={match.matchScore} inline />
                                </div>
                                <MatchBreakdown breakdown={match.breakdown} compact />
                                <button onClick={() => setExpandedMatch(isExpanded ? null : match.providerId)}
                                  className="text-xs text-[#16382B] font-semibold flex items-center gap-1 hover:underline" aria-expanded={isExpanded}>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  {isExpanded ? t.matchHideDetails : t.matchWhyThis}
                                </button>
                                {isExpanded && (
                                  <div className="border-t border-[#E2E7E3] pt-3 space-y-3">
                                    <MatchReasons reasons={match.reasons} compact />
                                    {prov.skills?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {prov.skills.map((s, i) => (
                                          <span key={i} className="badge-sage text-xs">{s.name}{s.experienceYears ? ` (${s.experienceYears}+ yrs)` : ''}</span>
                                        ))}
                                      </div>
                                    )}
                                    <Link to={`/providers/${match.providerId}`} className="btn-secondary text-xs py-2 w-full text-center flex items-center justify-center gap-1 bg-white hover:bg-[#FBF9F4] mt-1">
                                      {t.matchViewProfile} <ArrowRight className="w-3.5 h-3.5" />
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
                  <h3 className="font-editorial text-xl font-bold text-[#16382B]">{t.noProvidersFound}</h3>
                  <p className="text-slate-500 text-sm">{t.noProvidersHint}</p>
                  {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs text-red-600 underline">{t.clearFilters}</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {results.map((p) => (
                    <div key={p._id} className="bg-white p-5 rounded-3xl border border-[#E2E7E3] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={p.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                            alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#16382B] shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-editorial text-lg font-bold text-[#16382B] truncate">{p.name}</h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#16382B] shrink-0" />
                              {p.location?.city || 'Chennai'}{p.age ? ` · Age ${p.age}` : ''}
                            </p>
                            {p.rating && (
                              <p className="text-xs text-[#C07A46] font-bold flex items-center gap-0.5 mt-0.5">
                                <Star className="w-3 h-3 fill-current" /> {p.rating} {t.trusted}
                              </p>
                            )}
                          </div>
                        </div>
                        {p.bio && <p className="text-slate-500 text-sm italic line-clamp-2">&ldquo;{p.bio}&rdquo;</p>}
                        {p.skills?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.skillsLabel}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.skills.map((s, i) => (
                                <span key={i} className="badge-sage text-xs">{s.name}{s.experienceYears ? ` (${s.experienceYears}+ yrs)` : ''}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {p.languages?.length > 0 && (
                          <p className="text-xs text-slate-500">{t.speaksLabel(p.languages.join(', '))}</p>
                        )}
                      </div>
                      <Link to={`/providers/${p._id}`} className="btn-secondary text-xs py-2.5 w-full text-center flex items-center justify-center gap-1 bg-white hover:bg-[#FBF9F4]">
                        {t.viewProfile} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── PAGINATION ── */}
            {!loading && !error && (
              <div className="flex justify-center items-center gap-4 pt-4 border-t border-[#E2E7E3]">
                <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-secondary py-2.5 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                  <ChevronLeft className="w-4 h-4" /> {t.pagePrev}
                </button>
                <span className="text-sm font-bold text-[#16382B] min-w-[80px] text-center">
                  {t.pageOf(currentPage, totalPages)}
                </span>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary py-2.5 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                  {t.pageNext} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>{/* end results column */}
        </div>{/* end sidebar + results row */}

      </div>
    </div>
  );
}
