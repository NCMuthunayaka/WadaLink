import { statusLabels } from '@/constants/theme';
import type { Equipment, EquipmentStatus, FilterCount, FilterTab } from '@/types/equipment';

const STATUS_FILTERS: EquipmentStatus[] = [
  'available',
  'reserved',
  'in_rent',
  'return_pending',
  'maintenance',
];

export function filterEquipment(items: Equipment[], filter: FilterTab): Equipment[] {
  return filter === 'all' ? items : items.filter((e) => e.status === filter);
}

/** "All" is always shown; a status tab only appears when it has items. */
export function buildFilterCounts(items: Equipment[]): FilterCount[] {
  const counts = new Map<EquipmentStatus, number>();
  items.forEach((e) => counts.set(e.status, (counts.get(e.status) ?? 0) + 1));

  return [
    { filter: 'all', label: 'All', count: items.length },
    ...STATUS_FILTERS.filter((s) => (counts.get(s) ?? 0) > 0).map((s) => ({
      filter: s,
      label: statusLabels[s],
      count: counts.get(s) ?? 0,
    })),
  ];
}