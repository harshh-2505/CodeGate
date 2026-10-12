import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { passCode } from '@/components/EventCard';
import { TicketCard } from '@/components/TicketCard';
import { Button, EmptyState, ErrorState, PageTitle, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { EventVisual } from '@/fx/EventVisual';
import { useBuyResale, useMyTickets, useResaleListings } from '@/hooks/queries';
import { formatDate, formatPrice } from '@/lib/format';

export function MyTicketsPage() {
  const { data: tickets = [], isPending, error } = useMyTickets();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <PageTitle index={`WALLET / ${String(tickets.length).padStart(2, '0')} PASSES`} subtitle="Codes decrypt one hour before doors open.">
        My passes
      </PageTitle>
      {tickets.length > 0 ? (
        <div className="space-y-8">
          {tickets.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState code="0x00" title="Your wallet is empty" hint="Pick an event and secure your first pass." />
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
        toast.success(`Pass for ${eventName} transferred to you.`);
        navigate('/tickets');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <PageTitle index="EXCHANGE / OPEN MARKET" subtitle="Passes from other fans, transferred to you the moment you buy.">
        Resale
      </PageTitle>
      {listings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {listings.map((ticket, i) => {
            const delta = (ticket.resalePrice ?? 0) - ticket.event.price;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="cut group flex border border-line bg-panel transition-colors hover:border-acid/60"
              >
                <EventVisual seed={ticket.event.id} className="w-28 shrink-0 border-r border-line" />
                <div className="flex grow flex-col justify-between gap-4 p-5">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-dim">
                      {passCode(ticket.id)} · {formatDate(ticket.event.date, { day: '2-digit', month: 'short' })}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold uppercase">{ticket.event.name}</h3>
                    <p className="mt-1 text-xs text-mute">{ticket.event.location}</p>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl font-bold">{formatPrice(ticket.resalePrice ?? 0)}</p>
                      <p className={`text-[10px] tracking-[0.2em] ${delta > 0 ? 'text-signal' : 'text-acid'}`}>
                        {delta === 0 ? 'AT FACE VALUE' : `${delta > 0 ? '+' : '−'}${formatPrice(Math.abs(delta))} VS FACE`}
                      </p>
                    </div>
                    {user?.type !== 'organizer' && (
                      <Button
                        cursor="BUY"
                        loading={buyResale.isPending && buyResale.variables === ticket.id}
                        onClick={() => buy(ticket.id, ticket.event.name)}
                      >
                        Buy
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState code="0x00" title="The market is quiet" hint="No passes listed right now. Check back soon." />
      )}
    </div>
  );
}
