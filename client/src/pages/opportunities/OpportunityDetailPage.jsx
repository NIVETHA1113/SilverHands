import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityAPI, applicationAPI, reviewAPI } from '../../services/api';
import {
  ArrowLeft, MapPin, IndianRupee, Calendar, Star, ShieldCheck,
  CheckCircle2, Clock, XCircle, User, Send, AlertCircle
} from 'lucide-react';

const BUDGET_TYPE_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

function StatusBadge({ status }) {
  const styles = {
    open:      'bg-emerald-100 text-emerald-800',
    paused:    'bg-amber-100 text-amber-800',
    closed:    'bg-slate-100 text-slate-600',
    completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${styles[status] || styles.open}`}>
      {status}
    </span>
  );
}

const formatApplicationStatus = (status) => {
  const labels = {
    pending: 'Application Sent / Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    completed: 'Completed'
  };
  return labels[status] || status;
};

function AppStatusBadge({ status }) {
  const styles = {
    pending:   'bg-amber-100 text-amber-800',
    accepted:  'bg-emerald-100 text-emerald-800',
    rejected:  'bg-red-100 text-red-700',
    withdrawn: 'bg-slate-100 text-slate-500',
    completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {formatApplicationStatus(status)}
    </span>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply form state
  const [applyMessage, setApplyMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  // Trust / reviews
  const [trust, setTrust] = useState(null);

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';
  const isOwner = opp && user && opp.customerId?._id === (user._id || user.id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await opportunityAPI.getById(id);
        if (res.data.success) {
          setOpp(res.data.opportunity);

          // Fetch customer trust
          const cid = res.data.opportunity.customerId?._id;
          if (cid) {
            try {
              const tr = await reviewAPI.getProviderTrust(cid);
              if (tr.data.success) setTrust(tr.data.trust);
            } catch (_) {}
          }
        }
      } catch (err) {
        setError(err.message || 'Opportunity not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Check if this provider already applied
  useEffect(() => {
    if (!isProvider || !isAuthenticated) return;
    const checkApp = async () => {
      try {
        const res = await applicationAPI.getMy();
        if (res.data.success) {
          const found = res.data.applications.find(
            a => a.opportunityId?._id === id || a.opportunityId === id
          );
          setExistingApp(found || null);
        }
      } catch (_) {}
    };
    checkApp();
    const interval = setInterval(checkApp, 8000);
    return () => clearInterval(interval);
  }, [id, isProvider, isAuthenticated]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyMessage.trim()) { setApplyError('Please write a message.'); return; }
    setApplying(true);
    setApplyError('');
    try {
      const res = await opportunityAPI.apply(id, {
        message: applyMessage.trim(),
        proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
      });
      if (res.data.success) {
        setApplySuccess(true);
        setExistingApp(res.data.application);
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center max-w-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-slate-600">{error || 'Opportunity not found.'}</p>
          <button onClick={() => navigate('/opportunities')} className="btn-secondary text-sm py-2 px-5">
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  const budgetLabel = BUDGET_TYPE_LABELS[opp.budgetType] || '';
  const canApply = isProvider && isAuthenticated && opp.status === 'open' && !existingApp;

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back */}
        <button onClick={() => navigate('/opportunities')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#16382B] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className="bg-white rounded-3xl border border-[#E2E7E3] p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge-sage text-xs">{opp.category}</span>
                  {opp.applicationCount !== undefined && (
                    <span className="text-xs font-bold text-[#C86D51] bg-[#FDF0EC] px-2.5 py-0.5 rounded-full border border-[#F8DACE]">
                      {opp.applicationCount} {opp.applicationCount === 1 ? 'Application Received' : 'Applications Received'}
                    </span>
                  )}
                </div>
                <StatusBadge status={opp.status} />
              </div>

              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#16382B] leading-snug">
                {opp.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-[#16382B]">
                  <IndianRupee className="w-4 h-4" />
                  ₹{opp.budget?.toLocaleString('en-IN')} {budgetLabel}
                </span>
                {opp.location?.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#16382B]" />
                    {opp.location.city}
                  </span>
                )}
                {opp.availability?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#16382B]" />
                    {opp.availability.join(', ')}
                  </span>
                )}
              </div>

              <p className="text-slate-700 text-base leading-relaxed">{opp.description}</p>

              {opp.skills?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {opp.skills.map(s => (
                      <span key={s} className="badge-sage text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply section — provider only */}
            {isAuthenticated && isProvider && (
              <div className="bg-white rounded-3xl border border-[#E2E7E3] p-8 shadow-xs space-y-5">
                <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Apply to this Opportunity</h2>

                {existingApp ? (
                  <div className="space-y-3">
                    <div className="bg-[#E6ECE7] rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#16382B] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#16382B]">Application submitted</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Status: <AppStatusBadge status={existingApp.status} />
                        </p>
                        {existingApp.message && (
                          <p className="text-sm text-slate-600 mt-2 italic">"{existingApp.message}"</p>
                        )}
                      </div>
                    </div>
                    <Link to="/applications/my" className="btn-secondary text-sm py-2.5 px-5">
                      View My Applications
                    </Link>
                  </div>
                ) : opp.status !== 'open' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    This opportunity is {opp.status} and not accepting applications.
                  </div>
                ) : !isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-slate-600 text-sm">Log in as a provider to apply.</p>
                    <Link to="/login" className="btn-primary text-sm py-3 px-6">Log In</Link>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    {applySuccess ? (
                      <div className="bg-[#E6ECE7] rounded-2xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#16382B] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#16382B]">Application submitted successfully!</p>
                          <p className="text-xs text-slate-600 mt-0.5">The customer will review and respond.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {applyError && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{applyError}</div>
                        )}
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#16382B]">Your Message <span className="text-red-500">*</span></label>
                          <textarea
                            rows={4}
                            placeholder="Introduce yourself. Why are you a good fit? Include relevant experience..."
                            value={applyMessage}
                            onChange={e => setApplyMessage(e.target.value)}
                            className="input-editorial resize-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#16382B]">Your Proposed Price (₹) <span className="text-slate-400 font-normal">(optional)</span></label>
                          <input
                            type="number"
                            min="0"
                            placeholder={`Budget: ₹${opp.budget} ${budgetLabel}`}
                            value={proposedPrice}
                            onChange={e => setProposedPrice(e.target.value)}
                            className="input-editorial"
                          />
                        </div>
                        <button type="submit" disabled={applying} className="btn-primary text-sm py-3.5 px-7">
                          <Send className="w-4 h-4" />
                          <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Customer actions */}
            {isOwner && (
              <div className="bg-white rounded-3xl border border-[#E2E7E3] p-8 shadow-xs space-y-4">
                <h2 className="font-editorial text-2xl font-bold text-[#16382B]">Manage this Opportunity</h2>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/opportunities/my`}
                    className="btn-secondary text-sm py-2.5 px-5"
                  >
                    View Applications
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar — Posted by */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E2E7E3] p-6 shadow-xs space-y-5">
              <h3 className="font-editorial text-lg font-bold text-[#16382B]">Posted by</h3>
              <div className="flex items-center gap-3">
                <img
                  src={opp.customerId?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                  alt={opp.customerId?.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E2E7E3]"
                />
                <div>
                  <p className="font-semibold text-[#16382B] text-sm">{opp.customerId?.name}</p>
                  {opp.customerId?.location?.city && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {opp.customerId.location.city}
                    </p>
                  )}
                </div>
              </div>

              {trust && trust.totalReviews > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F0F4F1]">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#C07A46] text-[#C07A46]" />
                    <span className="font-bold text-[#16382B] text-sm">{trust.avgRating}</span>
                    <span className="text-xs text-slate-500">({trust.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-600">{trust.completedJobs} completed jobs</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-3xl border border-[#E2E7E3] p-6 shadow-xs space-y-4">
              <h3 className="font-editorial text-lg font-bold text-[#16382B]">Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</dt>
                  <dd className="text-[#16382B] font-semibold mt-0.5">₹{opp.budget?.toLocaleString('en-IN')} {budgetLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</dt>
                  <dd className="text-slate-700 mt-0.5">{opp.category}</dd>
                </div>
                {opp.location?.city && (
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</dt>
                    <dd className="text-slate-700 mt-0.5">{opp.location.city}</dd>
                  </div>
                )}
                {opp.availability?.length > 0 && (
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</dt>
                    <dd className="text-slate-700 mt-0.5">{opp.availability.join(', ')}</dd>
                  </div>
                )}
                {opp.applicationCount !== undefined && (
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</dt>
                    <dd className="text-[#16382B] font-semibold mt-0.5">{opp.applicationCount} received</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</dt>
                  <dd className="mt-0.5"><StatusBadge status={opp.status} /></dd>
                </div>
              </dl>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
