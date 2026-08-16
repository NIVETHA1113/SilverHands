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

// Phase 4 Public Discovery Pages
import ExplorePage from './pages/ExplorePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PublicProviderProfilePage from './pages/PublicProviderProfilePage';

// Task 3 — Opportunities + Applications + Trust
import OpportunitiesListPage from './pages/opportunities/OpportunitiesListPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';
import OpportunityCreatePage from './pages/opportunities/OpportunityCreatePage';
import MyOpportunitiesPage from './pages/opportunities/MyOpportunitiesPage';
import MyApplicationsPage from './pages/opportunities/MyApplicationsPage';
import MyAcceptedServicesPage from './pages/opportunities/MyAcceptedServicesPage';
import ReviewPage from './pages/opportunities/ReviewPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1F2421]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/providers/:id" element={<PublicProviderProfilePage />} />

              {/* Auth Routes */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected User & Provider Routes */}
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

              {/* ── Task 3: Opportunities + Applications + Trust ── */}
              {/* Public opportunity browsing */}
              <Route path="/opportunities" element={<OpportunitiesListPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

              {/* Protected: customer creates & manages */}
              <Route
                path="/opportunities/create"
                element={
                  <ProtectedRoute>
                    <OpportunityCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities/my"
                element={
                  <ProtectedRoute>
                    <MyOpportunitiesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: provider tracks own applications */}
              <Route
                path="/applications/my"
                element={
                  <ProtectedRoute>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/accepted"
                element={
                  <ProtectedRoute>
                    <MyAcceptedServicesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: customer leaves review after completion */}
              <Route
                path="/applications/:applicationId/review"
                element={
                  <ProtectedRoute>
                    <ReviewPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<ExplorePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
