import { motion } from 'motion/react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Scramble } from '@/fx/interactions';

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

const variants = {
  primary: 'bg-acid text-void hover:shadow-[0_0_32px_-4px_rgba(200,255,46,0.7)]',
  ghost: 'border border-line-hi text-ink hover:border-acid hover:text-acid',
  danger: 'bg-signal text-void hover:shadow-[0_0_32px_-4px_rgba(255,90,54,0.7)]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  loading?: boolean;
  /** Label shown next to the custom cursor while hovering. */
  cursor?: string;
}

export function Button({ variant = 'primary', loading, disabled, className, children, cursor, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      data-cursor={cursor}
      className={cx(
        'cut-sm group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {/* light sweep on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 opacity-0 transition-all duration-500 group-hover/btn:left-[120%] group-hover/btn:opacity-100" />
      {loading ? <Dots /> : children}
    </button>
  );
}

export const Dots = () => (
  <span className="inline-flex gap-1">
    {[0, 1, 2].map((i) => (
      <span key={i} className="size-1.5 animate-pulse bg-current" style={{ animationDelay: `${i * 150}ms` }} />
    ))}
  </span>
);

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] tracking-[0.25em] text-mute uppercase">
        <span className="text-acid">//</span> {label}
      </span>
      {children}
    </label>
  );
}

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cx('field', className)} {...props} />
);

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx('field appearance-none', className)} {...props} />
);

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cx('field resize-none', className)} {...props} />
);

export const Panel = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cx('cut border border-line bg-panel/80 backdrop-blur-md', className)}>{children}</div>
);

export const Tag = ({ children, hot }: { children: ReactNode; hot?: boolean }) => (
  <span
    className={cx(
      'border px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase',
      hot ? 'border-acid/60 text-acid' : 'border-line-hi text-mute',
    )}
  >
    {children}
  </span>
);

export function EmptyState({ code, title, hint }: { code: string; title: string; hint?: string }) {
  return (
    <div className="cut border border-dashed border-line-hi py-20 text-center">
      <p className="font-display text-5xl font-bold text-line-hi">{code}</p>
      <p className="mt-4 text-sm tracking-wider text-ink uppercase">{title}</p>
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-32 text-xs tracking-[0.3em] text-mute">
      <div className="flex h-8 items-end gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 bg-acid"
            animate={{ height: ['20%', '100%', '20%'] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
      LOADING
    </div>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <div className="cut mx-auto my-16 max-w-2xl border border-signal/50 bg-signal/5 p-10">
      <p className="text-[10px] tracking-[0.3em] text-signal">ERR // CONNECTION</p>
      <h2 className="mt-3 font-display text-3xl font-bold">Signal lost.</h2>
      <p className="mt-4 text-sm text-mute">{error.message}</p>
      <p className="mt-6 text-xs text-dim">Make sure the API server is running (`npm run dev` starts it).</p>
    </div>
  );
}

export function PageTitle({ index, children, subtitle, action }: { index: string; children: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
      <div>
        <p className="mb-3 text-[10px] tracking-[0.3em] text-acid">{index}</p>
        <Scramble as="h2" text={children} className="font-display text-4xl font-bold tracking-tight uppercase md:text-6xl" />
        {subtitle && <p className="mt-3 max-w-xl text-sm text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
