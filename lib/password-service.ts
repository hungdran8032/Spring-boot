"use client"

import { api } from './api-service';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const passwordService = {
  forgotPassword: async (data: ForgotPasswordRequest): Promise<string> => {
    const response = await api.post<{ message: string }>('/password/forgot', data);
    return response.data.message;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<string> => {
    const response = await api.post<{ message: string }>('/password/reset', data);
    return response.data.message;
  },
  validateResetToken: async (token: string): Promise<string> => {
    const response = await api.get<{ message: string }>('/password/validate-token', {
      params: { token },
    });
    return response.data.message;
  },
};