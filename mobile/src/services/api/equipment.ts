import apiClient from './client';
import type { Equipment, EquipmentStatus } from '../../types/equipment';

export interface CreateEquipmentPayload {
  name: string;
  category: string;
  condition: string;
  pricePerDay: number;
  deposit: number;
  minRentalPeriod?: string;
  mandatoryInsurance?: boolean;
  pickupLocation?: string;
  description: string;
  imageUrl?: string;
}

export const equipmentApi = {
  // GET /equipment
  async getEquipmentList(params?: {
    category?: string;
    status?: EquipmentStatus;
    search?: string;
  }): Promise<Equipment[]> {
    try {
      const response = await apiClient.get('/equipment', { params });
      return response.data;
    } catch {
      // Fallback handled by caller/store
      return [];
    }
  },

  // GET /equipment/:id
  async getEquipmentById(id: string): Promise<Equipment | null> {
    try {
      const response = await apiClient.get(`/equipment/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // POST /equipment
  async createEquipment(payload: CreateEquipmentPayload): Promise<Equipment> {
    const response = await apiClient.post('/equipment', payload);
    return response.data;
  },

  // PATCH /equipment/:id/status
  async updateStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
    const response = await apiClient.patch(`/equipment/${id}/status`, { status });
    return response.data;
  },

  // DELETE /equipment/:id
  async deleteEquipment(id: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}`);
  },
};

export default equipmentApi;
import { env } from '@/config/env';
import { mockEquipmentGateway } from '@/services/mock/equipment';
import { api } from '@/store/api';
import type {
  Equipment,
  EquipmentStats,
  EquipmentStatus,
  NewEquipmentInput,
} from '@/types/equipment';
import { http } from './client';
import { toResult } from './helpers';

// One contract, two implementations (mock and HTTP).
export interface EquipmentGateway {
  list(): Promise<Equipment[]>;
  stats(): Promise<EquipmentStats>;
  updateStatus(id: string, status: EquipmentStatus): Promise<Equipment>;
  create(input: NewEquipmentInput): Promise<Equipment>;
  remove(id: string): Promise<void>;
}

const httpEquipmentGateway: EquipmentGateway = {
  list: async () => (await http.get<Equipment[]>('/equipment')).data,
  stats: async () => (await http.get<EquipmentStats>('/equipment/stats')).data,
  updateStatus: async (id, status) =>
    (await http.patch<Equipment>(`/equipment/${id}/status`, { status })).data,
  create: async (input) => (await http.post<Equipment>('/equipment', input)).data,
  remove: async (id) => {
    await http.delete(`/equipment/${id}`);
  },
};

const gateway: EquipmentGateway = env.useMock ? mockEquipmentGateway : httpEquipmentGateway;

export const equipmentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEquipment: build.query<Equipment[], void>({
      queryFn: () => toResult(() => gateway.list()),
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: 'Equipment' as const, id })),
        { type: 'Equipment' as const, id: 'LIST' },
      ],
    }),

    getEquipmentStats: build.query<EquipmentStats, void>({
      queryFn: () => toResult(() => gateway.stats()),
      providesTags: [{ type: 'Equipment', id: 'STATS' }],
    }),

    // Optimistic: the card updates immediately and rolls back if the call fails.
    updateEquipmentStatus: build.mutation<Equipment, { id: string; status: EquipmentStatus }>({
      queryFn: ({ id, status }) => toResult(() => gateway.updateStatus(id, status)),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }): Promise<void> {
        const patch = dispatch(
          equipmentApi.util.updateQueryData('getEquipment', undefined, (draft) => {
            const item = draft.find((e) => e.id === id);
            if (item) {
              item.status = status;
              if (status === 'available') delete item.activeRental;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [{ type: 'Equipment', id: 'STATS' }],
    }),

    addEquipment: build.mutation<Equipment, NewEquipmentInput>({
      queryFn: (input) => toResult(() => gateway.create(input)),
      invalidatesTags: [
        { type: 'Equipment', id: 'LIST' },
        { type: 'Equipment', id: 'STATS' },
      ],
    }),

    removeEquipment: build.mutation<void, string>({
      queryFn: (id) => toResult(() => gateway.remove(id)),
      invalidatesTags: [
        { type: 'Equipment', id: 'LIST' },
        { type: 'Equipment', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetEquipmentQuery,
  useGetEquipmentStatsQuery,
  useUpdateEquipmentStatusMutation,
  useAddEquipmentMutation,
  useRemoveEquipmentMutation,
} = equipmentApi;
