import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ServiceForm from '../../components/listings/ServiceForm';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function ServiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(isEdit);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchService = async () => {
        try {
          const res = await api.get(`/services/${id}`);
          if (res.data.success) {
            setInitialData(res.data.service);
          }
        } catch (err) {
          setFetchError(err.message || 'Failed to fetch service listing.');
        } finally {
          setLoadingFetch(false);
        }
      };
      fetchService();
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);
      if (isEdit) {
        await api.put(`/services/${id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      navigate('/provider/services');
    } catch (err) {
      console.error('[Save Service Error]:', err.message);
      alert(err.message || 'Failed to save service.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#16382B] font-semibold text-[#16382B]">Loading service details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-700 font-bold">{fetchError}</p>
        <button onClick={() => navigate('/provider/services')} className="btn-secondary text-sm">
          Return to My Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate('/provider/services')}
          className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </button>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm space-y-6">
          <div>
            <span className="badge-sage uppercase tracking-wider text-xs">Service Offering</span>
            <h1 className="font-editorial text-3xl font-bold text-[#16382B] mt-1">
              {isEdit ? 'Edit Your Service' : 'What service would you like to offer?'}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Share your skills and traditional experience with people looking for them.
            </p>
          </div>

          <ServiceForm
            initialData={initialData || {}}
            onSubmit={handleSubmit}
            loading={loadingSubmit}
            isEdit={isEdit}
          />
        </div>

      </div>
    </div>
  );
}
