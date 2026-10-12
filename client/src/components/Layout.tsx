import { motion } from 'motion/react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Backdrop, CursorFX } from '@/fx/CursorFX';
import { Magnetic, Scramble, useNow } from '@/fx/interactions';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative py-1 text-[11px] tracking-[0.25em] uppercase transition-colors hover:text-acid ${
          isActive ? 'text-acid after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-acid' : 'text-mute'
        }`
      }
    >
      <Scramble text={label} />
    </NavLink>
  );
}

function Clock() {
  const now = new Date(useNow());
  return (
    <span className="hidden tabular-nums text-dim lg:inline">
      {now.toLocaleTimeString('en-GB', { hour12: false })}
    </span>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/" data-cursor="HOME" className="group flex items-center gap-3">
          <span className="relative grid size-8 place-items-center border border-acid">
            <span className="h-4 w-px bg-acid transition-all duration-500 group-hover:h-6" />
            <span className="absolute h-px w-3 bg-acid transition-all duration-500 group-hover:w-6" />
          </span>
          <span className="font-display text-lg font-bold tracking-[0.15em]">CODEGATE</span>
        </Link>

        <div className="order-last flex w-full items-center gap-6 border-t border-line pt-3 md:order-none md:w-auto md:border-0 md:pt-0">
          <NavItem to="/" label="Events" />
          <NavItem to="/resale" label="Resale" />
          {user?.type === 'customer' && <NavItem to="/tickets" label="My Passes" />}
          {user?.type === 'organizer' && <NavItem to="/dashboard" label="Console" />}
        </div>

        <div className="flex items-center gap-5 text-[11px] tracking-[0.2em]">
          <Clock />
          {user ? (
            <>
              <span className="hidden items-center gap-2 text-mute md:flex">
                <span className="size-1.5 animate-pulse bg-acid" />
                {user.name.toUpperCase()}
                <span className="border border-line-hi px-1.5 text-[9px] text-dim">{user.type === 'organizer' ? 'ORG' : 'USR'}</span>
              </span>
              <button
                data-cursor="EXIT"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="border border-line-hi px-3 py-2 text-mute transition-colors hover:border-signal hover:text-signal"
              >
                LOG OUT
              </button>
            </>
          ) : (
            <Magnetic>
              <Link to="/login" data-cursor="ENTER" className="cut-sm block bg-acid px-4 py-2 font-bold text-void">
                LOG IN
              </Link>
            </Magnetic>
          )}
        </div>
      </nav>
    </header>
  );
}

function StatusBar() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 text-[10px] tracking-[0.25em] text-dim uppercase">
        <span className="flex items-center gap-2">
          <span className="size-1.5 bg-acid" /> All systems nominal
        </span>
        <span>Secure &amp; fair ticketing protocol</span>
        <span>&copy; {new Date().getFullYear()} CodeGate</span>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Backdrop />
      <CursorFX />
      <Header />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-12"
      >
        <Outlet />
      </motion.main>
      <StatusBar />
    </div>
  );
}
