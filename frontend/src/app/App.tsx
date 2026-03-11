import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/features/auth/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import PageTransition from '@/shared/components/PageTransition';

// Lazy load feature pages for route-level code splitting
const DummyDashboard = React.lazy(() => import('@/features/dashboard/pages/Dashboard'));
const AccountsPage = React.lazy(() => import('@/features/accounts/pages/AccountsPage'));
const JournalsPage = React.lazy(() => import('@/features/journals/pages/JournalsPage').then(module => ({ default: module.JournalsPage })));

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-orionBlue border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <div className="animate-spin w-8 h-8 border-4 border-orionBlue border-t-transparent rounded-full" />
                </div>
            }>
                <Routes location={location} key={location.pathname}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PageTransition><DummyDashboard /></PageTransition>} />
                        <Route path="/accounts" element={<PageTransition><AccountsPage /></PageTransition>} />
                        <Route path="/journals" element={<PageTransition><JournalsPage /></PageTransition>} />
                        <Route path="*" element={<PageTransition><DummyDashboard /></PageTransition>} />
                    </Route>
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
