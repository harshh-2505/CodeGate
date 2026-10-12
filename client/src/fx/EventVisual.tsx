import { useMemo, type ReactElement } from 'react';

// Small deterministic PRNG so every event always gets the same artwork.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ['#c8ff2e', '#ece9e2'],
  ['#7fe7ff', '#c8ff2e'],
  ['#ff5a36', '#ece9e2'],
  ['#c8ff2e', '#ff5a36'],
];

/**
 * Generative cover art for an event: one of a few procedural compositions
 * (contour rings, signal bars, orbit field) seeded by the event id.
 */
export function EventVisual({ seed, label, className = '' }: { seed: number; label?: string; className?: string }) {
  const art = useMemo(() => {
    const rand = mulberry32(seed * 9973);
    const [a, b] = PALETTES[Math.floor(rand() * PALETTES.length)];
    const kind = Math.floor(rand() * 3);
    const cx = 120 + rand() * 360;
    const cy = 80 + rand() * 240;
    const shapes: ReactElement[] = [];

    if (kind === 0) {
      for (let i = 0; i < 18; i++) {
        const r = 14 + i * 22 + rand() * 6;
        shapes.push(
          <ellipse key={i} cx={cx} cy={cy} rx={r * 1.25} ry={r} fill="none" stroke={i % 5 === 0 ? a : b} strokeOpacity={i % 5 === 0 ? 0.9 : 0.18} strokeWidth={i % 5 === 0 ? 1.6 : 1} transform={`rotate(${rand() * 20 - 10} ${cx} ${cy})`} />,
        );
      }
    } else if (kind === 1) {
      const bars = 42;
      for (let i = 0; i < bars; i++) {
        const h = 20 + Math.pow(rand(), 1.6) * 260;
        const hot = rand() > 0.86;
        shapes.push(<rect key={i} x={20 + i * 13.5} y={380 - h} width={6} height={h} fill={hot ? a : b} fillOpacity={hot ? 0.95 : 0.16} />);
      }
    } else {
      for (let i = 0; i < 70; i++) {
        const ang = rand() * Math.PI * 2;
        const dist = 30 + rand() * 260;
        const x = cx + Math.cos(ang) * dist * 1.3;
        const y = cy + Math.sin(ang) * dist * 0.7;
        const hot = rand() > 0.9;
        shapes.push(<circle key={`p${i}`} cx={x} cy={y} r={hot ? 4 : 1.6} fill={hot ? a : b} fillOpacity={hot ? 1 : 0.4} />);
        if (hot) shapes.push(<line key={`l${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={a} strokeOpacity={0.35} />);
      }
      for (let i = 1; i <= 4; i++) {
        shapes.push(<ellipse key={`o${i}`} cx={cx} cy={cy} rx={i * 75 * 1.3} ry={i * 75 * 0.7} fill="none" stroke={b} strokeOpacity={0.12} strokeDasharray="2 6" />);
      }
    }
    return { a, shapes };
  }, [seed]);

  return (
    <div className={`relative overflow-hidden bg-panel ${className}`}>
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`g${seed}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#fff" strokeOpacity="0.04" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill={`url(#g${seed})`} />
        {art.shapes}
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 bg-void/80 px-2 py-1 text-[10px] tracking-[0.25em] text-mute">
          {label}
        </span>
      )}
    </div>
  );
}
