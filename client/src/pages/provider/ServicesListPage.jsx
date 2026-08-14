import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import DeleteModal from '../../components/listings/DeleteModal';
import { Plus, Edit2, Pause, Play, Trash2, ArrowLeft, Briefcase, MapPin, Sparkles } from 'lucide-react';

export default function ServicesListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('published');
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProviderServices = async () => {
    const providerId = user?._id || user?.id;
    if (!providerId) return;
    try {
      setLoading(true);
      const res = await api.get(`/services?providerId=${providerId}`);
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error('[Fetch Services Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderServices();
  }, [user]);

  const handleToggleStatus = async (serviceId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'paused' : 'published';
    try {
      await api.patch(`/services/${serviceId}/status`, { status: nextStatus });
      fetchProviderServices();
    } catch (err) {
      alert(err.message || 'Failed to update service status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/services/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchProviderServices();
    } catch (err) {
      alert(err.message || 'Failed to delete service.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
              My Offered Services
            </h1>
            <p className="text-slate-600 text-sm">
              Manage your service offerings, pricing, and availability status.
            </p>
          </div>

          <button
            onClick={() => navigate('/provider/services/new')}
            className="btn-primary text-sm py-3 px-6 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Offer a New Service</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-[#E2E7E3] pb-1 overflow-x-auto">
          {[
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'paused', label: 'Paused' },
            { id: 'all', label: 'All Services' }
          ].map(tab => {
            const count = tab.id === 'all'
              ? services.length
              : services.filter(s => s.status === tab.id).length;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#16382B] text-white'
                    : 'text-slate-600 hover:text-[#16382B] hover:bg-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white text-[#16382B]' : 'bg-[#E6ECE7] text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center text-[#16382B] font-semibold">
            Loading your services...
          </div>
        ) : filteredServices.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 bg-[#E6ECE7] text-[#16382B] rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                {activeTab === 'all' ? "You haven't offered a service yet" : `No ${activeTab} services found`}
              </h3>
              <p className="text-slate-600 text-sm">
                Turn your traditional skills and experience into a flexible opportunity for others.
              </p>
            </div>
            <button
              onClick={() => navigate('/provider/services/new')}
              className="btn-primary py-3 px-6 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Service</span>
            </button>
          </div>
        ) : (
          /* SERVICES LIST GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div key={service._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs">
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="badge-sage text-xs mb-1">{service.category}</span>
                      <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                        {service.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-editorial text-2xl font-bold text-[#16382B]">₹{service.price}</span>
                      <span className="text-xs text-slate-500 block">/ {service.priceType}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm italic line-clamp-2">
                    "{service.description}"
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#16382B]">
                      <MapPin className="w-3.5 h-3.5" /> {service.location?.city || 'Chennai'}
                    </span>
                    <span>•</span>
                    <span>Modes: {service.deliveryMode?.join(', ') || 'Home Based'}</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3] mt-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                    service.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : service.status === 'paused'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {service.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(service._id, service.status)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-white"
                      title={service.status === 'published' ? 'Pause Service' : 'Resume Service'}
                    >
                      {service.status === 'published' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-700" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/provider/services/${service._id}/edit`)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-white"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(service)}
                      className="p-2 text-slate-400 hover:text-red-700 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
