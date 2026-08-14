import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ServicesListPage from './pages/provider/ServicesListPage';
import ServiceFormPage from './pages/provider/ServiceFormPage';
import ProductsListPage from './pages/provider/ProductsListPage';
import ProductFormPage from './pages/provider/ProductFormPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1F2421]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Provider Services Management Routes */}
              <Route
                path="/provider/services"
                element={
                  <ProtectedRoute>
                    <ServicesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/new"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/:id/edit"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Products Management Routes */}
              <Route
                path="/provider/products"
                element={
                  <ProtectedRoute>
                    <ProductsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/products/new"
                element={
                  <ProtectedRoute>
                    <ProductFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProductFormPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
