import { api } from './api-service'
import { UserResponse } from './user-service'



export interface ProfileResponse {
  bio?: string
  banner?: string
  website?: string
  location?: string
  followersCount?: number
  followingCount?: number
  postsCount?: number
  user?: UserResponse
}

export interface UpdateProfileRequest {
  bio?: string
  banner?: File | string
  website?: string
  location?: string
}

export const profileService = {

  getProfile: async (): Promise<ProfileResponse> => {
    const token = localStorage.getItem("token");
    const res = await api.get("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data
  },
 getProfileByUsername: async (username: string): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>(`/profile/${username}`)
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest | FormData): Promise<ProfileResponse> => {
    const token = localStorage.getItem("token");

    const res = await api.put('/profile/update', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(data instanceof FormData && { 'Content-Type': 'multipart/form-data' }),
      },
    })
    return res.data
  },


  //chưa xài tới
   followUser: async (username: string) => {
    const res = await api.post(`/follow/${username}`)
    return res.data
  },

  unfollowUser: async (username: string) => {
    const res = await api.delete(`/follow/${username}`)
    return res.data
  },
}



