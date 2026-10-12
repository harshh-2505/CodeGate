import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Button, ErrorState, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useBuyTicket, useEvent } from '@/hooks/queries';
import { formatDate, formatPrice } from '@/lib/format';

export function EventDetailsPage() {
  const id = Number(useParams().id);
  const { data: event, isPending, error } = useEvent(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyTicket = useBuyTicket();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const buy = () =>
    buyTicket.mutate(event.id, {
      onSuccess: () => {
        toast.success(`Ticket purchased for ${event.name}!`);
        navigate('/tickets');
      },
      onError: (err) => toast.error(err.message),
    });

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={user?.type === 'organizer' ? '/dashboard' : '/'} className="mb-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
        <ArrowLeft className="size-5" /> Back to Events
      </Link>
      <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg">
        <img src={event.image} alt={event.name} className="h-64 w-full object-cover" />
        <div className="p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-purple-900/50 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mb-4 text-4xl font-bold">{event.name}</h2>
          <div className="mb-6 grid grid-cols-1 gap-6 text-gray-300 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-purple-400" />
              {formatDate(event.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-purple-400" /> {event.time}
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-purple-400" /> {event.location}
            </div>
          </div>
          <p className="mb-6 leading-relaxed text-gray-400">{event.description}</p>
          <div className="mb-8 text-sm text-gray-500">Organized by: {event.organizerName}</div>

          {user?.type !== 'organizer' && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-700/50 p-6">
              <div>
                <p className="text-gray-400">Ticket Price</p>
                <p className="text-3xl font-bold">{formatPrice(event.price)}</p>
              </div>
              {user ? (
                <Button className="px-8 py-3 text-lg" loading={buyTicket.isPending} onClick={buy}>
                  Buy Ticket
                </Button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `/events/${event.id}` }}
                  className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-bold transition-colors hover:bg-purple-700"
                >
                  Log in to buy
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
