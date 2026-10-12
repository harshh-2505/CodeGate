import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useDeferredValue, useMemo, useState } from 'react';
import { EventBoard, FeaturedEventCard } from '@/components/EventCard';
import { ErrorState, Spinner } from '@/components/ui';
import { Scramble, useNow } from '@/fx/interactions';
import { useEvents } from '@/hooks/queries';
import { parseDate } from '@/lib/format';
import type { Event } from '@/lib/types';

type SortKey = 'date' | 'price';

function NextEventCountdown({ events }: { events: Event[] }) {
  const now = useNow();
  const next = events
    .map((e) => ({ e, t: parseDate(e.date, e.time).getTime() }))
    .filter(({ t }) => t > now)
    .sort((a, b) => a.t - b.t)[0];
  if (!next) return null;
  const diff = next.t - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] text-dim">NEXT GATE OPENS</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums md:text-4xl">
        {pad(d)}:{pad(h)}:{pad(m)}:<span className="text-acid">{pad(s)}</span>
      </p>
      <p className="mt-1 truncate text-xs text-mute uppercase">{next.e.name}</p>
    </div>
  );
}

function Hero({ events }: { events: Event[] }) {
  const venues = new Set(events.map((e) => e.location.split(',')[0])).size;
  return (
    <section className="relative mb-20 pt-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center gap-3 text-[10px] tracking-[0.35em] text-acid"
      >
        <span className="size-1.5 animate-blink bg-acid" /> SECURE TICKETING PROTOCOL v2
      </motion.p>
      <h1 className="font-display text-[13vw] leading-[0.85] font-black tracking-tighter uppercase md:text-[8.5rem]">
        <Scramble text="Enter" className="block" />
        <span className="flex items-center gap-6">
          <Scramble text="the gate" className="block text-acid" />
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="hidden h-[0.12em] flex-1 origin-left bg-ink md:block"
          />
        </span>
      </h1>
      <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <p className="max-w-md text-sm leading-relaxed text-mute">
          Tickets that can't be screenshotted, scalped or faked. Your pass stays encrypted until an hour before doors, and
          resale happens in the open.
        </p>
        <div>
          <p className="text-[10px] tracking-[0.3em] text-dim">EVENTS LIVE</p>
          <p className="mt-2 font-display text-4xl font-bold">{String(events.length).padStart(2, '0')}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.3em] text-dim">CITIES</p>
          <p className="mt-2 font-display text-4xl font-bold">{String(venues).padStart(2, '0')}</p>
        </div>
        <NextEventCountdown events={events} />
      </div>
    </section>
  );
}

function Ticker({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  const items = [...events, ...events];
  return (
    <div className="relative -mx-5 mb-20 overflow-hidden border-y border-line bg-panel/60 py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((e, i) => (
          <span key={i} className="flex items-center gap-10 text-xs tracking-[0.25em] text-mute uppercase">
            {e.name}
            <span className="text-acid">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const { data: events = [], isPending, error } = useEvents();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const query = useDeferredValue(search.trim().toLowerCase());

  const filtered = useMemo(
    () =>
      events
        .filter(
          (e) =>
            e.name.toLowerCase().includes(query) ||
            e.location.toLowerCase().includes(query) ||
            e.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
        .sort((a, b) =>
          sort === 'price' ? a.price - b.price : parseDate(a.date, a.time).getTime() - parseDate(b.date, b.time).getTime(),
        ),
    [events, query, sort],
  );

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const featured = events.filter((e) => e.isFeatured);

  return (
    <div>
      <Hero events={events} />
      <Ticker events={events} />

      {featured.length > 0 && (
        <section className="mb-24">
          <p className="mb-6 text-[10px] tracking-[0.3em] text-acid">01 / FEATURED</p>
          <div className="grid gap-8 md:grid-cols-2">
            {featured.map((event, i) => (
              <FeaturedEventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] tracking-[0.3em] text-acid">02 / DEPARTURES</p>
            <Scramble as="h2" text="All events" className="font-display text-4xl font-bold uppercase md:text-5xl" />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dim" />
              <input
                type="search"
                placeholder="search name, city, tag"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field w-64 py-2.5 pl-9 text-xs"
              />
            </label>
            <div className="flex border border-line">
              {(['date', 'price'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  data-cursor="SORT"
                  className={`px-4 text-[10px] tracking-[0.25em] uppercase transition-colors ${
                    sort === key ? 'bg-acid text-void' : 'text-mute hover:text-ink'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
        {filtered.length > 0 ? (
          <EventBoard events={filtered} />
        ) : (
          <p className="border-b border-line px-4 py-16 text-center text-xs tracking-[0.2em] text-mute uppercase">
            {query ? `No signal for "${search}"` : 'No events scheduled'}
          </p>
        )}
      </section>
    </div>
  );
}
