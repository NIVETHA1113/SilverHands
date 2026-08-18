import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityAPI } from '../../services/api';
import {
  Search, MapPin, IndianRupee, Briefcase, ChevronLeft, ChevronRight,
  Filter, X, Plus, Clock
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Cooking', 'Tailoring', 'Teaching', 'Tutoring', 'Gardening',
  'Handicrafts', 'Music', 'Dance', 'Traditional Arts', 'Beauty',
  'Language Training', 'Consulting', 'Cleaning', 'Caregiving', 'Other'
];

const BUDGET_TYPE_LABELS = { fixed: 'Fixed', per_hour: '/hr', per_day: '/day' };

function StatusBadge({ status }) {
  const map = {
    open:      'badge-sage',
    paused:    'bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full',
    closed:    'bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full',
    completed: 'bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full',
  };
  return <span className={map[status] || map.open}>{status}</span>;
}

export default function OpportunitiesListPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  // Auto-seed from URL param → then user's profile city → then empty
  const profileCity = user?.location?.city || '';
  const [city, setCity] = useState(searchParams.get('city') || profileCity);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  // True when city was set automatically from the user's profile (not a manual/URL param)
  const [usingProfileCity, setUsingProfileCity] = useState(
    !searchParams.get('city') && !!profileCity
  );

  const clearLocationFilter = () => {
    setCity('');
    setUsingProfileCity(false);
    setPage(1);
  };

  const isCustomer = user?.role === 'customer';
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {
          status: 'open',
          sort: sortBy,
          page,
          limit: 12,
        };
        if (search.trim()) params.search = search.trim();
        if (category && category !== 'All') params.category = category;
        if (city.trim()) params.city = city.trim();

        const res = await opportunityAPI.getAll(params);
        if (res.data.success) {
          setOpportunities(res.data.opportunities || []);
          setTotalPages(res.data.pages || 1);
        }
      } catch (err) {
        console.error('[OpportunitiesListPage]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, category, city, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero + Actions */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <span className="badge-sage uppercase tracking-wider text-xs">Open Opportunities</span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
                {city ? `Opportunities near ${city}` : 'Browse Opportunities'}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl">
                Customers post tasks they need help with. Apply as a provider to offer your skills.
              </p>
              {city && (
                <div className="inline-flex items-center gap-2 bg-[#E6ECE7] text-[#16382B] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D2DDD5]">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Filtered by: {city}</span>
                  <button
                    onClick={clearLocationFilter}
                    className="ml-1 hover:text-red-600 transition-colors"
                    title="Clear location filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {isAuthenticated && isCustomer && (
              <button
                onClick={() => navigate('/opportunities/create')}
                className="btn-primary text-sm py-3 px-6 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Post Opportunity</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, skill, or city..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-editorial"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-primary text-sm py-3 px-5"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E2E7E3]">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={e => { setCategory(e.target.value); setPage(1); }}
                  className="input-editorial text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={e => { setCity(e.target.value); setUsingProfileCity(false); setPage(1); }}
                  className="input-editorial text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="input-editorial text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_asc">Budget: Low to High</option>
                  <option value="budget_desc">Budget: High to Low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
              {city ? `No opportunities found in ${city}` : 'No open opportunities'}
            </h3>
            <p className="text-slate-500 text-sm">
              {city
                ? `There are no open opportunities in ${city} right now.`
                : isCustomer
                  ? 'Be the first to post an opportunity for local providers to apply.'
                  : 'No open opportunities match your search. Try adjusting filters.'}
            </p>
            {city && (
              <button onClick={clearLocationFilter} className="btn-secondary text-sm py-2.5 px-5">
                <X className="w-4 h-4" /> Show all cities
              </button>
            )}
            {isCustomer && (
              <button onClick={() => navigate('/opportunities/create')} className="btn-primary text-sm py-3 px-6">
                <Plus className="w-4 h-4" /> Post Opportunity
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map(opp => (
                <OpportunityCard key={opp._id} opp={opp} isProvider={isProvider} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-[#E2E7E3] bg-white hover:border-[#16382B] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-slate-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-[#E2E7E3] bg-white hover:border-[#16382B] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function OpportunityCard({ opp, isProvider }) {
  const navigate = useNavigate();
  const budgetLabel = BUDGET_TYPE_LABELS[opp.budgetType] || '';

  return (
    <div
      className="bg-white rounded-3xl border border-[#E2E7E3] p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4 cursor-pointer"
      onClick={() => navigate(`/opportunities/${opp._id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="badge-sage text-xs">{opp.category}</span>
          {opp.applicationCount !== undefined && (
            <span className="text-[11px] font-bold text-[#C86D51] bg-[#FDF0EC] px-2 py-0.5 rounded-full">
              {opp.applicationCount} {opp.applicationCount === 1 ? 'Application' : 'Applications'}
            </span>
          )}
        </div>
        <StatusBadge status={opp.status} />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-editorial text-xl font-bold text-[#16382B] leading-snug line-clamp-2">
          {opp.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-2">{opp.description}</p>
      </div>

      {opp.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opp.skills.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-[#F0F4F1] text-[#16382B] px-2.5 py-0.5 rounded-full font-medium">{s}</span>
          ))}
          {opp.skills.length > 3 && (
            <span className="text-xs text-slate-400">+{opp.skills.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-600 pt-1 border-t border-[#F0F4F1]">
        <span className="flex items-center gap-1 font-semibold text-[#16382B]">
          <IndianRupee className="w-3.5 h-3.5" />
          {opp.budget?.toLocaleString('en-IN')}{budgetLabel}
        </span>
        {opp.location?.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#16382B]" />
            {opp.location.city}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {opp.customerId?.profileImage && (
            <img
              src={opp.customerId.profileImage}
              alt={opp.customerId.name}
              className="w-6 h-6 rounded-full object-cover border border-[#E2E7E3]"
            />
          )}
          <span className="text-xs text-slate-500">{opp.customerId?.name}</span>
        </div>
        {isProvider && (
          <button
            onClick={e => { e.stopPropagation(); navigate(`/opportunities/${opp._id}`); }}
            className="btn-primary text-xs py-2 px-4"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
