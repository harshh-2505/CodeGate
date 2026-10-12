import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '@/lib/format';
import type { Event } from '@/lib/types';

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-500"
    >
      <div className="relative">
        <img src={event.image} alt={event.name} loading="lazy" className="h-48 w-full object-cover" />
        <div className="absolute top-3 right-3 rounded-full bg-gray-900/70 px-3 py-1 text-sm font-bold">
          {formatDate(event.date, { month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-2 truncate text-xl font-bold transition-colors group-hover:text-purple-400">{event.name}</h3>
        <p className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="size-4" /> {event.location}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedEventCard({ event }: { event: Event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg transition-all duration-300 hover:border-purple-500 md:flex-row"
    >
      <img src={event.image} alt={event.name} className="h-48 w-full object-cover md:h-auto md:w-1/3" />
      <div className="flex flex-col justify-between p-6">
        <div>
          <h3 className="mb-2 text-2xl font-bold transition-colors group-hover:text-purple-400">{event.name}</h3>
          <p className="mb-1 text-sm text-gray-400">
            {formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="size-4" /> {event.location}
          </p>
          <p className="hidden line-clamp-3 text-sm leading-relaxed text-gray-400 md:block">{event.description}</p>
        </div>
        <div className="mt-4 font-semibold text-purple-400">View Details &rarr;</div>
      </div>
    </Link>
  );
}
