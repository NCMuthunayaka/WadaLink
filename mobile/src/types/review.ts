import type { ID, ISODate } from './common';

export interface Review {
  id: ID;
  bookingId: ID;
  reviewerId: ID;
  revieweeId: ID;
  rating: number; // 1 to 5
  comment?: string;
  tags?: string[];
  createdAt: ISODate;
}