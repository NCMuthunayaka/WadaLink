import type { ID, ISODate } from './common';

// Mirrors service_categories (category_id, category_name, description, parent_category_id).
export interface ServiceCategory {
  id: ID;
  name: string;
  description?: string;
  parentId?: ID;
}

// Mirrors service_requests.urgency. The design offers three of these:
// Standard = medium, Urgent = high, Emergency = emergency.
export const URGENCY_LEVELS = ['low', 'medium', 'high', 'emergency'] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

// Mirrors service_requests.status.
export const REQUEST_STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'cancelled'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface ServiceRequest {
  id: ID;
  customerId: ID;
  categoryId?: ID;
  selectedProviderId?: ID;
  title: string; // max 200
  description: string;
  urgency: Urgency;
  address: string; // max 255
  latitude?: number;
  longitude?: number;
  budgetMin?: number;
  budgetMax?: number;
  status: RequestStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface NewRequestInput {
  categoryId: ID;
  title: string;
  description: string;
  urgency: Urgency;
  address: string;
  budgetMin?: number;
  budgetMax?: number;
}

// Mirrors classification_logs.status.
export type ClassificationStatus = 'success' | 'failed' | 'fallback';

/**
 * One classification_logs row. `details` is what the backend should store in
 * output_json so the AI result screen can render it.
 */
export interface AIClassification {
  layer?: 'model' | 'llm' | 'keyword' | 'user';
  requestId: ID;
  categoryId?: ID;
  categoryName: string;
  predictedUrgency: Urgency;
  /** 0 to 1 (confidence_score) */
  confidence: number;
  status: ClassificationStatus;
  details: {
    categories?: string[];
    reason?: string;
    riskHeadline?: string;
    anomaly?: string;
    rootCause?: string;
    credentials?: string;
    durationHours?: { min: number; max: number };
    costRange?: { min: number; max: number };
    safetyTips: string[];
  };
}
