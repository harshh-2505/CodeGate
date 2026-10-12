import { ArrowLeft, PlusCircle, Ticket } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { EventCard } from '@/components/EventCard';
import { Button, EmptyState, ErrorState, Field, Input, Spinner, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useCreateEvent, useEvents } from '@/hooks/queries';

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const { data: events = [], isPending, error } = useEvents();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const mine = events.filter((e) => e.organizerId === user?.id);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-4xl font-bold">My Listed Events</h2>
        <Link
          to="/dashboard/new"
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-bold transition-colors hover:bg-purple-700"
        >
          <PlusCircle className="size-6" /> Create New Event
        </Link>
      </div>
      {mine.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mine.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Ticket} title="You haven't created any events yet." hint='Click "Create New Event" to get started.' />
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
        <ArrowLeft className="size-5" /> Back to Dashboard
      </Link>
      <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold">Create a New Event</h2>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Event Name">
              <Input value={form.name} onChange={set('name')} required />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={set('location')} required />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={set('date')} required />
            </Field>
            <Field label="Time">
              <Input type="time" value={form.time} onChange={set('time')} required />
            </Field>
            <Field label="Price ($)">
              <Input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input value={form.tags} onChange={set('tags')} placeholder="e.g., Music, Festival" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={4} value={form.description} onChange={set('description')} required />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" className="px-8 py-3 text-lg" loading={createEvent.isPending}>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
