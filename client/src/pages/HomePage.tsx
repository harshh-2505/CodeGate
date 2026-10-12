import { Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { EventCard, FeaturedEventCard } from '@/components/EventCard';
import { ErrorState, Spinner } from '@/components/ui';
import { useEvents } from '@/hooks/queries';
import { parseDate } from '@/lib/format';

type SortKey = 'date' | 'price';

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

  const featured = filtered.filter((e) => e.isFeatured);
  const regular = filtered.filter((e) => !e.isFeatured);

  return (
    <div>
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-4xl font-bold">Featured Events</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {featured.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-4xl font-bold">All Events</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {regular.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 py-20 text-center text-gray-400">
          {query ? `No events found for "${search}".` : 'No events yet.'}
        </div>
      )}
    </div>
  );
}
