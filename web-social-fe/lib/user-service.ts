import { api } from "./api-service";

export interface UserResponse {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  avatar: string;
  role: string;
  gender: string;
  birthDay: string;
  enabled: boolean;
  verified: boolean;
  roles: string[];
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  avatar?: File | string 
  gender?: string
  birthDay?: string
}


export const UserService = {
  getUserByUserName: async (userName: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userName}`);
    return response.data;
  },

  getUserByEmail: async (email: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/email/${email}`);
    return response.data;
  },

  getById: async (id: number): Promise<UserResponse> => {
    const res = await api.get(`/users/${id}`)
    return res.data
  },

  getMyProfile: async (): Promise<UserResponse> => {
    const res = await api.get(`/users/my-profile`)
    return res.data
  },

  updateProfile: async (data: UpdateUserRequest | FormData): Promise<UserResponse> => {
      const token = localStorage.getItem("token")
      const res = await api.put(`/users/update-profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(data instanceof FormData && { "Content-Type": "multipart/form-data" }),
        },
      })
      return res.data
    },
  
};