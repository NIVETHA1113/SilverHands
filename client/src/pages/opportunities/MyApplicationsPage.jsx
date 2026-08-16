import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../services/api';
import {
  Briefcase, MapPin, IndianRupee, Clock, CheckCircle2,
  XCircle, Star, Eye, AlertCircle
} from 'lucide-react';

const BUDGET_TYPE_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

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
  const map = {
    pending:   'bg-amber-100 text-amber-800',
    accepted:  'bg-emerald-100 text-emerald-800',
    rejected:  'bg-red-100 text-red-700',
    withdrawn: 'bg-slate-100 text-slate-500',
    completed: 'bg-blue-100 text-blue-800',
  };
  const icons = {
    pending:   <Clock className="w-3 h-3" />,
    accepted:  <CheckCircle2 className="w-3 h-3" />,
    rejected:  <XCircle className="w-3 h-3" />,
    withdrawn: <XCircle className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${map[status] || map.pending}`}>
      {icons[status]} {formatApplicationStatus(status)}
    </span>
  );
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState({});

  if (user?.role !== 'provider') {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center">
          <p className="text-slate-600">Only providers can view their applications.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm py-2 px-5">Go Back</button>
        </div>
      </div>
    );
  }

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getMy();
      if (res.data.success) setApplications(res.data.applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
    const interval = setInterval(() => {
      loadApplications();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(p => ({ ...p, [appId]: true }));
    try {
      const res = await applicationAPI.withdraw(appId);
      if (res.data.success) {
        await loadApplications();
      }
    } catch (err) {
      console.error('[Withdraw]:', err.message);
    } finally {
      setWithdrawing(p => ({ ...p, [appId]: false }));
    }
  };

  // Group by status
  const pending   = applications.filter(a => a.status === 'pending');
  const accepted  = applications.filter(a => a.status === 'accepted');
  const completed = applications.filter(a => a.status === 'completed');
  const other     = applications.filter(a => ['rejected', 'withdrawn'].includes(a.status));

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">My Applications</h1>
          <p className="text-slate-600 text-sm mt-1">
            Track the status of all opportunities you've applied to.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No applications yet</h3>
            <p className="text-slate-500 text-sm">Browse open opportunities and apply to ones that match your skills.</p>
            <button onClick={() => navigate('/opportunities')} className="btn-primary text-sm py-3 px-6">
              Browse Opportunities
            </button>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pending', count: pending.length, color: 'text-amber-700' },
                { label: 'Accepted', count: accepted.length, color: 'text-emerald-700' },
                { label: 'Completed', count: completed.length, color: 'text-blue-700' },
                { label: 'Total', count: applications.length, color: 'text-[#16382B]' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E2E7E3] p-4 text-center shadow-xs">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <p className={`font-editorial text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
                </div>
              ))}
            </div>

            {/* Accepted — action required */}
            {accepted.length > 0 && (
              <Section title="Accepted — Action Required" badge="badge-terracotta text-xs">
                {accepted.map(app => (
                  <AppCard
                    key={app._id}
                    app={app}
                    onWithdraw={handleWithdraw}
                    withdrawing={withdrawing[app._id]}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <Section title="Pending Review">
                {pending.map(app => (
                  <AppCard
                    key={app._id}
                    app={app}
                    onWithdraw={handleWithdraw}
                    withdrawing={withdrawing[app._id]}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <Section title="Completed">
                {completed.map(app => (
                  <AppCard
                    key={app._id}
                    app={app}
                    onWithdraw={handleWithdraw}
                    withdrawing={withdrawing[app._id]}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

            {/* Rejected / Withdrawn */}
            {other.length > 0 && (
              <Section title="Rejected / Withdrawn">
                {other.map(app => (
                  <AppCard
                    key={app._id}
                    app={app}
                    onWithdraw={handleWithdraw}
                    withdrawing={withdrawing[app._id]}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="font-editorial text-xl font-bold text-[#16382B]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AppCard({ app, onWithdraw, withdrawing, navigate }) {
  const opp = app.opportunityId;
  const review = app.review || null;
  const budgetLabel = BUDGET_TYPE_LABELS[opp?.budgetType] || '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
  const imageUrl = app.reviewImage ? (app.reviewImage.startsWith('http') ? app.reviewImage : `${baseUrl}${app.reviewImage}`) : '';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {opp?.category && <span className="badge-sage text-xs">{opp.category}</span>}
            <AppStatusBadge status={app.status} />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#16382B] truncate">
            {opp?.title || 'Opportunity'}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        {opp?.budget != null && (
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <IndianRupee className="w-3 h-3" />
            {opp.budget.toLocaleString('en-IN')} {budgetLabel}
          </span>
        )}
        {opp?.location?.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {opp.location.city}
          </span>
        )}
        {app.proposedPrice != null && (
          <span className="font-medium text-[#16382B]">
            Your price: ₹{app.proposedPrice.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {app.message && (
        <p className="text-sm text-slate-600 bg-[#FAFAF8] rounded-xl p-3 border border-[#F0F4F1] italic line-clamp-2">
          "{app.message}"
        </p>
      )}

      {/* Posted by */}
      {app.customerId && (
        <p className="text-xs text-slate-500">
          Posted by: <span className="font-semibold text-slate-700">{app.customerId.name}</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {opp?._id && (
          <Link to={`/opportunities/${opp._id}`} className="btn-secondary text-xs py-2 px-4">
            <Eye className="w-3.5 h-3.5" /> View Opportunity
          </Link>
        )}
        {app.status === 'pending' && (
          <button
            onClick={() => onWithdraw(app._id)}
            disabled={withdrawing}
            className="btn-secondary text-xs py-2 px-4 text-red-600 border-red-200 hover:border-red-400"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{withdrawing ? 'Withdrawing...' : 'Withdraw'}</span>
          </button>
        )}
        {app.status === 'accepted' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Application accepted! Waiting for completion.
          </div>
        )}
        {app.status === 'completed' && (
          <div className="space-y-3 border-t border-[#F0F4F1] pt-3">
            {imageUrl && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion Image</p>
                <img src={imageUrl} alt="Completed work" className="w-full max-h-52 object-cover rounded-2xl border border-[#E2E7E3]" />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Review</p>
              {review ? (
                <>
                  <div className="flex items-center gap-1 text-[#C07A46] text-sm">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < review.rating ? 'fill-[#C07A46] text-[#C07A46]' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="ml-1 text-slate-600 text-xs">({review.rating}/5)</span>
                  </div>
                  <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Customer: <span className="font-semibold text-slate-700">{review.customerId?.name || app.customerId?.name || 'Customer'}</span></span>
                    <span>Reviewed: {new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>Rating: {review.rating}/5</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Review pending</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
