import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, Compass } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-[#16382B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#16382B] font-semibold text-base">Loading SilverHands...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] bg-[#FBF9F4] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E7E3] shadow-md max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="badge-terracotta text-xs uppercase tracking-wider">Access Restricted</span>
            <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
              Access Denied
            </h2>
            <p className="text-slate-600 text-sm">
              Your account role (<span className="font-bold text-[#16382B] capitalize">{user.role}</span>) does not have permission to access this page.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to="/dashboard" className="btn-primary text-xs py-2.5 px-5">
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
            <Link to="/explore" className="btn-secondary text-xs py-2.5 px-5">
              <Compass className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
