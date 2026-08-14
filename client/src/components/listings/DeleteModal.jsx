import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, title, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl border border-[#E2E7E3] text-center">
        <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-editorial text-2xl font-bold text-[#16382B]">
            Delete Listing?
          </h3>
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete <span className="font-bold text-[#16382B]">"{title}"</span>? This listing will no longer be visible to customers.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary text-sm py-2.5 px-5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
