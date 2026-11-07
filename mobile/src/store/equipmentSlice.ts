import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { Equipment, FilterTab, EquipmentStats, FilterCount } from '../types/equipment';

// ─── Mock Data (matches the screenshot exactly) ──────────────────────────────

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    name: 'FLIR E8-XT Thermal Ca...',
    category: 'Diagnostic & Inspection',
    imageUrl: 'https://images.unsplash.com/photo-1635002962399-9e6c2e6e6e6e?w=200',
    pricePerDay: 45,
    deposit: 150,
    status: 'reserved',
    tags: [],
    activeRental: {
      id: 'r1',
      renterName: 'Sparkline Elec',
      renterCompany: 'Sparkline Electrical',
      renterPhone: '+1 555-0101',
      dueTime: 'Until 5 PM',
      holdAmount: 150,
      pickupLocation: 'Downtown Austin',
      returnLocation: 'Downtown Austin',
      paymentCleared: false,
    },
  },
  {
    id: '2',
    name: 'Greenlee 555 Conduit ...',
    category: 'Heavy Electrical Tools',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200',
    pricePerDay: 65,
    status: 'available',
    tags: ['Ready', '2-day min'],
    description: 'Kit includes 1/2" to 2" rigid & EMT shoes. Locking storage crate + remote foot control pendant.',
  },
  {
    id: '3',
    name: 'CAT 301.5 Mini Excava...',
    category: 'Heavy Machinery • Trench Bucket',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    pricePerDay: 185,
    deposit: 500,
    deliveryFee: 40,
    deliveryRadius: 15,
    status: 'available',
    tags: ['Trailer option'],
  },
  {
    id: '4',
    name: 'Southwire Maxis 3K C...',
    category: 'Conduit Pulling Rig',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200',
    pricePerDay: 55,
    status: 'return_pending',
    tags: [],
    activeRental: {
      id: 'r2',
      renterName: 'Renter',
      dueTime: 'Due 6:00 PM',
      returnLocation: 'East Austin Lockbox',
      eta: '42 minutes',
      paymentCleared: true,
    },
  },
];

// ─── State Shape ──────────────────────────────────────────────────────────────

interface EquipmentState {
  items: Equipment[];
  activeFilter: FilterTab;
  isLoading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  items: MOCK_EQUIPMENT,
  activeFilter: 'all',
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<FilterTab>) {
      state.activeFilter = action.payload;
    },
    updateEquipmentStatus(
      state,
      action: PayloadAction<{ id: string; status: Equipment['status'] }>
    ) {
      const item = state.items.find((e) => e.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
      }
    },
    addEquipment(state, action: PayloadAction<Equipment>) {
      state.items.push(action.payload);
    },
    removeEquipment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
  },
});

export const { setFilter, updateEquipmentStatus, addEquipment, removeEquipment } =
  equipmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

type RootState = { equipment: EquipmentState };

export const selectAllEquipment = (state: RootState) => state.equipment.items;
export const selectActiveFilter = (state: RootState) => state.equipment.activeFilter;

export const selectFilteredEquipment = createSelector(
  selectAllEquipment,
  selectActiveFilter,
  (items, filter) => (filter === 'all' ? items : items.filter((e: Equipment) => e.status === filter))
);

export const selectStats = createSelector(
  selectAllEquipment,
  (items): EquipmentStats => ({
    totalItems: items.length,
    inRent: items.filter((e) => e.status === 'in_rent' || e.status === 'reserved').length,
    mtdRevenue: 680,
    revenueChange: 14,
  })
);

export const selectFilterCounts = createSelector(
  selectAllEquipment,
  (items): FilterCount[] => {
    const counts: Record<string, number> = {};
    items.forEach((e) => {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    });
    return ([
      { filter: 'all' as FilterTab, label: 'All', count: items.length },
      { filter: 'available' as FilterTab, label: 'Available', count: counts.available ?? 0 },
      { filter: 'reserved' as FilterTab, label: 'Reserved', count: counts.reserved ?? 0 },
      { filter: 'in_rent' as FilterTab, label: 'In Rent', count: counts.in_rent ?? 0 },
      { filter: 'return_pending' as FilterTab, label: 'Return Pending', count: counts.return_pending ?? 0 },
      { filter: 'maintenance' as FilterTab, label: 'Maintenance', count: counts.maintenance ?? 0 },
    ] as FilterCount[]).filter((f) => f.filter === 'all' || f.count > 0);
  }
);

export default equipmentSlice.reducer;
