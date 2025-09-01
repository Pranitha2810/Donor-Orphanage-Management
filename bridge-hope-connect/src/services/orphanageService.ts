import api from './api';

export interface Orphanage {
  id: string;
  name: string;
  email: string;
  description: string;
}

export interface OrphanageRequestHistory {
  id: string;
  orphanageId: string;
  orphanageName: string;
  ngoId: string;
  ngoName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AcceptedRequest {
  id: string;
  orphanageName: string;
  ngoName: string;
  donorName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  acceptedAt: string;
}

export const orphanageService = {
  async getNGOs(): Promise<any[]> {
    try {
      const response = await api.get('/ngos');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getRequestHistory(orphanageId: string): Promise<OrphanageRequestHistory[]> {
    try {
      const response = await api.get(`/orphanages/${orphanageId}/requests`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getAcceptedRequests(orphanageId: string): Promise<AcceptedRequest[]> {
    try {
      const response = await api.get(`/orphanages/${orphanageId}/accepted-requests`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async createRequest(orphanageId: string, request: {
    ngoId: string;
    ngoName: string;
    type: 'money' | 'item';
    amount?: number;
    itemName?: string;
    count?: number;
  }): Promise<OrphanageRequestHistory> {
    try {
      const response = await api.post(`/orphanages/${orphanageId}/requests`, request);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};