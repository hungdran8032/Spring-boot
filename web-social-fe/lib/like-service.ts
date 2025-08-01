import { api } from './api-service'

export interface LikeResponse {
  liked: boolean
  likesCount: number
}

export const LikeService = {
   toggleLikePost: async (postId: number): Promise<LikeResponse> => {
    const token = localStorage.getItem("token");
    const response = await api.post<LikeResponse>(
      `/likes/post/${postId}`, 
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  toggleLikeComment: async (commentId: number): Promise<LikeResponse> => {
    const response = await api.post(`/likes/comment/${commentId}`)
    return response.data
  },

  checkPostLiked: async (postId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`/likes/post/${postId}/status`)
    return response.data
  },
}