"use client"

import { api } from './api-service';

export interface PostRequest {
  content: string;
}

export interface PostUser {
  name: string
  username: string
  avatar: string
}

export interface Post {
  id: number
  user: PostUser
  content: string
  image: string | null
  images?: string[]
  likesCount: number
  comments: number
  isLiked: boolean;
  createdAt: string
}

export interface PostCardProps {
  post: PostResponse
  onDeletePost?: (postId: number) => void
  onUpdatePost?: (updatedPost: any) => void
}

export interface MediaResponse {
  id: number;
  url: string;
  type: string;
}

export interface PostResponse {
  id: number;
  content: string;
  userName: string;
  userFullName: string;
  userAvatar: string;
  createAt: string;
  updateAt: string;
  media: MediaResponse[];
  isLiked: boolean;
  likesCount: number;
}

export interface PaginatedPosts {
  content: PostResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export const PostService = {
    
    createPost : async (post: PostRequest, files: File[] = []): Promise<PostResponse> => {
        try{
            const formData = new FormData();
            const token = localStorage.getItem("token");
            formData.append("post", JSON.stringify(post));
            files.forEach((file) => formData.append("files", file));
            
            const response = await api.post<PostResponse>("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
        if (error.response?.status === 413) {
            throw new Error("Kích thước file vượt quá giới hạn cho phép (10MB)");
        }
        throw error;
        }
    },

    getPostById : async (id: number): Promise<PostResponse> => {
        const response = await api.get<PostResponse>(`/posts/${id}`);
        return response.data;
    },

    getPostByIdWithLikeStatus : async (id: number): Promise<PostResponse> => {
        const token = localStorage.getItem("token");
        if (token) {
            const response = await api.get<PostResponse>(`/posts/${id}/with-like-status`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } else {
            // Fallback to regular endpoint for non-authenticated users
            return PostService.getPostById(id);
        }
    },

    getAllPosts : async (
        page = 0,
        size = 10,
        sortBy = "createAt",
        direction: "asc" | "desc" = "desc"
        ): Promise<PaginatedPosts> => {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await api.get<PaginatedPosts>("/posts", {
            params: { page, size, sortBy, direction },
            headers,
        });
        return response.data;
    },

    getPostsByUser : async (
        username: string,
        page = 0,
        size = 10,
        sortBy = "createAt",
        direction: "asc" | "desc" = "desc"
        ): Promise<PaginatedPosts> => {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await api.get<PaginatedPosts>(`/posts/user/${username}`, {
            params: { page, size, sortBy, direction },
            headers,
        });
        return response.data;
    },

    updatePost : async (
        id: number,
        post: PostRequest,
        files: File[] = []
        ): Promise<PostResponse> => {
        try {
            const formData = new FormData();
            const token = localStorage.getItem("token");
            
            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            formData.append("post", JSON.stringify(post));
            files.forEach((file) => formData.append("files", file));

            const response = await api.put<PostResponse>(`/posts/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(`Đã cập nhật post thành công với ID: ${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 413) {
                throw new Error("Kích thước file vượt quá giới hạn cho phép (10MB)");
            } else if (error.response?.status === 403) {
                throw new Error("Bạn không có quyền cập nhật bài viết này");
            } else if (error.response?.status === 404) {
                throw new Error("Không tìm thấy bài viết");
            } else if (error.response?.status === 401) {
                throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
            } else if (error.response?.status === 400) {
                throw new Error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại");
            } else {
                console.error("Lỗi khi cập nhật post:", error);
                throw new Error("Có lỗi xảy ra khi cập nhật bài viết");
            }
        }
    },

    deletePost: async (id: number): Promise<void> => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const response = await api.delete(`/posts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Kiểm tra response status
            if (response.status === 204) {
                console.log(`Đã xóa post thành công với ID: ${id}`);
            } else {
                throw new Error(`Lỗi khi xóa post: ${response.status}`);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("Bạn không có quyền xóa bài viết này");
            } else if (error.response?.status === 404) {
                throw new Error("Không tìm thấy bài viết");
            } else if (error.response?.status === 401) {
                throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
            } else {
                console.error("Lỗi khi xóa post:", error);
                throw new Error("Có lỗi xảy ra khi xóa bài viết");
            }
        }
    },
};
