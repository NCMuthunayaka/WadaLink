import type { EquipmentGateway } from '@/services/api/equipment';
import type { Equipment, EquipmentStats } from '@/types/equipment';
import { clone, delay, mockError } from './utils';

const SEED: Equipment[] = [
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
    description:
      'Kit includes 1/2" to 2" rigid & EMT shoes. Locking storage crate + remote foot control pendant.',
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

// In-memory "database": changes persist until the app reloads.
let items: Equipment[] = clone(SEED);
let nextId = 100;

const MTD_REVENUE = 680;
const REVENUE_CHANGE = 14;

function find(id: string): Equipment {
  const item = items.find((e) => e.id === id);
  if (!item) throw mockError(404, 'Equipment not found');
  return item;
}

export const mockEquipmentGateway: EquipmentGateway = {
  async list() {
    await delay();
    return clone(items);
  },

  async stats() {
    await delay(200);
    const stats: EquipmentStats = {
      totalItems: items.length,
      inRent: items.filter((e) => e.status === 'in_rent' || e.status === 'reserved').length,
      mtdRevenue: MTD_REVENUE,
      revenueChange: REVENUE_CHANGE,
    };
    return stats;
  },

  async updateStatus(id, status) {
    await delay(250);
    const item = find(id);
    item.status = status;
    // A returned item has no active rental any more.
    if (status === 'available') delete item.activeRental;
    return clone(item);
  },

  async create(input) {
    await delay(300);
    const created: Equipment = { status: 'available', ...input, id: String(nextId++) };
    items = [created, ...items];
    return clone(created);
  },

  async remove(id) {
    await delay(250);
    find(id);
    items = items.filter((e) => e.id !== id);
  },
};