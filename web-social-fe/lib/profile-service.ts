import { api } from './api-service'

export interface UserProfile {
  userName: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  avatar?: string
  gender?: string
  birthDay?: string
  enabled: boolean
  isVerified: boolean
  roles: string[]
  // Profile fields
  bio?: string
  banner?: string
  website?: string
  location?: string
  joinedDate?: string
  followersCount?: number
  followingCount?: number
  postsCount?: number
}

export const profileService = {
  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await api.get(`/users/profile/${username}`)
    return response.data
  },

  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get('/users/my-profile')
    return response.data
  },

  async getUserPosts(username: string, page = 0, size = 10) {
    try {
      const response = await api.get(`/posts/user/${username}?page=${page}&size=${size}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch user posts:', error)
      // Return empty result if user has no posts or error occurs
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        last: true,
        first: true
      }
    }
  },

  async followUser(username: string) {
    const response = await api.post(`/users/${username}/follow`)
    return response.data
  },

  async unfollowUser(username: string) {
    const response = await api.delete(`/users/${username}/follow`)
    return response.data
  }
}


