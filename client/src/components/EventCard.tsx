import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Tag } from '@/components/ui';
import { EventVisual } from '@/fx/EventVisual';
import { useTilt } from '@/fx/interactions';
import { formatDate, formatPrice } from '@/lib/format';
import type { Event } from '@/lib/types';

export const passCode = (id: number) => `CG-${String(id).padStart(4, '0')}`;

/** Large tilt card used for featured events. */
export function FeaturedEventCard({ event, index }: { event: Event; index: number }) {
  const ref = useTilt<HTMLAnchorElement>(6);
  return (
    <Link ref={ref} to={`/events/${event.id}`} data-cursor="VIEW" className="cut group relative block border border-line bg-panel">
      <EventVisual seed={event.id} className="aspect-[16/9]" />
      <div className="glare" />
      <div className="absolute top-4 left-4 flex gap-2">
        <Tag hot>Featured</Tag>
        <Tag>{String(index + 1).padStart(2, '0')}</Tag>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-line p-6">
        <div>
          <p className="mb-2 text-[10px] tracking-[0.25em] text-acid uppercase">
            {formatDate(event.date, { weekday: 'short', day: '2-digit', month: 'short' })} · {event.time}
          </p>
          <h3 className="font-display text-2xl font-bold uppercase md:text-3xl">{event.name}</h3>
          <p className="mt-2 text-xs text-mute">{event.location}</p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center border border-line-hi transition-all duration-300 group-hover:rotate-45 group-hover:border-acid group-hover:bg-acid group-hover:text-void">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Departure-board style list of events. Hovering a row shows a floating
 * preview of the event's artwork that follows the pointer.
 */
export function EventBoard({ events }: { events: Event[] }) {
  const [hovered, setHovered] = useState<Event | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    if (preview.current) preview.current.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 90}px)`;
  };

  return (
    <div onPointerMove={move} onPointerLeave={() => setHovered(null)}>
      <div className="hidden grid-cols-[110px_70px_1fr_1fr_100px_40px] gap-4 border-b border-line px-4 pb-3 text-[10px] tracking-[0.25em] text-dim md:grid">
        <span>DATE</span>
        <span>TIME</span>
        <span>EVENT</span>
        <span>VENUE</span>
        <span className="text-right">FROM</span>
        <span />
      </div>
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Link
            to={`/events/${event.id}`}
            data-cursor="VIEW"
            onPointerEnter={() => setHovered(event)}
            className="group relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden border-b border-line px-4 py-5 md:grid-cols-[110px_70px_1fr_1fr_100px_40px]"
          >
            <span className="absolute inset-y-0 left-0 w-0 bg-acid transition-all duration-300 ease-out group-hover:w-full" />
            <span className="relative text-xs tracking-wider text-mute uppercase transition-colors group-hover:text-void">
              {formatDate(event.date, { day: '2-digit', month: 'short' })}
            </span>
            <span className="relative hidden text-xs text-mute tabular-nums transition-colors group-hover:text-void md:block">
              {event.time}
            </span>
            <span className="relative col-span-2 font-display text-lg font-bold uppercase transition-colors group-hover:text-void md:col-span-1">
              {event.name}
            </span>
            <span className="relative truncate text-xs text-mute transition-colors group-hover:text-void">{event.location}</span>
            <span className="relative text-right text-sm tabular-nums transition-colors group-hover:text-void">
              {formatPrice(event.price)}
            </span>
            <ArrowUpRight className="relative hidden size-5 justify-self-end text-dim transition-all group-hover:rotate-45 group-hover:text-void md:block" />
          </Link>
        </motion.div>
      ))}

      {createPortal(
        <div ref={preview} className="pointer-events-none fixed top-0 left-0 z-50 hidden [@media(pointer:fine)]:block">
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85, rotate: hovered ? -3 : 0 }}
            transition={{ duration: 0.25 }}
            className="cut w-64 border border-acid/60 bg-panel shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
          >
            {hovered && <EventVisual seed={hovered.id} label={passCode(hovered.id)} className="aspect-[4/3]" />}
          </motion.div>
        </div>,
        document.body,
      )}
    </div>
  );
}
