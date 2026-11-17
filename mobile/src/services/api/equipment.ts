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
