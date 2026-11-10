import type { ID, ISODate } from './common';

export const RESERVATION_STATUSES = [
  'pending',
  'approved',
  'declined',
  'active',
  'return_pending',
  'completed',
  'cancelled',
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type Fulfilment = 'lockbox' | 'courier' | 'pickup';

export interface Reservation {
  id: ID;
  equipmentId: ID;
  renterId: ID;
  ownerId: ID;
  startDate: ISODate;
  endDate: ISODate;
  fulfilment: Fulfilment;
  status: ReservationStatus;
  pricing: { rental: number; deposit: number; deliveryFee: number; total: number };
  lockboxPin?: string;
  respondBy?: ISODate; // countdown for the owner to approve or decline
  createdAt: ISODate;
}