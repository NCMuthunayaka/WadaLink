import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type {
  Equipment,
  FilterTab,
  EquipmentStats,
  FilterCount,
  ReservationRequest,
  ReservationStatus,
  EquipmentStatus,
} from '../types/equipment';

// ─── Mock Equipment Data (Direct from Figma Designs) ──────────────────────────

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    assetTag: '#E8X',
    name: 'FLIR E8-XT Infrared Camera with MSX',
    brand: 'FLIR',
    model: 'E8-XT',
    category: 'Diagnostic & Inspection',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80',
    condition: 'like_new',
    conditionLabel: 'Like New / Calibrated',
    calibratedYear: 'Calibrated 2024',
    pricePerDay: 45,
    deposit: 150,
    minRentalPeriod: '1 Day',
    mandatoryInsurance: true,
    pickupLocation: 'Austin Downtown Workshop (742 E 6th St)',
    status: 'reserved',
    statusDetail: 'Reserved [Oct 25-27]',
    tags: ['Dual Batteries', 'Calibrated Oct 2024'],
    specs: 'Diagnostics • 320x240 IR Resolution • MSX Detail',
    rating: 4.9,
    reviewCount: 42,
    distanceKm: 1.8,
    isInstantBooking: true,
    isBookmarked: false,
    description:
      'High thermal sensitivity (<0.05°C) calibrated for electrical panel diagnostics, HVAC air leaks, and moisture boundary tracing. Includes hard case, 2 batteries, and charging dock.',
    owner: {
      id: 'lender-1',
      name: 'Marcus Rodriguez',
      initials: 'MR',
      role: 'Master Electrician',
      isVerified: true,
      isProPartner: true,
      rating: 4.8,
      reviewCount: 38,
      avgResponseTime: '~8 mins',
      location: 'Austin Downtown Workshop',
      distance: '1.4 miles away',
      phone: '+1 (512) 555-0144',
    },
    lockbox: {
      id: 'lockbox-04',
      name: 'Smart Lockbox #04',
      hubName: 'Austin Downtown Hub #4',
      bay: 'Bay 2',
      address: '410 E 5th St',
      distance: '0.8 km',
      batteryPct: 94,
      pinCode: '4829',
      validUntil: '5 PM return',
      isOpen: false,
    },
    activeRental: {
      id: 'r1',
      renterName: 'Sparkline Elec',
      renterCompany: 'Sparkline Electrical Services',
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
    assetTag: '#G555',
    name: 'Greenlee 555 Electric Conduit Bender',
    brand: 'Greenlee',
    model: '555',
    category: 'Heavy Electrical Tools',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
    condition: 'good',
    conditionLabel: 'Good / Minor Wear',
    pricePerDay: 65,
    deposit: 200,
    minRentalPeriod: '2-day min',
    mandatoryInsurance: false,
    pickupLocation: 'South Austin Yard (Lockbox #02)',
    status: 'available',
    statusDetail: 'Ready for dispatch',
    tags: ['Ready', '2-day min'],
    specs: 'Conduit • 1/2" to 2" EMT/Rigid • Squeeze-shoe',
    rating: 4.8,
    reviewCount: 19,
    distanceKm: 3.2,
    isInstantBooking: true,
    isBookmarked: false,
    description:
      'Kit includes 1/2" to 2" rigid & EMT shoes. Locking storage crate + remote foot control pendant.',
    owner: {
      id: 'lender-2',
      name: 'Sparkline Co.',
      initials: 'SC',
      role: 'Commercial Contractor',
      isVerified: true,
      isProPartner: false,
      rating: 4.8,
      reviewCount: 19,
      avgResponseTime: '~15 mins',
      location: 'South Austin Yard',
      distance: '3.2 km away',
      phone: '+1 (512) 555-0182',
    },
    lockbox: {
      id: 'lockbox-02',
      name: 'Smart Lockbox #02',
      hubName: 'South Austin Hub',
      bay: 'Bay 1',
      address: '1800 S Congress Ave',
      distance: '3.2 km',
      batteryPct: 88,
      pinCode: '3190',
      validUntil: '5 PM',
      isOpen: false,
    },
  },
  {
    id: '3',
    assetTag: '#301.5',
    name: 'CAT 301.5 Mini Excavator',
    brand: 'CAT',
    model: '301.5',
    category: 'Heavy Machinery • Trench Bucket',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
    condition: 'worksite',
    conditionLabel: 'Worksite / Field Ready',
    pricePerDay: 185,
    deposit: 500,
    deliveryFee: 40,
    deliveryRadius: 15,
    minRentalPeriod: '1 Day',
    mandatoryInsurance: true,
    pickupLocation: 'Capital Fleet Yard #2',
    status: 'available',
    statusDetail: 'Ready for dispatch • Instant Booking On',
    tags: ['Trailer option'],
    specs: '1.8 Ton • Expandable Tracks • Canopy Cab',
    rating: 5.0,
    reviewCount: 31,
    distanceKm: 4.5,
    isInstantBooking: false,
    isBookmarked: false,
    description:
      '1.8-ton compact mini excavator with trenching bucket, hydraulic thumb, and expandable undercarriage. Site delivery available.',
    owner: {
      id: 'lender-3',
      name: 'Capital Fleet Rentals',
      initials: 'CF',
      role: 'Heavy Machinery Depot',
      isVerified: true,
      isProPartner: true,
      rating: 5.0,
      reviewCount: 31,
      avgResponseTime: '~5 mins',
      location: 'East Austin Yard',
      distance: '4.5 miles away',
      phone: '+1 (512) 555-0199',
    },
  },
  {
    id: '4',
    assetTag: '#SW-3K',
    name: 'Southwire Maxis 3K Cable Puller',
    brand: 'Southwire',
    model: 'Maxis 3K',
    category: 'Conduit Pulling Rig',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80',
    condition: 'worksite',
    conditionLabel: 'Worksite / Field Ready',
    pricePerDay: 55,
    deposit: 200,
    minRentalPeriod: '1 Day',
    mandatoryInsurance: true,
    pickupLocation: 'East Austin Lockbox Hub',
    status: 'return_pending',
    statusDetail: 'Returned at 11:30 AM to Dock 2 • $200 Deposit on hold',
    tags: [],
    specs: 'Wire Pulling • 3,000 lbs peak pull • Ultra portable',
    rating: 4.7,
    reviewCount: 14,
    distanceKm: 2.1,
    isInstantBooking: false,
    isBookmarked: false,
    description:
      'Ultra portable conduit pulling rig. 3,000 lbs peak pulling force. Complete wire pulling adapter attachments included.',
    owner: {
      id: 'lender-1',
      name: 'Marcus Rodriguez',
      initials: 'MR',
      role: 'Master Electrician',
      isVerified: true,
      isProPartner: true,
      rating: 4.8,
      reviewCount: 38,
      avgResponseTime: '~8 mins',
      location: 'Austin Downtown Workshop',
      distance: '1.4 miles away',
    },
    activeRental: {
      id: 'r2',
      renterName: 'Renter (David M.)',
      dueTime: 'Due 6:00 PM',
      returnLocation: 'East Austin Lockbox',
      eta: '42 minutes (East Austin Lockbox)',
      paymentCleared: true,
      holdAmount: 200,
    },
  },
];

// ─── Initial Reservation Request (Matches Screen 6 REQ-5021) ─────────────────

const INITIAL_RESERVATION_REQUEST: ReservationRequest = {
  id: 'REQ-5021',
  equipmentId: '1',
  equipment: MOCK_EQUIPMENT[0],
  renter: {
    id: 'renter-501',
    name: 'David Miller',
    role: 'HVAC & Heat Pumps Specialist',
    specialty: 'HVAC Tech',
    rating: 4.9,
    rentalCount: 94,
    badge: 'Austin Pro',
    phone: '+1 (512) 555-0177',
  },
  status: 'pending_approval',
  expiresIn: 'Expires in 2h 15m',
  pickupDate: 'Tomorrow, Oct 25, 08:30 AM CDT',
  returnDate: 'Sunday, Oct 27, 05:00 PM CDT',
  durationDays: 2,
  fulfillmentMode: 'smart_lockbox',
  lockboxBay: 'Bay 2',
  lockboxPin: '4829',
  declaredApplication:
    'Commercial HVAC duct insulation audit & electrical distribution board thermal baseline scans for retail center client.',
  pricing: {
    dailyRate: 45.0,
    days: 2,
    subtotal: 90.0,
    lenderFee: 0.0,
    guaranteedPayout: 90.0,
    securityDeposit: 150.0,
    totalDue: 240.0,
    protectionPlan: 'ServiceLink $5,000 Guaranteed Equipment Protection',
  },
  timeline: [
    { step: 1, title: 'Unit Available & Calibrated', time: '14:10', status: 'completed' },
    { step: 2, title: 'Pending Lender Approval (Now)', time: 'Active', status: 'active' },
    { step: 3, title: 'PIN Issued & Ready in Lockbox #04', status: 'pending' },
    { step: 4, title: 'Contractor Picked Up / Rental Active', status: 'pending' },
    { step: 5, title: 'Check-in Inspection & Escrow Release', status: 'pending' },
  ],
  createdAt: '2025-10-24T09:30:00Z',
};

// ─── State Definition ─────────────────────────────────────────────────────────

interface EquipmentState {
  items: Equipment[];
  activeFilter: FilterTab;
  selectedCategory: string;
  searchQuery: string;
  roleView: 'provider' | 'customer';
  activeReservation: ReservationRequest | null;
  reservationsHistory: ReservationRequest[];
  isLoading: boolean;
  error: string | null;
  notificationsCount: number;
}

const initialState: EquipmentState = {
  items: MOCK_EQUIPMENT,
  activeFilter: 'all',
  selectedCategory: 'All Equipment',
  searchQuery: '',
  roleView: 'provider',
  activeReservation: INITIAL_RESERVATION_REQUEST,
  reservationsHistory: [INITIAL_RESERVATION_REQUEST],
  isLoading: false,
  error: null,
  notificationsCount: 1,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setRoleView(state, action: PayloadAction<'provider' | 'customer'>) {
      state.roleView = action.payload;
    },
    setFilter(state, action: PayloadAction<FilterTab>) {
      state.activeFilter = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    updateEquipmentStatus(
      state,
      action: PayloadAction<{ id: string; status: EquipmentStatus; detail?: string }>
    ) {
      const item = state.items.find((e) => e.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
        if (action.payload.detail) {
          item.statusDetail = action.payload.detail;
        }
      }
    },
    addEquipment(state, action: PayloadAction<Equipment>) {
      state.items.unshift(action.payload);
    },
    removeEquipment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
    toggleBookmark(state, action: PayloadAction<string>) {
      const item = state.items.find((e) => e.id === action.payload);
      if (item) {
        item.isBookmarked = !item.isBookmarked;
      }
    },
    // Lifecycle action 1: Approve reservation request
    approveReservation(state, action: PayloadAction<{ pinCode?: string }>) {
      if (state.activeReservation) {
        const pin = action.payload.pinCode || '4829';
        state.activeReservation.status = 'approved';
        state.activeReservation.lockboxPin = pin;
        // Advance timeline
        state.activeReservation.timeline[1].status = 'completed';
        state.activeReservation.timeline[2].status = 'active';
        state.activeReservation.timeline[2].time = 'PIN Issued (PIN: ' + pin + ')';

        // Update corresponding equipment
        const eq = state.items.find((e) => e.id === state.activeReservation?.equipmentId);
        if (eq) {
          eq.status = 'reserved';
          eq.statusDetail = 'Reserved [Oct 25-27]';
          if (eq.lockbox) {
            eq.lockbox.pinCode = pin;
          }
        }
      }
    },
    // Lifecycle action 2: Reject reservation
    rejectReservation(state) {
      if (state.activeReservation) {
        state.activeReservation.status = 'rejected';
        state.activeReservation.timeline[1].status = 'completed';
        state.activeReservation.timeline[1].time = 'Declined';
        const eq = state.items.find((e) => e.id === state.activeReservation?.equipmentId);
        if (eq) {
          eq.status = 'available';
          eq.statusDetail = 'Ready for dispatch';
        }
      }
    },
    // Lifecycle action 3: Renter unlocks lockbox & picks up gear
    simulatePickup(state) {
      if (state.activeReservation) {
        state.activeReservation.status = 'in_rent';
        state.activeReservation.timeline[2].status = 'completed';
        state.activeReservation.timeline[3].status = 'active';
        state.activeReservation.timeline[3].time = 'Active (Picked up)';
        const eq = state.items.find((e) => e.id === state.activeReservation?.equipmentId);
        if (eq) {
          eq.status = 'in_rent';
          eq.statusDetail = 'In Rental • Active until Oct 27';
        }
      }
    },
    // Lifecycle action 4: Renter initiates return
    simulateReturn(state) {
      if (state.activeReservation) {
        state.activeReservation.status = 'return_pending';
        state.activeReservation.timeline[3].status = 'completed';
        state.activeReservation.timeline[4].status = 'active';
        state.activeReservation.timeline[4].time = 'Returned • Pending Check-in';
        const eq = state.items.find((e) => e.id === state.activeReservation?.equipmentId);
        if (eq) {
          eq.status = 'return_pending';
          eq.statusDetail = 'Returned at Dock • Awaiting Inspection';
        }
      }
    },
    // Lifecycle action 5: Lender inspects & checks in gear (Full cycle complete: back to Available)
    checkInEquipment(state, action: PayloadAction<{ id: string; releaseDeposit?: boolean }>) {
      const item = state.items.find((e) => e.id === action.payload.id);
      if (item) {
        item.status = 'available';
        item.statusDetail = 'Ready for dispatch';
        item.activeRental = undefined;
      }
      if (state.activeReservation && state.activeReservation.equipmentId === action.payload.id) {
        state.activeReservation.status = 'returned';
        state.activeReservation.timeline[4].status = 'completed';
        state.activeReservation.timeline[4].time = 'Escrow Released & Check-in Complete ✓';
      }
    },
    // Customer reserves an item from Equipment Details screen
    createReservation(state, action: PayloadAction<ReservationRequest>) {
      state.activeReservation = action.payload;
      state.reservationsHistory.unshift(action.payload);
      const eq = state.items.find((e) => e.id === action.payload.equipmentId);
      if (eq) {
        eq.status = 'reserved';
        eq.statusDetail = 'Reserved (Awaiting Approval)';
      }
    },
  },
});

export const {
  setRoleView,
  setFilter,
  setSelectedCategory,
  setSearchQuery,
  updateEquipmentStatus,
  addEquipment,
  removeEquipment,
  toggleBookmark,
  approveReservation,
  rejectReservation,
  simulatePickup,
  simulateReturn,
  checkInEquipment,
  createReservation,
} = equipmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

type RootState = { equipment: EquipmentState };

export const selectEquipmentState = (state: RootState) => state.equipment;
export const selectAllEquipment = (state: RootState) => state.equipment.items;
export const selectActiveFilter = (state: RootState) => state.equipment.activeFilter;
export const selectSelectedCategory = (state: RootState) => state.equipment.selectedCategory;
export const selectSearchQuery = (state: RootState) => state.equipment.searchQuery;
export const selectRoleView = (state: RootState) => state.equipment.roleView;
export const selectActiveReservation = (state: RootState) => state.equipment.activeReservation;

export const selectFilteredEquipment = createSelector(
  selectAllEquipment,
  selectActiveFilter,
  (items, filter) =>
    filter === 'all'
      ? items
      : items.filter((e) => {
          if (filter === 'inspection') {
            return e.status === 'return_pending' || e.status === 'inspection';
          }
          return e.status === filter;
        })
);

export const selectMarketplaceEquipment = createSelector(
  selectAllEquipment,
  selectSelectedCategory,
  selectSearchQuery,
  (items, category, query) => {
    let list = items;
    if (category && category !== 'All Equipment') {
      const catLower = category.toLowerCase();
      list = list.filter(
        (e) =>
          e.category.toLowerCase().includes(catLower) ||
          e.name.toLowerCase().includes(catLower)
      );
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.specs && e.specs.toLowerCase().includes(q))
      );
    }
    return list;
  }
);

export const selectStats = createSelector(
  selectAllEquipment,
  (items): EquipmentStats => ({
    totalItems: items.length,
    inRent: items.filter((e) => e.status === 'in_rent' || e.status === 'reserved').length,
    mtdRevenue: 1840,
    revenueChange: 18,
    pendingRequests: 1,
    fleetYield: 50,
  })
);

export const selectFilterCounts = createSelector(
  selectAllEquipment,
  (items): FilterCount[] => {
    const counts: Record<string, number> = {};
    items.forEach((e) => {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    });
    return [
      { filter: 'all' as FilterTab, label: 'All', count: items.length },
      { filter: 'available' as FilterTab, label: 'Available', count: counts.available ?? 0 },
      { filter: 'reserved' as FilterTab, label: 'Reserved', count: counts.reserved ?? 0 },
      { filter: 'in_rent' as FilterTab, label: 'In Rent', count: counts.in_rent ?? 0 },
      { filter: 'return_pending' as FilterTab, label: 'Return Pending', count: counts.return_pending ?? 0 },
      { filter: 'inspection' as FilterTab, label: 'Inspection', count: (counts.return_pending ?? 0) + (counts.inspection ?? 0) },
    ];
  }
);

export default equipmentSlice.reducer;