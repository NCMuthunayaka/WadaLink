import type { ID } from './common';

// provider_scores has one column per component (rating_score, price_score,
// experience_score, distance_score, response_time_score) plus total_score.
export type MatchComponent = 'rating' | 'proximity' | 'response' | 'price' | 'experience';

/** Every value is 0 to 100. */
export interface MatchScoreBreakdown {
  total: number;
  rating: number;
  proximity: number;
  response: number;
  price: number;
  experience: number;
}

/** One ranked provider for a request (provider_scores joined with provider data). */
export interface MatchedProvider {
  providerId: ID;
  name: string;
  businessName?: string;
  experienceYears: number;
  /** Average of the provider's reviews. */
  rating: number;
  reviewCount: number;
  verified: boolean;
  distanceKm: number;
  responseMinutes: number;
  hourlyRate?: number;
  estimatedPrice?: number;
  /** rank_position, 1 = best */
  rank: number;
  score: MatchScoreBreakdown;
}

export interface MatchResult {
  requestId: ID;
  /** Weights the ranking used, summing to 1. Shown in the "transparent AI" banner. */
  weights: Record<MatchComponent, number>;
  providers: MatchedProvider[];
}