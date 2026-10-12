import { Repeat, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { TicketCard } from '@/components/TicketCard';
import { Button, EmptyState, ErrorState, PageTitle, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useBuyResale, useMyTickets, useResaleListings } from '@/hooks/queries';
import { formatPrice, parseDate } from '@/lib/format';

export function MyTicketsPage() {
  const { data: tickets = [], isPending, error } = useMyTickets();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <PageTitle>My Tickets</PageTitle>
      {tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Ticket} title="You don't have any tickets yet." hint="Go explore some events!" />
      )}
    </div>
  );
}

export function ResaleMarketPage() {
  const { data: listings = [], isPending, error } = useResaleListings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyResale = useBuyResale();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const buy = (ticketId: number, eventName: string) => {
    if (!user) return navigate('/login', { state: { from: '/resale' } });
    buyResale.mutate(ticketId, {
      onSuccess: () => {
        toast.success(`You bought a resale ticket for ${eventName}.`);
        navigate('/tickets');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <PageTitle subtitle="Securely buy tickets from other fans.">Resale Market</PageTitle>
      {listings.length > 0 ? (
        <div className="space-y-6">
          {listings.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800 p-6 md:flex-row"
            >
              <div>
                <h3 className="text-xl font-bold">{ticket.event.name}</h3>
                <p className="text-sm text-gray-400">{parseDate(ticket.event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-400">{ticket.event.location}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Resale Price</p>
                  <p className="text-2xl font-bold">{formatPrice(ticket.resalePrice ?? 0)}</p>
                </div>
                {user?.type !== 'organizer' && (
                  <Button
                    variant="success"
                    className="px-6"
                    loading={buyResale.isPending && buyResale.variables === ticket.id}
                    onClick={() => buy(ticket.id, ticket.event.name)}
                  >
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Repeat} title="No tickets are currently available for resale." hint="Check back later!" />
      )}
    </div>
  );
}
