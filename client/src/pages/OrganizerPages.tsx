import { ArrowLeft } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { EventBoard } from '@/components/EventCard';
import { Button, EmptyState, ErrorState, Field, Input, PageTitle, Panel, Spinner, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { EventVisual } from '@/fx/EventVisual';
import { Magnetic } from '@/fx/interactions';
import { useCreateEvent, useEvents } from '@/hooks/queries';
import { formatPrice, parseDate } from '@/lib/format';

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const { data: events = [], isPending, error } = useEvents();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const mine = events.filter((e) => e.organizerId === user?.id);
  const upcoming = mine.filter((e) => parseDate(e.date, e.time).getTime() > Date.now()).length;
  const avgPrice = mine.length ? mine.reduce((sum, e) => sum + e.price, 0) / mine.length : 0;

  return (
    <div>
      <PageTitle
        index="CONSOLE / ORGANIZER"
        subtitle="Everything you've put on the board."
        action={
          <Magnetic>
            <Link to="/dashboard/new" data-cursor="NEW" className="cut-sm block bg-acid px-6 py-4 text-xs font-bold tracking-[0.2em] text-void uppercase">
              + New event
            </Link>
          </Magnetic>
        }
      >
        Your events
      </PageTitle>

      <div className="mb-12 grid grid-cols-3 border border-line">
        {[
          ['LISTED', String(mine.length).padStart(2, '0')],
          ['UPCOMING', String(upcoming).padStart(2, '0')],
          ['AVG PRICE', formatPrice(avgPrice)],
        ].map(([k, v], i) => (
          <div key={k} className={`p-6 ${i > 0 ? 'border-l border-line' : ''}`}>
            <p className="text-[10px] tracking-[0.3em] text-dim">{k}</p>
            <p className="mt-2 font-display text-3xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      {mine.length > 0 ? (
        <EventBoard events={mine} />
      ) : (
        <EmptyState code="0x00" title="Nothing on the board yet" hint='Hit "New event" to list your first one.' />
      )}
    </div>
  );
}

const emptyForm = { name: '', date: '', time: '', location: '', description: '', price: '', tags: '' };

export function CreateEventPage() {
  const [form, setForm] = useState(emptyForm);
  const createEvent = useCreateEvent();
  const navigate = useNavigate();

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    createEvent.mutate(
      {
        ...form,
        price: Number(form.price),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: (event) => {
          toast.success(`"${event.name}" is live.`);
          navigate('/dashboard');
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  // Live preview art changes as the name is typed.
  const previewSeed = [...form.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

  return (
    <div>
      <Link to="/dashboard" className="mb-10 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-acid">
        <ArrowLeft className="size-4" /> Console
      </Link>
      <PageTitle index="CONSOLE / NEW TRANSMISSION">Create event</PageTitle>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-8">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Event name">
                <Input value={form.name} onChange={set('name')} required />
              </Field>
              <Field label="Venue">
                <Input value={form.location} onChange={set('location')} placeholder="City, venue" required />
              </Field>
              <Field label="Date">
                <Input type="date" value={form.date} onChange={set('date')} required />
              </Field>
              <Field label="Doors">
                <Input type="time" value={form.time} onChange={set('time')} required />
              </Field>
              <Field label="Price (USD)">
                <Input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
              </Field>
              <Field label="Tags">
                <Input value={form.tags} onChange={set('tags')} placeholder="music, festival" />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={set('description')} required />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" className="px-8 py-4" loading={createEvent.isPending} cursor="LAUNCH">
                Publish event →
              </Button>
            </div>
          </form>
        </Panel>

        <div className="self-start">
          <p className="mb-3 text-[10px] tracking-[0.3em] text-dim">PREVIEW</p>
          <div className="cut border border-line bg-panel">
            <EventVisual seed={previewSeed} className="aspect-[16/10]" />
            <div className="border-t border-line p-5">
              <p className="text-[10px] tracking-[0.25em] text-acid">
                {form.date || 'YYYY-MM-DD'} · {form.time || '--:--'}
              </p>
              <p className="mt-2 font-display text-xl font-bold uppercase">{form.name || 'Untitled event'}</p>
              <p className="mt-1 text-xs text-mute">{form.location || 'Venue TBA'}</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-dim">Cover art is generated; the final piece is assigned when you publish.</p>
        </div>
      </div>
    </div>
  );
}
