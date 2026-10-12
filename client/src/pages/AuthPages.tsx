import { useMutation } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button, Field, Input, cx } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Scramble } from '@/fx/interactions';
import { api } from '@/lib/api';
import type { Session, User, UserType } from '@/lib/types';

const homeFor = (user: User) => (user.type === 'organizer' ? '/dashboard' : '/');

function Terminal({ file, title, subtitle, children }: { file: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cut brackets w-full max-w-md border border-line-hi bg-panel/90 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[10px] tracking-[0.25em] text-dim">
          <span className="flex gap-1.5">
            <span className="size-2 bg-signal" />
            <span className="size-2 bg-line-hi" />
            <span className="size-2 bg-acid" />
          </span>
          {file}
        </div>
        <div className="p-8">
          <Scramble as="h2" text={title} className="font-display text-3xl font-black uppercase" />
          <p className="mt-2 mb-8 text-xs text-mute">
            {subtitle}
            <span className="ml-1 inline-block h-3 w-1.5 animate-blink bg-acid align-middle" />
          </p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Shared login/signup submit: start the session, then go where the user was headed. */
function useSessionMutation<TArgs>(fn: (args: TArgs) => Promise<Session>) {
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  return useMutation({
    mutationFn: fn,
    onSuccess: (session) => {
      startSession(session);
      navigate(from ?? homeFor(session.user), { replace: true });
    },
  });
}

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@codegate.com' },
  { label: 'Organizer', email: 'organizer@codegate.com' },
];

export function LoginPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useSessionMutation(() => api.login(email, password));

  if (user) return <Navigate to={homeFor(user)} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(undefined);
  };

  return (
    <Terminal file="auth/login.sh" title="Authenticate" subtitle="Identify yourself to pass the gate">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {login.error && <p className="border-l-2 border-signal pl-3 text-xs text-signal">{login.error.message}</p>}
        <Button type="submit" className="w-full py-4" loading={login.isPending} cursor="ENTER">
          Log in →
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
        <p className="mb-3 text-[10px] tracking-[0.25em] text-dim">DEMO ACCESS · PASSWORD123</p>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_ACCOUNTS.map((acct) => (
            <button
              key={acct.email}
              type="button"
              data-cursor="FILL"
              onClick={() => {
                setEmail(acct.email);
                setPassword('password123');
              }}
              className="border border-line px-3 py-2 text-left text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:border-acid hover:text-acid"
            >
              {acct.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-mute">
        No account?{' '}
        <Link to="/signup" className="text-acid hover:underline">
          Create one
        </Link>
      </p>
    </Terminal>
  );
}

export function SignupPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', type: 'customer' as UserType });
  const [localError, setLocalError] = useState('');
  const signup = useSessionMutation(() =>
    api.signup({ name: form.name, email: form.email, password: form.password, type: form.type }),
  );

  if (user) return <Navigate to={homeFor(user)} replace />;

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');
    if (form.password.length < 8) return setLocalError('Password must be at least 8 characters long.');
    setLocalError('');
    signup.mutate(undefined);
  };

  const error = localError || signup.error?.message;

  return (
    <Terminal file="auth/register.sh" title="New identity" subtitle="Create your CodeGate account">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-px border border-line bg-line">
          {(['customer', 'organizer'] as const).map((type) => (
            <button
              key={type}
              type="button"
              data-cursor="PICK"
              onClick={() => setForm((f) => ({ ...f, type }))}
              className={cx(
                'px-3 py-3 text-[10px] tracking-[0.25em] uppercase transition-colors',
                form.type === type ? 'bg-acid font-bold text-void' : 'bg-panel text-mute hover:text-ink',
              )}
            >
              {type === 'customer' ? 'I attend' : 'I organize'}
            </button>
          ))}
        </div>
        <Field label="Full name">
          <Input placeholder="Alex Doe" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Password">
            <Input type="password" placeholder="8+ chars" value={form.password} onChange={set('password')} required />
          </Field>
          <Field label="Confirm">
            <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
          </Field>
        </div>
        {error && <p className="border-l-2 border-signal pl-3 text-xs text-signal">{error}</p>}
        <Button type="submit" className="w-full py-4" loading={signup.isPending} cursor="JOIN">
          Create account →
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-mute">
        Already registered?{' '}
        <Link to="/login" className="text-acid hover:underline">
          Log in
        </Link>
      </p>
    </Terminal>
  );
}
