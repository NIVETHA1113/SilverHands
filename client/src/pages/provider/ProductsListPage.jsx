import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import DeleteModal from '../../components/listings/DeleteModal';
import { Plus, Edit2, Pause, Play, Trash2, ArrowLeft, Package, MapPin, Tag } from 'lucide-react';

export default function ProductsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('published');
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProviderProducts = async () => {
    const providerId = user?._id || user?.id;
    if (!providerId) return;
    try {
      setLoading(true);
      const res = await api.get(`/products?providerId=${providerId}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('[Fetch Products Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderProducts();
  }, [user]);

  const handleUpdateQuantity = async (productId, newQty) => {
    const qty = Math.max(0, Number(newQty));
    try {
      await api.patch(`/products/${productId}/status`, { quantity: qty });
      fetchProviderProducts();
    } catch (err) {
      alert(err.message || 'Failed to update stock quantity.');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'paused' : 'published';
    try {
      await api.patch(`/products/${productId}/status`, { status: nextStatus });
      fetchProviderProducts();
    } catch (err) {
      alert(err.message || 'Failed to update product status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/products/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchProviderProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
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
              My Handmade Products
            </h1>
            <p className="text-slate-600 text-sm">
              Manage your handmade items, inventory stock, and delivery options.
            </p>
          </div>

          <button
            onClick={() => navigate('/provider/products/new')}
            className="btn-primary text-sm py-3 px-6 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add a Product</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-[#E2E7E3] pb-1 overflow-x-auto">
          {[
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'paused', label: 'Paused' },
            { id: 'all', label: 'All Products' }
          ].map(tab => {
            const count = tab.id === 'all'
              ? products.length
              : products.filter(p => p.status === tab.id).length;
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
            Loading your products...
          </div>
        ) : filteredProducts.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white p-10 rounded-3xl border border-[#E2E7E3] text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 bg-[#E6ECE7] text-[#16382B] rounded-2xl flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                {activeTab === 'all' ? "You haven't added any products yet" : `No ${activeTab} products found`}
              </h3>
              <p className="text-slate-600 text-sm">
                Showcase something you make or prepare using your traditional skills.
              </p>
            </div>
            <button
              onClick={() => navigate('/provider/products/new')}
              className="btn-primary py-3 px-6 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          /* PRODUCTS LIST GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="card-editorial bg-white p-6 rounded-3xl border border-[#E2E7E3] space-y-4 flex flex-col justify-between shadow-xs">
                
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                      alt={product.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-[#E2E7E3] shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="badge-terracotta text-xs mb-1">{product.category}</span>
                          <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="font-editorial text-2xl font-bold text-[#16382B]">₹{product.price}</span>
                          <span className="text-xs text-slate-500 block">per {product.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm italic line-clamp-2">
                    "{product.description}"
                  </p>

                  {/* Stock Quantity Controls */}
                  <div className="flex items-center justify-between bg-[#FBF9F4] p-3 rounded-2xl border border-[#E2E7E3]">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#16382B]" />
                      <span className="text-xs font-semibold text-[#16382B]">Stock Quantity:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(product._id, product.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#D2DDD5] text-slate-700 font-bold hover:bg-[#E6ECE7] flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-[#16382B] min-w-[24px] text-center">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(product._id, product.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#D2DDD5] text-slate-700 font-bold hover:bg-[#E6ECE7] flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3] mt-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                    product.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : product.status === 'out_of_stock'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : product.status === 'paused'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(product._id, product.status)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-white"
                      title={product.status === 'published' ? 'Pause Product' : 'Resume Product'}
                    >
                      {product.status === 'published' ? (
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
                      onClick={() => navigate(`/provider/products/${product._id}/edit`)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-white"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="p-2 text-slate-400 hover:text-red-700 rounded-lg transition-colors"
                      title="Delete Product"
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
        title={deleteTarget?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
