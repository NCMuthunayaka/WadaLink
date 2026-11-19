import type { RequestsGateway } from '@/services/api/requests';
import type { MatchComponent, MatchedProvider, MatchResult } from '@/types/provider';
import type {
  AIClassification,
  NewRequestInput,
  ServiceCategory,
  ServiceRequest,
  Urgency,
} from '@/types/request';
import { mockCurrentUserId } from './auth';
import { clone, delay, mockError } from './utils';

const OTHER_ID = '8';

const CATEGORIES: ServiceCategory[] = [
  { id: '1', name: 'Electrical', description: 'Wiring, panels, outlets and lighting' },
  { id: '2', name: 'Plumbing', description: 'Leaks, drains, fixtures and water heaters' },
  { id: '3', name: 'HVAC / AC', description: 'Cooling, heating and ventilation' },
  { id: '4', name: 'Appliance Repair', description: 'Washers, fridges, ovens and more' },
  { id: '5', name: 'IT & Smart Home', description: 'Networks, devices and smart systems' },
  { id: '6', name: 'Auto Tech', description: 'Vehicle diagnostics and repair' },
  { id: '7', name: 'Cleaning', description: 'Deep cleaning and sanitising' },
  { id: OTHER_ID, name: 'Other', description: 'Anything else' },
];

// ---------------------------------------------------------------- providers

interface MockProvider {
  id: string;
  name: string;
  businessName?: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  baseDistanceKm: number;
  responseMinutes: number;
  hourlyRate: number;
  categoryIds: string[];
}

// The real backend has no provider-to-category link yet, so the mock invents one.
const PROVIDERS: MockProvider[] = [
  { id: '2', name: 'Marcus Rodriguez', experienceYears: 12, rating: 4.8, reviewCount: 142, verified: true, baseDistanceKm: 2.4, responseMinutes: 8, hourlyRate: 45, categoryIds: ['1'] },
  { id: '11', name: 'John Perera', experienceYears: 9, rating: 4.9, reviewCount: 98, verified: true, baseDistanceKm: 3.1, responseMinutes: 15, hourlyRate: 38, categoryIds: ['1'] },
  { id: '12', name: 'Sparkline Electrical Co.', businessName: 'Sparkline Electrical Co.', experienceYears: 15, rating: 4.7, reviewCount: 210, verified: true, baseDistanceKm: 4.8, responseMinutes: 20, hourlyRate: 50, categoryIds: ['1', '3'] },
  { id: '13', name: 'Elena Rossi', experienceYears: 6, rating: 4.6, reviewCount: 61, verified: false, baseDistanceKm: 6.2, responseMinutes: 18, hourlyRate: 55, categoryIds: ['1'] },
  { id: '14', name: 'Sam Carter', experienceYears: 10, rating: 4.7, reviewCount: 120, verified: true, baseDistanceKm: 1.9, responseMinutes: 12, hourlyRate: 48, categoryIds: ['2'] },
  { id: '15', name: 'Nadia Fernando', experienceYears: 7, rating: 4.5, reviewCount: 74, verified: true, baseDistanceKm: 5.4, responseMinutes: 25, hourlyRate: 42, categoryIds: ['2'] },
  { id: '16', name: 'Sarah Chen', experienceYears: 14, rating: 4.95, reviewCount: 128, verified: true, baseDistanceKm: 1.3, responseMinutes: 10, hourlyRate: 85, categoryIds: ['3'] },
  { id: '17', name: 'David Miller', experienceYears: 11, rating: 4.89, reviewCount: 94, verified: true, baseDistanceKm: 2.3, responseMinutes: 14, hourlyRate: 90, categoryIds: ['3'] },
  { id: '18', name: 'Priya Nair', experienceYears: 8, rating: 4.6, reviewCount: 55, verified: true, baseDistanceKm: 3.8, responseMinutes: 22, hourlyRate: 40, categoryIds: ['4'] },
  { id: '19', name: 'Omar Khan', experienceYears: 5, rating: 4.4, reviewCount: 39, verified: false, baseDistanceKm: 4.1, responseMinutes: 30, hourlyRate: 35, categoryIds: ['5'] },
  { id: '20', name: 'Lina Perera', experienceYears: 4, rating: 4.8, reviewCount: 160, verified: true, baseDistanceKm: 2.7, responseMinutes: 17, hourlyRate: 25, categoryIds: ['7'] },
];

// Ranking weights (sum = 1). The backend decides these; the app displays whatever it returns.
const WEIGHTS: Record<MatchComponent, number> = {
  rating: 0.35,
  proximity: 0.25,
  response: 0.15,
  price: 0.15,
  experience: 0.1,
};

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

// ----------------------------------------------------------- classification

interface Template {
  hazardHeadline: string;
  anomaly: string;
  rootCause: string;
  credentials: string;
  durationHours: { min: number; max: number };
  costRange: { min: number; max: number };
  safetyTips: string[];
}

const GENERIC: Template = {
  hazardHeadline: 'Safety concern detected',
  anomaly: 'Fault reported by the customer',
  rootCause: 'Needs an on-site inspection to confirm the cause.',
  credentials: 'Qualified technician for this trade.',
  durationHours: { min: 1, max: 3 },
  costRange: { min: 60, max: 150 },
  safetyTips: ['Stop using the affected item until it has been inspected.'],
};

const TEMPLATES: Record<string, Template> = {
  '1': {
    hazardHeadline: 'Potential fire hazard & sustained arc risk',
    anomaly: 'Overloaded circuit or breaker tripping',
    rootCause: 'Probable breaker overload or a faulty connection with high contact resistance.',
    credentials: 'Licensed electrician with a calibrated thermal multimeter.',
    durationHours: { min: 1.5, max: 2.5 },
    costRange: { min: 85, max: 140 },
    safetyTips: [
      'Avoid resetting the breaker repeatedly until it has been inspected.',
      'Keep flammable objects at least 3 feet from the electrical panel.',
    ],
  },
  '2': {
    hazardHeadline: 'Active leak or flooding risk',
    anomaly: 'Water escaping from a pipe, fixture or drain',
    rootCause: 'Probable failed seal, loose fitting or a blocked drain line.',
    credentials: 'Licensed plumber with leak-detection tools.',
    durationHours: { min: 1, max: 2 },
    costRange: { min: 70, max: 160 },
    safetyTips: [
      'Shut off the main water valve if water is spreading.',
      'Move valuables away from wet areas.',
    ],
  },
  '3': {
    hazardHeadline: 'Refrigerant or electrical fault risk',
    anomaly: 'Cooling or heating output below normal',
    rootCause: 'Probable low refrigerant, failed capacitor or a clogged coil.',
    credentials: 'HVAC technician with refrigerant handling certification.',
    durationHours: { min: 1.5, max: 3 },
    costRange: { min: 90, max: 220 },
    safetyTips: [
      'Switch the unit off at the thermostat if you smell burning.',
      'Do not open the outdoor unit panel yourself.',
    ],
  },
};

const KEYWORDS: Record<string, string[]> = {
  '1': ['breaker', 'circuit', 'outlet', 'wiring', 'spark', 'sparks', 'panel', 'electric', 'electrical', 'fuse', 'voltage', 'power'],
  '2': ['leak', 'leaking', 'pipe', 'faucet', 'drain', 'toilet', 'clog', 'clogged', 'sink', 'flood', 'burst', 'water heater'],
  '3': ['ac', 'a/c', 'air conditioner', 'hvac', 'heat pump', 'furnace', 'cooling', 'thermostat', 'compressor'],
  '4': ['washer', 'dryer', 'fridge', 'refrigerator', 'oven', 'dishwasher', 'microwave', 'stove'],
  '5': ['wifi', 'router', 'network', 'computer', 'laptop', 'camera', 'alarm', 'printer', 'internet'],
  '6': ['car', 'engine', 'brake', 'battery', 'tyre', 'tire', 'vehicle'],
  '7': ['clean', 'cleaning', 'carpet', 'stain', 'mold', 'dust', 'sanitize'],
};

const HAZARD_WORDS = ['spark', 'sparks', 'sparking', 'fire', 'smoke', 'burning', 'gas', 'flood', 'burst', 'shock', 'exposed wire'];

const URGENCY_ORDER: Urgency[] = ['low', 'medium', 'high', 'emergency'];
const maxUrgency = (a: Urgency, b: Urgency): Urgency =>
  URGENCY_ORDER.indexOf(a) >= URGENCY_ORDER.indexOf(b) ? a : b;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

function countHits(text: string, words: string[]): number {
  return words.filter((w) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(w)}([^a-z0-9]|$)`, 'i').test(text),
  ).length;
}

function classifyRequest(request: ServiceRequest): AIClassification {
  // Only what the customer wrote: the title is generated and always names the category.
  const text = request.description;
  const chosen = request.categoryId ?? OTHER_ID;

  // Prefer the category whose keywords match best; stay with the customer's choice on a tie.
  let bestId = chosen;
  let bestHits = KEYWORDS[chosen] ? countHits(text, KEYWORDS[chosen]) : 0;
  for (const [id, words] of Object.entries(KEYWORDS)) {
    const hits = countHits(text, words);
    if (hits > bestHits) {
      bestHits = hits;
      bestId = id;
    }
  }

  const hazard = countHits(text, HAZARD_WORDS) > 0;
  const template = TEMPLATES[bestId] ?? GENERIC;
  const confidence = Math.round(clamp(0.6 + Math.min(bestHits, 4) * 0.08 + (bestId === chosen ? 0.05 : 0), 0, 0.99) * 100) / 100;

  return {
    requestId: request.id,
    categoryId: bestId,
    categoryName: CATEGORIES.find((c) => c.id === bestId)?.name ?? 'Other',
    predictedUrgency: hazard ? maxUrgency(request.urgency, 'high') : request.urgency,
    confidence,
    // No keyword matched at all: the "model" fell back to the customer's own choice.
    status: bestHits === 0 ? 'fallback' : 'success',
    details: {
      riskHeadline: hazard ? template.hazardHeadline : undefined,
      anomaly: template.anomaly,
      rootCause: template.rootCause,
      credentials: template.credentials,
      durationHours: template.durationHours,
      costRange: template.costRange,
      safetyTips: hazard ? template.safetyTips : template.safetyTips.slice(0, 1),
    },
  };
}

// ----------------------------------------------------------------- matching

function buildMatches(request: ServiceRequest): MatchResult {
  // Match on the category the AI settled on, so this screen agrees with the AI result.
  const categoryId = classifyRequest(request).categoryId ?? OTHER_ID;
  const pool = PROVIDERS.filter((p) => categoryId === OTHER_ID || p.categoryIds.includes(categoryId));
  if (pool.length === 0) return { requestId: request.id, weights: WEIGHTS, providers: [] };

  const template = TEMPLATES[categoryId] ?? GENERIC;
  const midHours = (template.durationHours.min + template.durationHours.max) / 2;
  const avgRate = pool.reduce((sum, p) => sum + p.hourlyRate, 0) / pool.length;
  const seed = Number.parseInt(request.id, 10) || 0;

  const providers: MatchedProvider[] = pool
    .map((p) => {
      const distanceKm = round1(p.baseDistanceKm + (seed % 4) * 0.2);
      const rating = clamp((p.rating / 5) * 100);
      const proximity = clamp(100 - distanceKm * 10);
      const response = clamp(100 - p.responseMinutes * 2.5);
      const price = clamp(50 + ((avgRate - p.hourlyRate) / avgRate) * 100);
      const experience = clamp(p.experienceYears * 7);
      const total =
        rating * WEIGHTS.rating +
        proximity * WEIGHTS.proximity +
        response * WEIGHTS.response +
        price * WEIGHTS.price +
        experience * WEIGHTS.experience;

      return {
        providerId: p.id,
        name: p.name,
        businessName: p.businessName,
        experienceYears: p.experienceYears,
        rating: p.rating,
        reviewCount: p.reviewCount,
        verified: p.verified,
        distanceKm,
        responseMinutes: p.responseMinutes,
        hourlyRate: p.hourlyRate,
        estimatedPrice: Math.round((p.hourlyRate * midHours) / 5) * 5,
        rank: 0,
        score: {
          total: round1(total),
          rating: round1(rating),
          proximity: round1(proximity),
          response: round1(response),
          price: round1(price),
          experience: round1(experience),
        },
      };
    })
    .sort((a, b) => b.score.total - a.score.total)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return { requestId: request.id, weights: WEIGHTS, providers };
}

// ---------------------------------------------------------------- requests

let requests: ServiceRequest[] = [];
let nextId = 1000;

function requireCustomerId(): string {
  const id = mockCurrentUserId();
  if (!id) throw mockError(401, 'Not signed in');
  return id;
}

function findOwned(id: string): ServiceRequest {
  const customerId = requireCustomerId();
  const request = requests.find((r) => r.id === id && r.customerId === customerId);
  if (!request) throw mockError(404, 'Request not found');
  return request;
}

function validate(input: NewRequestInput): void {
  if (!CATEGORIES.some((c) => c.id === input.categoryId)) throw mockError(422, 'categoryId: unknown category');
}

export const mockRequestsGateway: RequestsGateway = {
  async listCategories() {
    await delay(200);
    return clone(CATEGORIES);
  },

  async listMyRequests() {
    await delay(300);
    const customerId = requireCustomerId();
    return clone(requests.filter((r) => r.customerId === customerId));
  },

  async getRequest(id) {
    await delay(200);
    return clone(findOwned(id));
  },

  async createRequest(input) {
    await delay(400);
    const customerId = requireCustomerId();
    validate(input);
    const now = new Date().toISOString();
    const request: ServiceRequest = {
      id: String(nextId++),
      customerId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      urgency: input.urgency,
      address: input.address,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    requests = [request, ...requests];
    return clone(request);
  },

  async updateRequest(id, input) {
    await delay(400);
    const request = findOwned(id);
    if (request.status !== 'open') throw mockError(409, 'Only open requests can be edited');
    validate(input);
    Object.assign(request, input, { updatedAt: new Date().toISOString() });
    return clone(request);
  },

  // Slower than the rest, to show the "analysing" state.
  async getClassification(requestId) {
    await delay(1200);
    return classifyRequest(findOwned(requestId));
  },

  async getMatches(requestId) {
    await delay(500);
    return buildMatches(findOwned(requestId));
  },
};