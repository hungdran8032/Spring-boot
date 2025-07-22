"use client"

import { api } from './api-service';

export interface PostRequest {
  content: string;
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
        const formData = new FormData();
        formData.append("post", JSON.stringify(post));
        files.forEach((file) => formData.append("files", file));
        
        const response = await api.post<PostResponse>("/posts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    getPostById : async (id: number): Promise<PostResponse> => {
        const response = await api.get<PostResponse>(`/posts/${id}`);
        return response.data;
    },

    getAllPosts : async (
        page = 0,
        size = 10,
        sortBy = "createAt",
        direction: "asc" | "desc" = "desc"
        ): Promise<PaginatedPosts> => {
        const response = await api.get<PaginatedPosts>("/posts", {
            params: { page, size, sortBy, direction },
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
        const response = await api.get<PaginatedPosts>(`/posts/user/${username}`, {
            params: { page, size, sortBy, direction },
        });
        return response.data;
    },

    updatePost : async (
        id: number,
        post: PostRequest,
        files: File[] = []
        ): Promise<PostResponse> => {
        const formData = new FormData();
        formData.append("post", JSON.stringify(post));
        files.forEach((file) => formData.append("files", file));

        const response = await api.put<PostResponse>(`/posts/${id}`, formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    deletePost : async (id: number): Promise<void> => {
        await api.delete(`/posts/${id}`);
    }
};