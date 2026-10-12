import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { passCode } from '@/components/EventCard';
import { Button, ErrorState, Spinner, Tag } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { EventVisual } from '@/fx/EventVisual';
import { Magnetic, Scramble, useTilt } from '@/fx/interactions';
import { useBuyTicket, useEvent } from '@/hooks/queries';
import { formatDate, formatPrice } from '@/lib/format';

export function EventDetailsPage() {
  const id = Number(useParams().id);
  const { data: event, isPending, error } = useEvent(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyTicket = useBuyTicket();
  const tilt = useTilt<HTMLDivElement>(7);

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const buy = () =>
    buyTicket.mutate(event.id, {
      onSuccess: () => {
        toast.success(`Pass secured for ${event.name}.`);
        navigate('/tickets');
      },
      onError: (err) => toast.error(err.message),
    });

  const specs = [
    ['DATE', formatDate(event.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
    ['DOORS', event.time],
    ['VENUE', event.location],
    ['HOST', event.organizerName],
    ['REF', passCode(event.id)],
  ];

  return (
    <div>
      <Link
        to={user?.type === 'organizer' ? '/dashboard' : '/'}
        className="mb-10 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-acid"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div ref={tilt} className="group relative self-start">
          <EventVisual seed={event.id} className="cut aspect-[4/3] border border-line" />
          <div className="glare" />
          <span className="absolute -bottom-3 left-6 bg-acid px-2 py-1 text-[10px] font-bold tracking-[0.3em] text-void">
            {passCode(event.id)}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div className="mb-5 flex flex-wrap gap-2">
            {event.isFeatured && <Tag hot>Featured</Tag>}
            {event.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <Scramble as="h1" text={event.name} className="font-display text-4xl leading-none font-black uppercase md:text-6xl" />
          <p className="mt-6 text-sm leading-relaxed text-mute">{event.description}</p>

          <dl className="mt-8 border-t border-line">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[90px_1fr] border-b border-line py-3 text-sm">
                <dt className="text-[10px] tracking-[0.3em] text-dim">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {user?.type !== 'organizer' && (
            <div className="cut mt-10 flex flex-wrap items-center justify-between gap-6 border border-line-hi bg-panel p-6">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-dim">FACE VALUE</p>
                <p className="mt-1 font-display text-4xl font-bold">{formatPrice(event.price)}</p>
              </div>
              <Magnetic>
                {user ? (
                  <Button className="px-8 py-4" loading={buyTicket.isPending} onClick={buy} cursor="BUY">
                    Secure pass →
                  </Button>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: `/events/${event.id}` }}
                    data-cursor="ENTER"
                    className="cut-sm block bg-acid px-8 py-4 text-xs font-bold tracking-[0.2em] text-void uppercase"
                  >
                    Log in to buy →
                  </Link>
                )}
              </Magnetic>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
