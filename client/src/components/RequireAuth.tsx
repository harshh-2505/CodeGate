import { Navigate, Outlet, useLocation } from 'react-router';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/lib/types';

/** Route guard: sends anonymous visitors to /login and the wrong account type home. */
export function RequireAuth({ type }: { type?: UserType }) {
  const { user, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (type && user.type !== type) return <Navigate to="/" replace />;
  return <Outlet />;
}
