import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Route-level code splitting: isolate admin CMS, heavy public subpages, and editor bundles
const AdminApp = lazy(() => import('./admin/AdminApp').then(m => ({ default: m.AdminApp })));
const CareersPage = lazy(() => import('./components/CareersPage').then(m => ({ default: m.CareersPage })));
const CareerDetailPage = lazy(() => import('./components/CareerDetailPage').then(m => ({ default: m.CareerDetailPage })));
const EventDetailPage = lazy(() => import('./components/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-[#07111F] flex items-center justify-center p-4">
    <div className="w-8 h-8 rounded-full border-2 border-[#D7B65A]/20 border-t-[#D7B65A] animate-spin" />
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/careers/:slug" element={<CareerDetailPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/" element={<App />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

