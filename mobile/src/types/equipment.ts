// Equipment domain types & lifecycle definitions

export type EquipmentStatus =
  | 'available'
  | 'reserved'
  | 'in_rent'
  | 'return_pending'
  | 'maintenance'
  | 'inspection';

export type EquipmentCondition = 'like_new' | 'good' | 'worksite';

export type FilterTab = 'all' | EquipmentStatus;

export type ReservationStatus =
  | 'pending_approval'
  | 'approved'
  | 'reserved'
  | 'in_rent'
  | 'return_pending'
  | 'returned'
  | 'rejected';

export type FulfillmentMode = 'smart_lockbox' | 'courier';

export interface OwnerProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  isVerified: boolean;
  isProPartner: boolean;
  rating: number;
  reviewCount: number;
  avgResponseTime: string;
  location: string;
  distance: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LockboxInfo {
  id: string;
  name: string;
  hubName: string;
  bay: string;
  address: string;
  distance: string;
  batteryPct: number;
  pinCode?: string;
  validUntil?: string;
  isOpen?: boolean;
}

export interface Rental {
  id: string;
  renterName: string;
  renterCompany?: string;
  renterPhone?: string;
  dueTime: string;           // e.g. "Until 5 PM" or "Due 6:00 PM"
  holdAmount?: number;
  pickupLocation?: string;
  returnLocation?: string;
  eta?: string;              // For return_pending, e.g. "42 minutes (East Austin Lockbox)"
  paymentCleared?: boolean;
  contractUrl?: string;
}

export interface Equipment {
  id: string;
  assetTag?: string;         // e.g. "#E8X", "#301.5", "#G555", "#SW-3K"
  name: string;
  brand?: string;
  model?: string;
  category: string;
  imageUrl?: string;
  condition: EquipmentCondition;
  conditionLabel?: string;   // e.g. "Like New / Calibrated"
  calibratedYear?: string;   // e.g. "Calibrated 2024"
  pricePerDay: number;
  deposit?: number;
  minRentalPeriod?: string;  // e.g. "1 Day", "2-day min"
  mandatoryInsurance?: boolean;
  pickupLocation?: string;
  deliveryFee?: number;
  deliveryRadius?: number;   // miles
  status: EquipmentStatus;
  statusDetail?: string;     // e.g. "Ready for dispatch", "Return in 2h 40m"
  tags?: string[];           // e.g. ["Trailer option", "Ready", "2-day min", "Dual Batteries"]
  description?: string;
  specs?: string;            // e.g. "Diagnostics • 320x240 IR Resolution • MSX Detail"
  rating?: number;
  reviewCount?: number;
  distanceKm?: number;
  owner?: OwnerProfile;
  lockbox?: LockboxInfo;
  activeRental?: Rental;
  isInstantBooking?: boolean;
  isBookmarked?: boolean;
}

export interface TimelineStep {
  step: number;
  title: string;
  time?: string;
  status: 'completed' | 'active' | 'pending';
}

export interface ReservationRequest {
  id: string;                // e.g. "REQ-5021"
  equipmentId: string;
  equipment: Equipment;
  renter: {
    id: string;
    name: string;
    role: string;
    specialty: string;
    rating: number;
    rentalCount: number;
    badge: string;           // e.g. "Austin Pro"
    phone: string;
    avatarUrl?: string;
  };
  status: ReservationStatus;
  expiresIn: string;         // e.g. "Expires in 2h 15m" or "14m left"
  pickupDate: string;        // e.g. "Tomorrow, Oct 25, 08:30 AM CDT"
  returnDate: string;        // e.g. "Sunday, Oct 27, 05:00 PM CDT"
  durationDays: number;
  fulfillmentMode: FulfillmentMode;
  lockboxBay?: string;
  lockboxPin?: string;
  declaredApplication: string;
  pricing: {
    dailyRate: number;
    days: number;
    subtotal: number;
    lenderFee: number;
    guaranteedPayout: number;
    securityDeposit: number;
    totalDue: number;
    protectionPlan: string;
  };
  timeline: TimelineStep[];
  createdAt: string;
}

export interface EquipmentStats {
  totalItems: number;
  inRent: number;
  mtdRevenue: number;
  revenueChange: number;     // percentage vs avg, e.g. 14 = +14%
  pendingRequests: number;
  fleetYield: number;        // e.g. 50%
}

export interface FilterCount {
  filter: FilterTab;
  label: string;
  count: number;
}


export type NewEquipmentInput = Omit<Equipment, 'id' | 'status' | 'activeRental'> & {
  status?: EquipmentStatus;
};
