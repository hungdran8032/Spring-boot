"use client"

import { api, API_URL } from './api-service';
import { UserResponse } from './user-service';

export interface Register {
    userName: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface Login {
    userName: string;
    password: string;
}

export interface RefreshToken {
    refreshToken: string;
}

export interface Auth {
    message: string;
    userName: string;
    token: string;
    refreshToken: string;
}

export const authService = {
    register: async (data: Register): Promise<Auth> => {
        const response = await api.post<Auth>('/auth/register', data);
        const authData = response.data;

        // Lưu token và refresh token vào localStorage
        localStorage.setItem("token", authData.token);
        localStorage.setItem("refreshToken", authData.refreshToken);

        return authData;
    },
    login: async (data: Login): Promise<Auth> => {
        const response = await api.post<Auth>('/auth/login', data);
        const authData = response.data;

        // Lưu token và refresh token vào localStorage
        localStorage.setItem("token", authData.token);
        localStorage.setItem("refreshToken", authData.refreshToken);

        return authData;
    },

    refreshToken: async (data: RefreshToken): Promise<Auth> => {
        const response = await api.post<Auth>('/auth/refresh', data);
        const authData = response.data;

        // Lưu lại token và refresh token mới
        localStorage.setItem("token", authData.token);
        localStorage.setItem("refreshToken", authData.refreshToken);

        return authData;
    },

    logout: async (): Promise<{ message: string }> => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            const response = await api.post<{ message: string }>('/auth/logout', { refreshToken });
            // Xóa token và refresh token khỏi localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return response.data;
        }
        return { message: 'Đăng xuất thành công' };
    },

    loginGoogle: () => {
        // Chuyển hướng đến endpoint backend để bắt đầu quá trình đăng nhập Google
        window.location.href = `${API_URL}/auth/google/login`
    },


    //Chỗ này
    resendVerification: async (email: string): Promise<string> => {
        const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
        return response.data.message;
    },

    verifyEmail: async (token: string): Promise<string> => {
        const response = await api.get<{ message: string }>('/auth/verify', {
            params: { token },
        });
        return response.data.message;
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem("refreshToken");
    },

    getToken: (): string | null => {
        return localStorage.getItem("token");
    },

    // getCurrentUser: async (): Promise<Auth> => {
    //     const token = localStorage.getItem("token");
    //     if (!token) throw new Error("No token found");
    //     const response = await api.get<Auth>('/auth/me', {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    //     return response.data;
    // }

     getCurrentUser: async (): Promise<UserResponse> => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await api.get<UserResponse>('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }

    
}