import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button, Field, Input, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Session, User, UserType } from '@/lib/types';

const homeFor = (user: User) => (user.type === 'organizer' ? '/dashboard' : '/');

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-2 text-center text-4xl font-bold text-purple-400">{title}</h2>
        <p className="mb-8 text-center text-gray-400">{subtitle}</p>
        {children}
      </div>
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
    <AuthShell title="Welcome Back" subtitle="Sign in to your CODEGATE account">
      <form onSubmit={submit} className="space-y-6">
        <Field label="Email Address">
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {login.error && <p className="text-center text-sm text-red-400">{login.error.message}</p>}
        <Button type="submit" className="w-full py-3" loading={login.isPending}>
          Login
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300">
          Sign Up
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-gray-500">
        Demo accounts: organizer@codegate.com or customer@codegate.com, password password123.
      </p>
    </AuthShell>
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
    <AuthShell title="Create Account" subtitle="Join CODEGATE and start your next adventure.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name">
          <Input placeholder="Alex Doe" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email Address">
          <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} required />
        </Field>
        <Field label="Confirm Password">
          <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
        </Field>
        <Field label="Account Type">
          <Select value={form.type} onChange={set('type')}>
            <option value="customer">Customer</option>
            <option value="organizer">Event Organizer</option>
          </Select>
        </Field>
        {error && <p className="pt-2 text-center text-sm text-red-400">{error}</p>}
        <Button type="submit" className="mt-6 w-full py-3" loading={signup.isPending}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
