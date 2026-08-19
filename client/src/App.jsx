import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
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
import ProviderLivelihoodDashboardPage from './pages/provider/ProviderLivelihoodDashboardPage';
import MessagesPage from './pages/MessagesPage';

// Phase 4 Public Discovery Pages
import ExplorePage from './pages/ExplorePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PublicProviderProfilePage from './pages/PublicProviderProfilePage';

// Opportunities + Customer Request Hub + Applications + Reviews
import OpportunitiesListPage from './pages/opportunities/OpportunitiesListPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';
import OpportunityCreatePage from './pages/opportunities/OpportunityCreatePage';
import MyOpportunitiesPage from './pages/opportunities/MyOpportunitiesPage';
import MyApplicationsPage from './pages/opportunities/MyApplicationsPage';
import MyAcceptedServicesPage from './pages/opportunities/MyAcceptedServicesPage';
import ReviewPage from './pages/opportunities/ReviewPage';

// Chatbot Assistant Widget
import Chatbot from './components/chatbot/Chatbot';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1F2421]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Discovery & Information Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/providers/:id" element={<PublicProviderProfilePage />} />
              <Route path="/opportunities" element={<OpportunitiesListPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

              {/* Auth Routes */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Dashboard Route (Shared / Role Switcher) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider ONLY Routes */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderLivelihoodDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ServicesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/new"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/services/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/products"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProductsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/products/new"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProductFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/products/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProductFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/my"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/accepted"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <MyAcceptedServicesPage />
                  </ProtectedRoute>
                }
              />

              {/* Customer ONLY Routes — Unified Request Hub */}
              <Route
                path="/requests"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyOpportunitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/create"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <OpportunityCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities/create"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <OpportunityCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities/my"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyOpportunitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/:applicationId/review"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <ReviewPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<ExplorePage />} />
            </Routes>
          </main>
          <Footer />

          {/* Global SilverHands Assistant / Copilot Floating Chatbot */}
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}
