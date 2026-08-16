import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityAPI, applicationAPI } from '../../services/api';
import {
  Plus, Briefcase, MapPin, IndianRupee, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Eye, Star, Trash2, PauseCircle, PlayCircle
} from 'lucide-react';

const BUDGET_TYPE_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

function StatusBadge({ status }) {
  const map = {
    open:      'bg-emerald-100 text-emerald-800',
    paused:    'bg-amber-100 text-amber-800',
    closed:    'bg-slate-100 text-slate-600',
    completed: 'bg-blue-100 text-blue-800',
  };
  return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${map[status] || map.open}`}>{status}</span>;
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

function AppBadge({ status }) {
  const map = {
    pending:   'bg-amber-100 text-amber-800 border-amber-200',
    accepted:  'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected:  'bg-red-100 text-red-700 border-red-200',
    withdrawn: 'bg-slate-100 text-slate-500 border-slate-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  const icons = {
    pending:   <Clock className="w-3 h-3" />,
    accepted:  <CheckCircle2 className="w-3 h-3" />,
    rejected:  <XCircle className="w-3 h-3" />,
    withdrawn: <XCircle className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${map[status] || map.pending}`}>
      {icons[status] || null}
      <span>{formatApplicationStatus(status)}</span>
    </span>
  );
}

export default function MyOpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [applications, setApplications] = useState({});
  const [loadingApps, setLoadingApps] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  if (user?.role !== 'customer') {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center">
          <p className="text-slate-600">Only customers can view their opportunities.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm py-2 px-5">Go Back</button>
        </div>
      </div>
    );
  }

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await opportunityAPI.getMy();
      if (res.data.success) setOpportunities(res.data.opportunities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
    const interval = setInterval(() => {
      loadOpportunities();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = async (opp) => {
    const isOpen = expandedId === opp._id;
    setExpandedId(isOpen ? null : opp._id);
    if (!isOpen && !applications[opp._id]) {
      setLoadingApps(p => ({ ...p, [opp._id]: true }));
      try {
        const res = await opportunityAPI.getApplications(opp._id);
        if (res.data.success) {
          setApplications(p => ({ ...p, [opp._id]: res.data.applications }));
        }
      } catch (err) {
        setApplications(p => ({ ...p, [opp._id]: [] }));
      } finally {
        setLoadingApps(p => ({ ...p, [opp._id]: false }));
      }
    }
  };

  const handleAction = async (actionFn, appId, oppId, actionKey) => {
    setActionLoading(p => ({ ...p, [actionKey]: true }));
    try {
      const res = await actionFn(appId);
      if (res.data.success) {
        // Refresh applications for this opportunity
        const appsRes = await opportunityAPI.getApplications(oppId);
        if (appsRes.data.success) {
          setApplications(p => ({ ...p, [oppId]: appsRes.data.applications }));
        }
        // Refresh opportunity list to reflect status changes
        const oppsRes = await opportunityAPI.getMy();
        if (oppsRes.data.success) setOpportunities(oppsRes.data.opportunities);
      }
    } catch (err) {
      console.error('[MyOpp action]:', err.message);
    } finally {
      setActionLoading(p => ({ ...p, [actionKey]: false }));
    }
  };

  const handleStatusUpdate = async (oppId, status) => {
    const key = `status_${oppId}`;
    setActionLoading(p => ({ ...p, [key]: true }));
    try {
      await opportunityAPI.updateStatus(oppId, status);
      const res = await opportunityAPI.getMy();
      if (res.data.success) setOpportunities(res.data.opportunities);
    } catch (err) {
      console.error('[Status update]:', err.message);
    } finally {
      setActionLoading(p => ({ ...p, [key]: false }));
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
    try {
      await opportunityAPI.delete(oppId);
      setOpportunities(opps => opps.filter(o => o._id !== oppId));
    } catch (err) {
      console.error('[Delete opp]:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">My Opportunities</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your posted opportunities and review applications.</p>
          </div>
          <button onClick={() => navigate('/opportunities/create')} className="btn-primary text-sm py-3 px-6 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Post New</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No opportunities yet</h3>
            <p className="text-slate-500 text-sm">Post your first opportunity to find skilled providers near you.</p>
            <button onClick={() => navigate('/opportunities/create')} className="btn-primary text-sm py-3 px-6">
              <Plus className="w-4 h-4" /> Post Opportunity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map(opp => {
              const isExpanded = expandedId === opp._id;
              const apps = applications[opp._id] || [];
              const budgetLabel = BUDGET_TYPE_LABELS[opp.budgetType] || '';

              return (
                <div key={opp._id} className="bg-white rounded-3xl border border-[#E2E7E3] shadow-xs overflow-hidden">
                  {/* Opportunity row */}
                  <div
                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-[#FAF9F6]/60 transition-colors"
                    onClick={() => toggleExpand(opp)}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge-sage text-xs">{opp.category}</span>
                        <StatusBadge status={opp.status} />
                        <span className="font-bold text-xs text-[#C86D51] bg-[#FDF0EC] px-2.5 py-0.5 rounded-full border border-[#F8DACE]">
                          {opp.applicationCount !== undefined ? opp.applicationCount : (apps.length || 0)} {((opp.applicationCount !== undefined ? opp.applicationCount : apps.length) === 1) ? 'Application' : 'Applications'}
                        </span>
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#16382B] truncate">{opp.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <IndianRupee className="w-3 h-3" />
                          {opp.budget?.toLocaleString('en-IN')} {budgetLabel}
                        </span>
                        {opp.location?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {opp.location.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0" onClick={e => e.stopPropagation()}>
                      {/* Status toggles */}
                      {opp.status === 'open' && (
                        <button
                          onClick={() => handleStatusUpdate(opp._id, 'paused')}
                          disabled={actionLoading[`status_${opp._id}`]}
                          className="btn-secondary text-xs py-2 px-3"
                          title="Pause"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {opp.status === 'paused' && (
                        <button
                          onClick={() => handleStatusUpdate(opp._id, 'open')}
                          disabled={actionLoading[`status_${opp._id}`]}
                          className="btn-secondary text-xs py-2 px-3"
                          title="Re-open"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {['open', 'paused'].includes(opp.status) && (
                        <button
                          onClick={() => handleStatusUpdate(opp._id, 'closed')}
                          disabled={actionLoading[`status_${opp._id}`]}
                          className="btn-secondary text-xs py-2 px-3 text-slate-500"
                          title="Close"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Link
                        to={`/opportunities/${opp._id}`}
                        className="btn-secondary text-xs py-2 px-3"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(opp._id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(opp)}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>Applications ({opp.applicationCount !== undefined ? opp.applicationCount : (apps.length || 0)})</span>
                      </button>
                    </div>
                  </div>

                  {/* Applications panel */}
                  {isExpanded && (
                    <div className="border-t border-[#E2E7E3] bg-[#FAFAF8] p-6 space-y-4">
                      <h4 className="font-editorial text-lg font-bold text-[#16382B]">
                        Applications ({apps.length})
                      </h4>

                      {loadingApps[opp._id] ? (
                        <div className="flex justify-center py-6">
                          <div className="w-6 h-6 border-2 border-[#16382B] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : apps.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No applications yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {apps.map(app => (
                            <ApplicationRow
                              key={app._id}
                              app={app}
                              opp={opp}
                              hasAccepted={apps.some(a => a.status === 'accepted')}
                              onAccept={() => handleAction(applicationAPI.accept, app._id, opp._id, `accept_${app._id}`)}
                              onReject={() => handleAction(applicationAPI.reject, app._id, opp._id, `reject_${app._id}`)}
                              onComplete={() => handleAction(applicationAPI.complete, app._id, opp._id, `complete_${app._id}`)}
                              acceptLoading={actionLoading[`accept_${app._id}`]}
                              rejectLoading={actionLoading[`reject_${app._id}`]}
                              completeLoading={actionLoading[`complete_${app._id}`]}
                              navigate={navigate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationRow({ app, opp, hasAccepted, onAccept, onReject, onComplete, acceptLoading, rejectLoading, completeLoading, navigate }) {
  const provider = app.providerId;
  const budgetLabel = BUDGET_TYPE_LABELS[opp.budgetType] || '';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E3] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={provider?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
            alt={provider?.name}
            className="w-10 h-10 rounded-full object-cover border border-[#E2E7E3]"
          />
          <div>
            <p className="font-semibold text-[#16382B] text-sm">{provider?.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {provider?.location?.city || 'N/A'}
              {provider?.rating && (
                <span className="ml-2 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-[#C07A46] text-[#C07A46]" /> {provider.rating}
                </span>
              )}
            </p>
          </div>
        </div>
        <AppBadge status={app.status} />
      </div>

      {app.message && (
        <p className="text-sm text-slate-600 bg-[#FAFAF8] rounded-xl p-3 border border-[#F0F4F1] italic">
          "{app.message}"
        </p>
      )}

      {app.proposedPrice != null && (
        <p className="text-sm font-semibold text-[#16382B]">
          Proposed: ₹{app.proposedPrice.toLocaleString('en-IN')} {budgetLabel}
        </p>
      )}

      {provider?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.skills.slice(0, 4).map(s => (
            <span key={s.name || s} className="text-xs bg-[#F0F4F1] text-[#16382B] px-2 py-0.5 rounded-full">
              {s.name || s}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1 items-center">
        {app.status === 'pending' && (
          <>
            <button
              onClick={onAccept}
              disabled={acceptLoading || hasAccepted}
              className={`btn-primary text-xs py-2 px-4 ${hasAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={hasAccepted ? 'Another application has already been accepted for this opportunity.' : 'Accept application'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{acceptLoading ? 'Accepting...' : 'Accept'}</span>
            </button>
            <button
              onClick={onReject}
              disabled={rejectLoading}
              className="btn-secondary text-xs py-2 px-4 text-red-600 border-red-200 hover:border-red-400"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{rejectLoading ? 'Rejecting...' : 'Reject'}</span>
            </button>
          </>
        )}
        {app.status === 'accepted' && (
          <>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
            </span>
            <button
              onClick={onComplete}
              disabled={completeLoading}
              className="btn-primary text-xs py-2 px-4"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completeLoading ? 'Completing...' : 'Mark Complete'}</span>
            </button>
            <button
              onClick={onReject}
              disabled={rejectLoading}
              className="btn-secondary text-xs py-2 px-4 text-red-600 border-red-200"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </>
        )}
        {app.status === 'rejected' && (
          <span className="text-xs text-red-600 font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        )}
        {app.status === 'withdrawn' && (
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Withdrawn
          </span>
        )}
        {app.status === 'completed' && (
          <>
            <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
            <button
              onClick={() => navigate(`/applications/${app._id}/review`)}
              className="btn-primary text-xs py-2 px-4 bg-[#C07A46] hover:bg-[#a8662e]"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Leave Review</span>
            </button>
          </>
        )}
        <Link
          to={`/providers/${provider?._id}`}
          className="btn-secondary text-xs py-2 px-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
