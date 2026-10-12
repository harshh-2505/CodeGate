import type { Event, NewEvent, Session, Ticket, User, UserType } from './types';

const TOKEN_KEY = 'codegate.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? `Request failed (${res.status}).`);
  return data as T;
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const api = {
  login: (email: string, password: string) => post<Session>('/auth/login', { email, password }),
  signup: (input: { name: string; email: string; password: string; type: UserType }) =>
    post<Session>('/auth/signup', input),
  me: () => request<{ user: User }>('/auth/me'),

  events: () => request<Event[]>('/events'),
  event: (id: number) => request<Event>(`/events/${id}`),
  createEvent: (input: NewEvent) => post<Event>('/events', input),

  myTickets: () => request<Ticket[]>('/tickets'),
  buyTicket: (eventId: number) => post<Ticket>('/tickets', { eventId }),
  listForResale: (ticketId: number, price: number) =>
    request<Ticket>(`/tickets/${ticketId}/resale`, { method: 'PUT', body: JSON.stringify({ price }) }),
  cancelResale: (ticketId: number) => request<Ticket>(`/tickets/${ticketId}/resale`, { method: 'DELETE' }),

  resaleListings: () => request<Ticket[]>('/resale'),
  buyResale: (ticketId: number) => post<Ticket>(`/resale/${ticketId}/buy`),
};
