import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ErrorFallback } from '@/components/ui/ErrorFallback';

// Performance-optimized lazy-loaded route imports
const HomePage = lazy(() => import('./pages/HomePage'));
const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage')); // 👈 FIXED: Included lazy registration asset bundle
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancelPage'));

const PageSkeleton = () => (
  <div className="min-h-screen bg-chalk flex items-center justify-center">
    <div className="font-mono text-slate animate-pulse">Loading market...</div>
  </div>
);

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.replace('/')}>
      <AuthProvider>
        <div className="min-h-screen bg-chalk text-ink font-body flex flex-col">
          
          {/* Main Top Global Header */}
          <Navbar />
          
          <main className="flex-grow flex flex-col">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public Access Hub Feeds */}
                <Route path="/" element={<HomePage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/listings/:slug" element={<ListingDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> {/* 👈 FIXED: Active mapping layout route link */}
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

                {/* Secure / Protected Session Workspaces */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/sell" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;