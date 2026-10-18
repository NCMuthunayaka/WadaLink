// Equipment domain types

export type EquipmentStatus =
  | 'available'
  | 'reserved'
  | 'in_rent'
  | 'return_pending'
  | 'maintenance';

export type FilterTab = 'all' | EquipmentStatus;

export interface Rental {
  id: string;
  renterName: string;
  renterCompany?: string;
  renterPhone?: string;
  dueTime: string;           // e.g. "Until 5 PM"
  holdAmount?: number;
  pickupLocation?: string;
  returnLocation?: string;
  eta?: string;              // For return_pending, e.g. "42 minutes"
  paymentCleared?: boolean;
  contractUrl?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  localImage?: number;       // require('../assets/...') result
  pricePerDay: number;
  deposit?: number;
  deliveryFee?: number;
  deliveryRadius?: number;   // miles
  status: EquipmentStatus;
  tags?: string[];           // e.g. ["Trailer option", "Ready", "2-day min"]
  description?: string;
  activeRental?: Rental;
}

export interface EquipmentStats {
  totalItems: number;
  inRent: number;
  mtdRevenue: number;
  revenueChange: number;     // percentage vs avg, e.g. 14 = +14%
}

export interface FilterCount {
  filter: FilterTab;
  label: string;
  count: number;
}
