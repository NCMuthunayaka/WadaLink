import apiClient from './client';
import type { ReservationRequest, ReservationStatus } from '../../types/equipment';

export interface CreateReservationPayload {
  equipmentId: string;
  pickupDate: string;
  returnDate: string;
  durationDays: number;
  fulfillmentMode: 'smart_lockbox' | 'courier';
  declaredApplication?: string;
}

export const reservationsApi = {
  // GET /reservations
  async getReservations(): Promise<ReservationRequest[]> {
    try {
      const response = await apiClient.get('/equipment-reservations');
      return response.data;
    } catch {
      return [];
    }
  },

  // GET /reservations/:id
  async getReservationById(id: string): Promise<ReservationRequest | null> {
    try {
      const response = await apiClient.get(`/equipment-reservations/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // POST /reservations
  async createReservation(payload: CreateReservationPayload): Promise<ReservationRequest> {
    const response = await apiClient.post('/equipment-reservations', payload);
    return response.data;
  },

  // POST /reservations/:id/approve
  async approveReservation(id: string): Promise<{ status: ReservationStatus; lockboxPin: string }> {
    const response = await apiClient.post(`/equipment-reservations/${id}/approve`);
    return response.data;
  },

  // POST /reservations/:id/reject
  async rejectReservation(id: string, reason?: string): Promise<{ status: ReservationStatus }> {
    const response = await apiClient.post(`/equipment-reservations/${id}/reject`, { reason });
    return response.data;
  },

  // POST /reservations/:id/check-in
  async checkInReservation(
    id: string,
    options: { conditionMet: boolean; releaseDeposit: boolean; notes?: string }
  ): Promise<{ success: boolean; depositRefunded: number }> {
    const response = await apiClient.post(`/equipment-reservations/${id}/check-in`, options);
    return response.data;
  },
};

export default reservationsApi;
