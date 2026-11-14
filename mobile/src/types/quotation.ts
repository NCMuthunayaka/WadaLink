import type { ID, ISODate } from './common';

export type PricingType = 'fixed' | 'hourly';
export type QuoteStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn';

export interface QuoteLineItem {
  id: ID;
  label: string;
  amount: number;
}

export interface Quotation {
  id: ID;
  requestId: ID;
  providerId: ID;
  pricingType: PricingType;
  amount: number; // total for fixed, estimated total for hourly
  hourlyRate?: number;
  lineItems: QuoteLineItem[];
  estimatedDurationMinutes: number;
  arrivalWindow: { from: ISODate; to: ISODate };
  notes?: string;
  status: QuoteStatus;
  submittedAt: ISODate;
  expiresAt?: ISODate;
}