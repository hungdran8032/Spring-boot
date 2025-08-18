"use client"

import { api } from "./api-service"
import { formatTimeAgo } from "./format-time"

export interface CommentData {
  id: number
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  likes: number
  createdAt: string
  replies?: CommentData[]
  replyingTo?: string | null
  deleted?: boolean
  isLiked?: boolean
  isOwner?: boolean
  parentId?: number
}

export interface CommentProps {
  comment: CommentData
  level?: number
  onAddReply?: (reply: CommentData, targetLevel: number) => void
  postId?: number | string
  onCommentCountChange?: (delta: number) => void 
}

export const commentService = {
  async getCommentsByPost(postId: string | number): Promise<CommentData[]> {
    const res = await api.get(`/comments/post/${postId}`)
    const pageData = res.data
    return pageData.content.map(toCommentData)
  },

  async createComment(postId: string | number, content: string, parentId?: string | number): Promise<CommentData> {
    const res = await api.post(`/comments/post/${postId}`, {
      content,
      parentId: parentId ?? null,
    })
    return toCommentData(res.data)
  },

  async deleteComment(commentId: string | number): Promise<void> {
    await api.delete(`/comments/${commentId}`)
  },

  async updateComment(commentId: string | number, content: string): Promise<CommentData> {
    const res = await api.put(`/comments/${commentId}`, { content })
    return toCommentData(res.data)
  },

  async getCommentById(commentId: string | number): Promise<CommentData> {
    const res = await api.get(`/comments/${commentId}`)
    return toCommentData(res.data)
  },
}

function toCommentData(response: any): CommentData {
  const isDeleted = response.deleted === true

  return {
    id: response.id,
    content: isDeleted ? "Bình luận đã bị xoá" : response.content,
    likes: response.likesCount ?? 0,
    createdAt: response.createAt ?? formatTimeAgo(response.createAt),
    replyingTo: response.parentId && !isDeleted ? response.userName : null,
    user: {
      name: isDeleted ? "Người dùng ẩn danh" : (response.userFullName ?? "Không rõ"),
      username: isDeleted ? "unknown" : (response.userName ?? "unknown"),
      avatar: response.userAvatar ?? "/avt.png",
    },
    replies: (response.replies || []).map(toCommentData),
    deleted: isDeleted,
    isLiked: response.isLiked ?? false,
    isOwner: response.isOwner ?? false,
    parentId: response.parentId?? null,
  }
}
