import { Loader2, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

const variants = {
  primary: 'bg-purple-600 hover:bg-purple-700',
  secondary: 'bg-gray-600 hover:bg-gray-500',
  success: 'bg-green-600 hover:bg-green-700',
  info: 'bg-blue-600 hover:bg-blue-700',
  danger: 'bg-red-600 hover:bg-red-700',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

const fieldClass =
  'w-full rounded-lg border border-gray-600 bg-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-300">{label}</span>
      {children}
    </label>
  );
}

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cx(fieldClass, className)} {...props} />
);

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx(fieldClass, className)} {...props} />
);

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cx(fieldClass, className)} {...props} />
);

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cx('rounded-2xl border border-gray-700 bg-gray-800 shadow-lg', className)}>{children}</div>
);

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 py-20 text-center">
      <Icon className="mx-auto size-12 text-gray-500" />
      <p className="mt-4 text-gray-400">{title}</p>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

export const Spinner = () => (
  <div className="flex justify-center p-20">
    <Loader2 className="size-8 animate-spin text-purple-400" />
  </div>
);

export function ErrorState({ error }: { error: Error }) {
  return (
    <div className="mx-auto my-10 max-w-2xl rounded-lg border border-red-500/50 bg-red-900/20 p-10 text-center">
      <h2 className="mb-4 text-3xl font-bold text-red-400">Something went wrong</h2>
      <p className="text-red-300">{error.message}</p>
      <p className="mt-4 text-sm text-gray-400">Make sure the API server is running (`npm run dev` starts it).</p>
    </div>
  );
}

export const PageTitle = ({ children, subtitle }: { children: ReactNode; subtitle?: string }) => (
  <div className="mb-8">
    <h2 className="text-4xl font-bold">{children}</h2>
    {subtitle && <p className="mt-2 text-gray-400">{subtitle}</p>}
  </div>
);
