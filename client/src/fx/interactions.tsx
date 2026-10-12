import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { canUseFancyCursor } from './CursorFX';

/** 3D tilt toward the pointer, and publishes --gx/--gy for a `.glare` child. */
export function useTilt<T extends HTMLElement>(max = 8) {
  // Callback ref so the effect attaches even when the element mounts after the first render.
  const [el, ref] = useState<T | null>(null);

  useEffect(() => {
    if (!el || !canUseFancyCursor()) return;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg)`;
        el.style.setProperty('--gx', `${px * 100}%`);
        el.style.setProperty('--gy', `${py * 100}%`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
    el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [el, max]);

  return ref;
}

/** Wrapper whose content is pulled toward the pointer while it's nearby. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canUseFancyCursor()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => (el.style.transform = '');
    el.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Text that decodes from random glyphs into its real value on mount
 * and again whenever the pointer enters it.
 */
export function Scramble({ text, className, as: Tag = 'span', ...rest }: { text: string; as?: 'span' | 'h1' | 'h2' | 'h3' } & HTMLAttributes<HTMLElement>) {
  const [out, setOut] = useState(text);
  const timer = useRef<number | undefined>(undefined);

  // Time-based (not frame-based) so the text always resolves, even in a throttled background tab.
  const run = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setOut(text);
    clearInterval(timer.current);
    const start = performance.now();
    const duration = Math.min(700, 250 + text.length * 30);
    const tick = () => {
      const p = (performance.now() - start) / duration;
      if (p >= 1) {
        clearInterval(timer.current);
        return setOut(text);
      }
      const revealed = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < revealed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
    };
    tick();
    timer.current = window.setInterval(tick, 30);
  };

  useEffect(() => {
    run();
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag className={className} onPointerEnter={run} aria-label={text} {...rest}>
      <span aria-hidden>{out}</span>
    </Tag>
  );
}

/** A small live clock, for the terminal-style chrome. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
