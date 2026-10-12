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
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/unbounded';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const NotFound = () => (
  <div className="py-24 text-center">
    <p className="font-display text-[9rem] leading-none font-black text-line-hi">404</p>
    <p className="mt-4 text-xs tracking-[0.3em] text-mute">NO GATE AT THIS ADDRESS</p>
    <Link to="/" className="mt-8 inline-block border border-line-hi px-5 py-3 text-xs tracking-[0.2em] text-ink hover:border-acid hover:text-acid">
      RETURN TO EVENTS
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
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'cut-sm flex w-[340px] items-center gap-3 border border-line-hi bg-panel px-4 py-3 font-mono text-xs text-ink shadow-2xl',
              success: 'border-l-4 border-l-acid',
              error: 'border-l-4 border-l-signal',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
