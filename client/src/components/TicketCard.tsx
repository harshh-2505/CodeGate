import { Calendar, DollarSign, MapPin, Repeat } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useCancelResale, useListForResale } from '@/hooks/queries';
import { formatPrice, parseDate } from '@/lib/format';
import type { Ticket } from '@/lib/types';

const HOUR = 60 * 60 * 1000;

/** The QR code stays blurred until one hour before the event starts. */
function useUnlockCountdown(date: string, time: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = parseDate(date, time).getTime();
  const unlockAt = start - HOUR;
  if (now >= start) return { isUnlocked: true, label: 'Event Started' };
  if (now >= unlockAt) return { isUnlocked: true, label: 'Unlocked!' };

  const diff = unlockAt - now;
  const days = Math.floor(diff / (24 * HOUR));
  const hours = Math.floor((diff % (24 * HOUR)) / HOUR);
  const minutes = Math.floor((diff % HOUR) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return {
    isUnlocked: false,
    label: `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s until unlock`,
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
          toast.success('Ticket listed on the Resale Market.');
          onClose();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-8"
      >
        <h3 className="mb-4 text-2xl font-bold">Set Resale Price</h3>
        <p className="mb-6 text-gray-400">
          Original price: {formatPrice(ticket.event.price)}. Set a price to list this ticket on the Resale Market.
        </p>
        <div className="relative">
          <DollarSign className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="pl-10"
            step="0.01"
            min="0.01"
            required
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={listForResale.isPending}>
            List for Sale
          </Button>
        </div>
      </form>
    </div>
  );
}

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const { event } = ticket;
  const { isUnlocked, label } = useUnlockCountdown(event.date, event.time);
  const [isResellOpen, setIsResellOpen] = useState(false);
  const cancelResale = useCancelResale();

  const qrData = `Event Name: ${event.name}\nVenue: ${event.location}\nTiming: ${parseDate(event.date).toDateString()} at ${event.time}\nTicket ID: ${ticket.id}`;

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg md:flex-row">
        <div className="flex grow flex-col justify-between p-6">
          <div>
            <p className="text-sm text-purple-400">{event.organizerName}</p>
            <h3 className="mb-2 text-2xl font-bold">{event.name}</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <Calendar className="size-4" /> {parseDate(event.date).toDateString()} at {event.time}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> {event.location}
              </p>
            </div>
          </div>
          {ticket.isForResale ? (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-green-900/50 p-3 text-green-300">
              <span>Listed for resale at {formatPrice(ticket.resalePrice ?? 0)}</span>
              <Button
                variant="danger"
                className="px-3 py-1 text-xs"
                loading={cancelResale.isPending}
                onClick={() =>
                  cancelResale.mutate(ticket.id, {
                    onSuccess: () => toast.success('Resale listing cancelled.'),
                    onError: (err) => toast.error(err.message),
                  })
                }
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="info" className="mt-4 w-full" onClick={() => setIsResellOpen(true)}>
              <Repeat className="size-5" /> Resell Ticket
            </Button>
          )}
        </div>
        <div className="flex w-full flex-col items-center justify-center bg-gray-700 p-6 md:w-80">
          <div
            className={`rounded-lg bg-white p-2 transition-all duration-500 ${isUnlocked ? '' : 'blur-lg select-none'}`}
            aria-hidden={!isUnlocked}
          >
            <QRCodeSVG value={qrData} size={144} />
          </div>
          <div
            className={`mt-4 rounded-lg px-4 py-2 text-center text-sm font-bold ${
              isUnlocked ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {label}
          </div>
        </div>
      </div>
      {isResellOpen && <ResellDialog ticket={ticket} onClose={() => setIsResellOpen(false)} />}
    </>
  );
}
