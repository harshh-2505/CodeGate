import { useEffect, useRef } from 'react';

const ACID = '200, 255, 46';
const INTERACTIVE = 'a, button, select, label, [data-cursor]';
const TRAIL_LENGTH = 22;

interface Burst {
  x: number;
  y: number;
  age: number;
}

export const canUseFancyCursor = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Site-wide pointer effects:
 * - publishes the pointer position as --mx/--my on <html> (drives the grid spotlight)
 * - draws a fading comet trail and click shockwaves on a canvas
 * - replaces the cursor with a dot + lagging reticle that locks onto interactive elements
 *   and shows their `data-cursor` label (e.g. "VIEW", "BUY")
 */
export function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const fancy = canUseFancyCursor();

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    let raf = 0;
    let lastPublish = { x: -1, y: -1 };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!fancy) publish();
    };
    const publish = () => {
      if (lastPublish.x === target.x && lastPublish.y === target.y) return;
      lastPublish = { ...target };
      root.style.setProperty('--mx', `${target.x}px`);
      root.style.setProperty('--my', `${target.y}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    if (!fancy) {
      return () => window.removeEventListener('pointermove', onMove);
    }

    root.classList.add('fx-cursor');
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const trail = Array.from({ length: TRAIL_LENGTH }, () => ({ ...target }));
    const ringPos = { ...target };
    const ringSize = { w: 36, h: 36 };
    const bursts: Burst[] = [];
    let hovered: Element | null = null;
    let visible = true;
    let pressed = false;

    const onOver = (e: PointerEvent) => {
      hovered = (e.target as Element).closest?.(INTERACTIVE) ?? null;
      const text = hovered?.getAttribute('data-cursor') ?? '';
      label.textContent = text;
      label.style.opacity = text ? '1' : '0';
    };
    const onDown = (e: PointerEvent) => {
      pressed = true;
      bursts.push({ x: e.clientX, y: e.clientY, age: 0 });
    };
    const onUp = () => (pressed = false);
    const onLeave = () => (visible = false);
    const onEnter = () => (visible = true);
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const frame = () => {
      publish();

      // Trail: each point eases toward the one ahead of it.
      trail[0].x = target.x;
      trail[0].y = target.y;
      for (let i = 1; i < trail.length; i++) {
        trail[i].x = lerp(trail[i].x, trail[i - 1].x, 0.42);
        trail[i].y = lerp(trail[i].y, trail[i - 1].y, 0.42);
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (visible) {
        ctx.lineCap = 'round';
        for (let i = 1; i < trail.length; i++) {
          const t = 1 - i / trail.length;
          ctx.strokeStyle = `rgba(${ACID}, ${t * 0.55})`;
          ctx.lineWidth = t * 3;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
      }

      // Click shockwaves: an expanding square reticle plus a ring.
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.age += 1;
        const p = b.age / 36;
        if (p >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const r = 8 + p * 70;
        ctx.strokeStyle = `rgba(${ACID}, ${(1 - p) * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(p * Math.PI * 0.5);
        ctx.strokeRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
        ctx.restore();
      }

      // Reticle: snaps around the hovered element, otherwise trails the pointer.
      let goal = { x: target.x, y: target.y, w: 36, h: 36 };
      if (hovered && hovered.isConnected) {
        const r = hovered.getBoundingClientRect();
        if (r.width < 420 && r.height < 160) {
          goal = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width + 14, h: r.height + 14 };
        } else {
          goal = { ...goal, w: 64, h: 64 };
        }
      }
      if (pressed) {
        goal.w *= 0.85;
        goal.h *= 0.85;
      }
      ringPos.x = lerp(ringPos.x, goal.x, 0.2);
      ringPos.y = lerp(ringPos.y, goal.y, 0.2);
      ringSize.w = lerp(ringSize.w, goal.w, 0.2);
      ringSize.h = lerp(ringSize.h, goal.h, 0.2);

      ring.style.transform = `translate(${ringPos.x - ringSize.w / 2}px, ${ringPos.y - ringSize.h / 2}px)`;
      ring.style.width = `${ringSize.w}px`;
      ring.style.height = `${ringSize.h}px`;
      ring.style.opacity = visible ? '1' : '0';
      dot.style.transform = `translate(${target.x - 3}px, ${target.y - 3}px)`;
      dot.style.opacity = visible ? '1' : '0';
      label.style.transform = `translate(${target.x + 18}px, ${target.y + 14}px)`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('fx-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div ref={ringRef} className="absolute top-0 left-0">
        <span className="absolute top-0 left-0 size-2.5 border-t border-l border-acid" />
        <span className="absolute top-0 right-0 size-2.5 border-t border-r border-acid" />
        <span className="absolute bottom-0 left-0 size-2.5 border-b border-l border-acid" />
        <span className="absolute right-0 bottom-0 size-2.5 border-r border-b border-acid" />
      </div>
      <div ref={dotRef} className="absolute top-0 left-0 size-1.5 bg-acid shadow-[0_0_12px_2px_rgba(200,255,46,0.8)]" />
      <span
        ref={labelRef}
        className="absolute top-0 left-0 bg-acid px-1.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-void opacity-0 transition-opacity"
      />
    </div>
  );
}

/** Static background layers: grid, pointer spotlight, glow and film grain. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="fx-grid" />
      <div className="fx-grid-hot" />
      <div className="fx-glow" />
      <div className="fx-grain" />
    </div>
  );
}
