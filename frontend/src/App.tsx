import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

import { ProductView } from './pages/ProductView';
import { LoginView } from './pages/LoginView';
import { SignupView } from './pages/SignupView';
import { OnboardingView } from './pages/OnboardingView';
import { TodayView } from './pages/TodayView';
import { RadarView } from './pages/RadarView';
import { WorkListView } from './pages/WorkListView';
import { WorkDetailView } from './pages/WorkDetailView';
import { AddWorkView } from './pages/AddWorkView';
import { PlanningView } from './pages/PlanningView';
import { TimelineView } from './pages/TimelineView';
import { CalendarView } from './pages/CalendarView';
import { WorkloadView } from './pages/WorkloadView';
import { PrioritiesView } from './pages/PrioritiesView';
import { InsightsView } from './pages/InsightsView';
import { SettingsView } from './pages/SettingsView';
import { NotFoundView } from './pages/NotFoundView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public / Landing */}
          <Route path="/" element={<ProductView />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginView />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupView />
              </PublicOnlyRoute>
            }
          />
          <Route path="/onboarding" element={<OnboardingView />} />

          {/* Authenticated / App Shell Workspace */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/today" element={<TodayView />} />
              <Route path="/radar" element={<RadarView />} />
              <Route path="/dashboard" element={<Navigate to="/radar" replace />} />
              <Route path="/work" element={<WorkListView />} />
              <Route path="/work/:id" element={<WorkDetailView />} />
              <Route path="/work/new" element={<AddWorkView />} />
              <Route path="/planning" element={<PlanningView />} />
              <Route path="/timeline" element={<TimelineView />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/workload" element={<WorkloadView />} />
              <Route path="/priorities" element={<PrioritiesView />} />
              <Route path="/insights" element={<InsightsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<NotFoundView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
