import type { Address, ID, ISODate } from './common';

export const SERVICE_CATEGORIES = [
  'electrical',
  'plumbing',
  'hvac',
  'carpentry',
  'painting',
  'appliance',
  'general',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const URGENCY_LEVELS = ['standard', 'urgent', 'emergency'] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export type RequestStatus = 'draft' | 'open' | 'quoted' | 'booked' | 'cancelled';

export interface ServiceRequest {
  id: ID;
  customerId: ID;
  category: ServiceCategory;
  title: string;
  description: string;
  urgency: Urgency;
  address: Address;
  scheduledFor?: ISODate;
  photos: string[];
  status: RequestStatus;
  createdAt: ISODate;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AIClassification {
  requestId: ID;
  category: ServiceCategory;
  /** 0 to 1 */
  confidence: number;
  risk: RiskLevel;
  probableCause: string;
  estimatedDurationMinutes: { min: number; max: number };
  costBenchmark: { min: number; max: number };
  safetyTips: string[];
}