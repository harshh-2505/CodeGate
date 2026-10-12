import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { passCode } from '@/components/EventCard';
import { Button, Field, Input } from '@/components/ui';
import { EventVisual } from '@/fx/EventVisual';
import { useNow, useTilt } from '@/fx/interactions';
import { useCancelResale, useListForResale } from '@/hooks/queries';
import { formatDate, formatPrice, parseDate } from '@/lib/format';
import type { Ticket } from '@/lib/types';

const HOUR = 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, '0');

/** The QR code stays encrypted (blurred) until one hour before the event starts. */
function useUnlock(date: string, time: string) {
  const now = useNow();
  const start = parseDate(date, time).getTime();
  const unlockAt = start - HOUR;
  if (now >= start) return { isUnlocked: true, status: 'EVENT LIVE', parts: null };
  if (now >= unlockAt) return { isUnlocked: true, status: 'ACCESS GRANTED', parts: null };

  const diff = unlockAt - now;
  return {
    isUnlocked: false,
    status: 'ENCRYPTED',
    parts: [
      ['D', Math.floor(diff / (24 * HOUR))],
      ['H', Math.floor((diff % (24 * HOUR)) / HOUR)],
      ['M', Math.floor((diff % HOUR) / 60000)],
      ['S', Math.floor((diff % 60000) / 1000)],
    ] as const,
  };
}

function ResellDialog({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [price, setPrice] = useState(String(ticket.event.price));
  const listForResale = useListForResale();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    listForResale.mutate(
      { ticketId: ticket.id, price: Number(price) },
      {
        onSuccess: () => {
          toast.success('Pass listed on the resale market.');
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-void/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.96 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="cut brackets w-full max-w-md border border-line-hi bg-panel p-8"
      >
        <p className="text-[10px] tracking-[0.3em] text-acid">RESALE // {passCode(ticket.id)}</p>
        <h3 className="mt-3 font-display text-2xl font-bold uppercase">Set your price</h3>
        <p className="mt-3 mb-6 text-xs text-mute">
          Face value {formatPrice(ticket.event.price)}. Your pass goes on the market until someone buys it or you pull it.
        </p>
        <Field label="Resale price (USD)">
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0.01" required autoFocus />
        </Field>
        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={listForResale.isPending} cursor="LIST">
            List pass
          </Button>
        </div>
      </motion.form>
    </motion.div>,
    document.body,
  );
}

/** A ticket rendered as a boarding pass: details stub, perforation, and the timed QR panel. */
export function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  const { event } = ticket;
  const { isUnlocked, status, parts } = useUnlock(event.date, event.time);
  const [isResellOpen, setIsResellOpen] = useState(false);
  const cancelResale = useCancelResale();
  const tilt = useTilt<HTMLDivElement>(3);

  const qrData = `Event Name: ${event.name}\nVenue: ${event.location}\nTiming: ${parseDate(event.date).toDateString()} at ${event.time}\nTicket ID: ${ticket.id}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
      >
        <div ref={tilt} className="group relative flex flex-col md:flex-row">
          {/* stub */}
          <div className="relative flex grow overflow-hidden border border-line bg-panel md:border-r-0">
            <EventVisual seed={event.id} className="hidden w-40 shrink-0 border-r border-line sm:block" />
            <div className="glare" />
            <div className="flex grow flex-col justify-between gap-6 p-6">
              <div>
                <div className="flex items-center justify-between text-[10px] tracking-[0.3em]">
                  <span className="text-acid">PASS {passCode(ticket.id)}</span>
                  <span className="text-dim">{event.organizerName.toUpperCase()}</span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold uppercase md:text-3xl">{event.name}</h3>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                {[
                  ['DATE', formatDate(event.date, { day: '2-digit', month: 'short', year: 'numeric' })],
                  ['DOORS', event.time],
                  ['VENUE', event.location],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] tracking-[0.25em] text-dim">{k}</dt>
                    <dd className="mt-1 text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {ticket.isForResale ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border border-acid/40 bg-acid/5 px-4 py-3 text-xs">
                  <span className="flex items-center gap-2 text-acid">
                    <span className="size-1.5 animate-pulse bg-acid" /> ON MARKET · {formatPrice(ticket.resalePrice ?? 0)}
                  </span>
                  <Button
                    variant="danger"
                    className="px-3 py-1.5"
                    cursor="PULL"
                    loading={cancelResale.isPending}
                    onClick={() =>
                      cancelResale.mutate(ticket.id, {
                        onSuccess: () => toast.success('Listing withdrawn.'),
                        onError: (err) => toast.error(err.message),
                      })
                    }
                  >
                    Withdraw
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="self-start" cursor="SELL" onClick={() => setIsResellOpen(true)}>
                  Resell pass
                </Button>
              )}
            </div>
          </div>

          {/* perforation */}
          <div className="perforation hidden w-4 border-y border-dashed border-line bg-panel md:block" />

          {/* QR panel */}
          <div className="relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden border border-line bg-raise p-6 md:w-72 md:border-l-0">
            <div className={`relative p-3 ${isUnlocked ? 'brackets bg-ink' : 'bg-ink/90'}`}>
              <div className={`transition-all duration-700 ${isUnlocked ? '' : 'blur-lg saturate-0 select-none'}`} aria-hidden={!isUnlocked}>
                <QRCodeSVG value={qrData} size={150} bgColor="#ece9e2" fgColor="#060708" />
              </div>
              {!isUnlocked && (
                <>
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="h-1/3 w-full animate-scan bg-gradient-to-b from-transparent via-acid/50 to-transparent" />
                  </div>
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="bg-void px-2 py-1 text-[10px] tracking-[0.3em] text-acid">LOCKED</span>
                  </div>
                </>
              )}
            </div>
            <p className={`text-[10px] tracking-[0.3em] ${isUnlocked ? 'text-acid' : 'text-mute'}`}>{status}</p>
            {parts ? (
              <div className="flex gap-1.5">
                {parts.map(([unit, value]) => (
                  <div key={unit} className="min-w-11 border border-line-hi bg-void px-1.5 py-1 text-center">
                    <div className="text-base font-bold tabular-nums">{pad(value)}</div>
                    <div className="text-[9px] tracking-widest text-dim">{unit}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[10px] text-mute">Present this code at the gate.</p>
            )}
            {!isUnlocked && <p className="text-center text-[10px] text-dim">Decrypts one hour before doors.</p>}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>{isResellOpen && <ResellDialog ticket={ticket} onClose={() => setIsResellOpen(false)} />}</AnimatePresence>
    </>
  );
}
