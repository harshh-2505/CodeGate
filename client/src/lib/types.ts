export type UserType = 'customer' | 'organizer';

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserType;
}

export interface Event {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string;
  price: number;
  organizerId: number;
  organizerName: string;
  image: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Ticket {
  id: number;
  eventId: number;
  ownerId: number;
  purchaseDate: string;
  isForResale: boolean;
  resalePrice: number | null;
  event: Event;
}

export interface NewEvent {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  price: number;
  tags: string[];
}

export interface Session {
  user: User;
  token: string;
}
