import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage, SignupPage } from '@/pages/AuthPages';
import { EventDetailsPage } from '@/pages/EventDetailsPage';
import { HomePage } from '@/pages/HomePage';
import { CreateEventPage, OrganizerDashboardPage } from '@/pages/OrganizerPages';
import { MyTicketsPage, ResaleMarketPage } from '@/pages/TicketPages';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const NotFound = () => (
  <div className="py-20 text-center">
    <h2 className="mb-4 text-4xl font-bold">Page not found</h2>
    <Link to="/" className="text-purple-400 hover:text-purple-300">
      Back to events
    </Link>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="events/:id" element={<EventDetailsPage />} />
              <Route path="resale" element={<ResaleMarketPage />} />
              <Route element={<RequireAuth type="customer" />}>
                <Route path="tickets" element={<MyTicketsPage />} />
              </Route>
              <Route element={<RequireAuth type="organizer" />}>
                <Route path="dashboard" element={<OrganizerDashboardPage />} />
                <Route path="dashboard/new" element={<CreateEventPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
