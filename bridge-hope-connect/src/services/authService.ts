import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  role: 'donor' | 'ngo' | 'orphanage';
  name: string;
  email: string;
  password: string;
  description?: string;
  experience?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo' | 'orphanage';
  description?: string;
  experience?: string;
}

export const authService = {
  async login(data: LoginData): Promise<{ token: string; user: User }> {
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  async signup(data: SignupData): Promise<{ token: string; user: User }> {
    try {
      const response = await api.post('/auth/signup', data);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};