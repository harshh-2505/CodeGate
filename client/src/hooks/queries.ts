import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { NewEvent } from '@/lib/types';

export const keys = {
  events: ['events'] as const,
  event: (id: number) => ['events', id] as const,
  myTickets: ['tickets', 'mine'] as const,
  resale: ['tickets', 'resale'] as const,
};

export const useEvents = () => useQuery({ queryKey: keys.events, queryFn: api.events });

export const useEvent = (id: number) =>
  useQuery({ queryKey: keys.event(id), queryFn: () => api.event(id), enabled: Number.isFinite(id) });

export const useMyTickets = (enabled = true) =>
  useQuery({ queryKey: keys.myTickets, queryFn: api.myTickets, enabled });

export const useResaleListings = () => useQuery({ queryKey: keys.resale, queryFn: api.resaleListings });

/** Every ticket mutation can change both "my tickets" and the resale market. */
function useTicketMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export const useBuyTicket = () => useTicketMutation((eventId: number) => api.buyTicket(eventId));
export const useListForResale = () =>
  useTicketMutation(({ ticketId, price }: { ticketId: number; price: number }) => api.listForResale(ticketId, price));
export const useCancelResale = () => useTicketMutation((ticketId: number) => api.cancelResale(ticketId));
export const useBuyResale = () => useTicketMutation((ticketId: number) => api.buyResale(ticketId));

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewEvent) => api.createEvent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.events }),
  });
}
