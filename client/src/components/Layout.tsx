import { LayoutDashboard, LogIn, LogOut, Repeat, Ticket } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 transition-colors hover:text-purple-300 ${isActive ? 'text-purple-300' : ''}`;

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-sm">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-3xl font-bold tracking-wider text-purple-400">
          CODEGATE
        </Link>
        <div className="flex flex-wrap items-center gap-6">
          {user ? (
            <>
              <span className="hidden text-gray-300 sm:inline">Welcome, {user.name}</span>
              {user.type === 'customer' ? (
                <>
                  <NavLink to="/tickets" className={navClass}>
                    <Ticket className="size-5" /> My Tickets
                  </NavLink>
                  <NavLink to="/resale" className={navClass}>
                    <Repeat className="size-5" /> Resale Market
                  </NavLink>
                </>
              ) : (
                <NavLink to="/dashboard" className={navClass}>
                  <LayoutDashboard className="size-5" /> Dashboard
                </NavLink>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 transition-colors hover:bg-purple-700"
              >
                <LogOut className="size-5" /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/resale" className={navClass}>
                <Repeat className="size-5" /> Resale Market
              </NavLink>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 transition-colors hover:bg-purple-700"
              >
                <LogIn className="size-5" /> Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-12 border-t border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CODEGATE. All rights reserved.</p>
          <p className="mt-1 text-sm">Secure & Fair Ticketing Platform.</p>
        </div>
      </footer>
    </div>
  );
}
