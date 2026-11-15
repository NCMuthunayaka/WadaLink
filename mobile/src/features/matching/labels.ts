import type { MatchComponent } from '@/types/provider';

export const COMPONENT_ORDER: MatchComponent[] = ['rating', 'proximity', 'response', 'price', 'experience'];

export const COMPONENT_LABELS: Record<MatchComponent, string> = {
  rating: 'Rating',
  proximity: 'Proximity',
  response: 'Response time',
  price: 'Price',
  experience: 'Experience',
};

/** "35% rating, 25% proximity, ..." from the weights the backend used, largest first. */
export function describeWeights(weights: Record<MatchComponent, number>): string {
  return COMPONENT_ORDER.filter((c) => weights[c] > 0)
    .sort((a, b) => weights[b] - weights[a])
    .map((c) => `${Math.round(weights[c] * 100)}% ${COMPONENT_LABELS[c].toLowerCase()}`)
    .join(', ');
}