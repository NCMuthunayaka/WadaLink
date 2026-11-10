import type { GeoPoint, ID } from './common';
import type { ServiceCategory } from './request';

export interface Provider {
  id: ID;
  name: string;
  avatarUrl?: string;
  headline: string; // "Master Electrician"
  categories: ServiceCategory[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  licenseNumber?: string;
  responseMinutes: number;
  hourlyRate?: number;
  location: GeoPoint;
  serviceRadiusKm: number;
  isOnline: boolean;
}

/** Transparent AI ranking weights shown in the design. */
export const MATCH_WEIGHTS = {
  rating: 0.4,
  proximity: 0.25,
  responseTime: 0.2,
  price: 0.15,
} as const;

/** Each component is 0 to 100; total is the weighted sum. */
export interface MatchScore {
  total: number;
  rating: number;
  proximity: number;
  responseTime: number;
  price: number;
}

export interface MatchedProvider {
  provider: Provider;
  distanceKm: number;
  etaMinutes: number;
  estimatedPrice: number;
  score: MatchScore;
}