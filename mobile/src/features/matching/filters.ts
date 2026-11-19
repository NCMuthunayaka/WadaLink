import type { MatchedProvider } from '@/types/provider';

export interface MatchFilters {
  sort: 'best' | 'price';
  within5km: boolean;
  topRated: boolean;
  verifiedOnly: boolean;
}

export const DEFAULT_FILTERS: MatchFilters = {
  sort: 'best',
  within5km: false,
  topRated: false,
  verifiedOnly: false,
};

export function applyMatchFilters(providers: MatchedProvider[], filters: MatchFilters): MatchedProvider[] {
  const kept = providers.filter(
    (p) =>
      (!filters.within5km || p.distanceKm < 5) &&
      (!filters.topRated || p.rating >= 4.5) &&
      (!filters.verifiedOnly || p.verified),
  );

  return [...kept].sort((a, b) =>
    filters.sort === 'price'
      ? (a.estimatedPrice ?? Infinity) - (b.estimatedPrice ?? Infinity) || a.rank - b.rank
      : a.rank - b.rank,
  );
}

/** 0 to 100, from the backend's total_score. */
export function matchPercent(provider: MatchedProvider): number {
  return Math.round(provider.score.total);
}

/** "Fastest Response" and "Best Value" labels, derived from the list itself. */
export function badgesFor(providers: MatchedProvider[]): Map<string, string[]> {
  const badges = new Map<string, string[]>();
  if (providers.length < 2) return badges;

  const add = (id: string, label: string) => badges.set(id, [...(badges.get(id) ?? []), label]);

  const fastest = providers.reduce((a, b) => (b.responseMinutes < a.responseMinutes ? b : a));
  add(fastest.providerId, 'Fastest Response');

  // Best value: cheapest among well-rated providers (fall back to cheapest overall).
  const priced = providers.filter((p) => p.estimatedPrice !== undefined);
  const wellRated = priced.filter((p) => p.rating >= 4.5);
  const pool = wellRated.length > 0 ? wellRated : priced;
  if (pool.length > 0) {
    const cheapest = pool.reduce((a, b) => ((b.estimatedPrice ?? Infinity) < (a.estimatedPrice ?? Infinity) ? b : a));
    add(cheapest.providerId, 'Best Value');
  }
  return badges;
}