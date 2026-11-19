import type { Address, ID, ISODate } from './common';

export const JOB_STATUSES = [
  'requested',
  'provider_selected',
  'confirmed',
  'en_route',
  'on_site',
  'completed',
  'cancelled',
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Money held by the platform until the customer approves completion. */
export type EscrowStatus = 'none' | 'authorized' | 'held' | 'released' | 'refunded';

export interface PaymentSummary {
  subtotal: number;
  platformFee: number;
  tax: number;
  total: number;
  deposit: number;
  escrow: EscrowStatus;
}

export interface Booking {
  id: ID;
  requestId: ID;
  quotationId?: ID;
  customerId: ID;
  providerId: ID;
  status: JobStatus;
  scheduledFor: ISODate;
  address: Address;
  payment: PaymentSummary;
  etaMinutes?: number;
  createdAt: ISODate;
}