import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../services/api';
import { Briefcase, CheckCircle2, IndianRupee, MapPin, User } from 'lucide-react';

const BUDGET_TYPE_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

function AcceptedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" />
      <span>Accepted</span>
    </span>
  );
}

export default function MyAcceptedServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (user?.role !== 'provider') {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center">
          <p className="text-slate-600">Only providers can view accepted services.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4 text-sm py-2 px-5">Go Back</button>
        </div>
      </div>
    );
  }

  const loadAcceptedServices = async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getMy();
      if (res.data.success) {
        setServices(res.data.applications.filter(app => app.status === 'accepted'));
      }
    } catch (err) {
      setError(err.message || 'Failed to load accepted services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcceptedServices();
    const interval = setInterval(() => {
      loadAcceptedServices();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">My Accepted Services</h1>
          <p className="text-slate-600 text-sm mt-1">
            Opportunities that customers have accepted from your applications.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No accepted services yet</h3>
            <p className="text-slate-500 text-sm">When a customer accepts one of your applications, it will appear here.</p>
            <button onClick={() => navigate('/opportunities')} className="btn-primary text-sm py-3 px-6">
              Browse Opportunities
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map(app => {
              const opp = app.opportunityId;
              const price = app.proposedPrice ?? opp?.budget;
              const budgetLabel = BUDGET_TYPE_LABELS[opp?.budgetType] || '';

              return (
                <div key={app._id} className="bg-white rounded-3xl border border-[#E2E7E3] p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="font-editorial text-xl font-bold text-[#16382B]">{opp?.title || 'Opportunity'}</h2>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span className="badge-sage text-xs">{opp?.category || 'Opportunity'}</span>
                        <AcceptedBadge />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#16382B]" />
                      <span className="font-medium text-[#16382B]">Customer:</span>
                      <span>{app.customerId?.name || 'Customer'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-[#16382B]" />
                      <span className="font-medium text-[#16382B]">Price:</span>
                      <span>
                        ₹{Number(price || 0).toLocaleString('en-IN')}
                        {budgetLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-[#16382B]" />
                      <span className="font-medium text-[#16382B]">Location:</span>
                      <span>{opp?.location?.city || 'Location not provided'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
