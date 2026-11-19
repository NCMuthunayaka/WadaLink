import type { ID, ISODate } from './common';

export interface ChatMessage {
  id: ID;
  bookingId: ID;
  senderId: ID;
  text: string;
  attachments?: string[];
  sentAt: ISODate;
  readAt?: ISODate;
}

/** Chats are scoped to a job. */
export interface ChatThread {
  bookingId: ID;
  participantIds: ID[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}