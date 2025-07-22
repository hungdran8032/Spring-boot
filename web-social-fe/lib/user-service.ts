import { api } from "./api-service";

// types/user.ts
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
  isVerified: boolean;
  roles: string[];
}

export const UserService = {
  getUserByUserName: async (userName: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userName}`);
    return response.data;
  },
  
};