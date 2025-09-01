import api from './api';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  ngoId: string;
  ngoName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  status: 'pending' | 'distributed';
  orphanageName?: string;
  createdAt: string;
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  description: string;
  experience: string;
}

export const donationService = {
  async getNGOs(): Promise<NGO[]> {
    try {
      const response = await api.get('/ngos');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getDonations(donorId: string): Promise<Donation[]> {
    try {
      const response = await api.get(`/donors/${donorId}/donations`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async createDonation(donation: Omit<Donation, 'id' | 'status' | 'createdAt'>): Promise<Donation> {
    try {
      const response = await api.post('/donations', donation);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};