import { useMemo } from 'react';
import { useGetEquipmentQuery, useGetEquipmentStatsQuery } from '@/services/api/equipment';
import { selectActiveFilter } from '@/store/equipmentSlice';
import { useAppSelector } from '@/store/hooks';
import type { Equipment, EquipmentStats } from '@/types/equipment';
import { buildFilterCounts, filterEquipment } from '../selectors';

const EMPTY_ITEMS: Equipment[] = [];
const EMPTY_STATS: EquipmentStats = { totalItems: 0, inRent: 0, mtdRevenue: 0, revenueChange: 0, pendingRequests: 0, fleetYield: 0 };

export type FleetStatus = 'loading' | 'error' | 'ready';

/** Everything the equipment management screen needs, in one hook. */
export function useEquipmentFleet() {
  const activeFilter = useAppSelector(selectActiveFilter);
  const list = useGetEquipmentQuery();
  const statsQuery = useGetEquipmentStatsQuery();

  const all = list.data ?? EMPTY_ITEMS;
  const items = useMemo(() => filterEquipment(all, activeFilter), [all, activeFilter]);
  const filterCounts = useMemo(() => buildFilterCounts(all), [all]);

  // "error" only when there is nothing cached to show.
  const status: FleetStatus = list.data ? 'ready' : list.isError ? 'error' : 'loading';

  return {
    items,
    stats: statsQuery.data ?? EMPTY_STATS,
    filterCounts,
    activeFilter,
    status,
    isRefreshing: list.isFetching && !list.isLoading,
    refetch: () => {
      void list.refetch();
      void statsQuery.refetch();
    },
  };
}
