import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/listings/ProductForm';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(isEdit);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data.success) {
            setInitialData(res.data.product);
          }
        } catch (err) {
          setFetchError(err.message || 'Failed to fetch product listing.');
        } finally {
          setLoadingFetch(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);
      if (isEdit) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/provider/products');
    } catch (err) {
      console.error('[Save Product Error]:', err.message);
      alert(err.message || 'Failed to save product.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#16382B] font-semibold text-[#16382B]">Loading product details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-700 font-bold">{fetchError}</p>
        <button onClick={() => navigate('/provider/products')} className="btn-secondary text-sm">
          Return to My Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate('/provider/products')}
          className="text-xs font-bold text-[#16382B] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Products
        </button>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-sm space-y-6">
          <div>
            <span className="badge-terracotta uppercase tracking-wider text-xs">Handmade Product</span>
            <h1 className="font-editorial text-3xl font-bold text-[#16382B] mt-1">
              {isEdit ? 'Edit Your Product' : 'What would you like to sell?'}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Showcase something you make or prepare using your traditional expertise.
            </p>
          </div>

          <ProductForm
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
