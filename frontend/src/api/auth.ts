import { apiClient } from './client';
import { UserProfile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (password: string, token: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password, token }),
    });
  },

  getProfile: async (): Promise<UserProfile> => {
    return apiClient<UserProfile>('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiClient<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
