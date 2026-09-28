import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CitizenPortal } from './pages/citizen/CitizenPortal';
import { OfficialDashboard } from './pages/official/OfficialDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export const App: React.FC = () => {
  const { checkAuth, switchDemoRole, user } = useAuthStore();

  useEffect(() => {
    // Attempt auto-login with default demo citizen if no session exists
    checkAuth().then(() => {
      if (!localStorage.getItem('setu_access_token')) {
        switchDemoRole('citizen');
      }
    });
  }, [checkAuth, switchDemoRole]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-civic-bg text-navy-950 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/citizen" element={<CitizenPortal />} />
              <Route path="/official" element={<OfficialDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
