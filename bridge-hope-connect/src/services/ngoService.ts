import api from './api';

export interface OrphanageRequest {
  id: string;
  orphanageId: string;
  orphanageName: string;
  ngoId: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  createdAt: string;
}

export interface MatchedDonation {
  id: string;
  donationId: string;
  donorName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  matchedOrphanages: string[];
}

export interface DistributionRecord {
  id: string;
  donorName: string;
  orphanageName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  status: 'accepted' | 'rejected';
  distributedAt: string;
}

export const ngoService = {
  async getRequests(ngoId: string): Promise<OrphanageRequest[]> {
    try {
      const response = await api.get(`/ngos/${ngoId}/requests`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getDonations(ngoId: string): Promise<MatchedDonation[]> {
    try {
      const response = await api.get(`/ngos/${ngoId}/donations`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getDistributionHistory(ngoId: string): Promise<DistributionRecord[]> {
    try {
      const response = await api.get(`/ngos/${ngoId}/distribution-history`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async distributeDonation(ngoId: string, donationId: string, orphanageName: string, action: 'accept' | 'reject'): Promise<void> {
    try {
      await api.post(`/ngos/${ngoId}/distribute`, { donationId, orphanageName, action });
    } catch (error) {
      throw error;
    }
  },
};