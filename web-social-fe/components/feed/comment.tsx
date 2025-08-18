"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Trash, Edit } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { LikeService } from "@/lib/like-service"
import { type CommentData, type CommentProps, commentService } from "@/lib/comment-service"
import { useAuth } from "@/contexts/AuthContext"
import { formatTimeAgo } from "@/lib/format-time"

export default function Comment({
  comment,
  level = 0,
  onAddReply,
  postId,
  onCommentCountChange,
  onDelete,
}: CommentProps & { postId?: number | string ,onDelete?: (id: number | string) => void}) {
  const [liked, setLiked] = useState(comment.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<CommentData[]>(comment.replies || [])
  const [isLiking, setIsLiking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const { user } = useAuth()
  const isOwnerr = user?.userName === comment.user.username 
  const maxLevel = 3

  useEffect(() => {
    setReplies(comment.replies || [])
  }, [comment.replies])

  const handleLike = async () => {
    if (isLiking || !user) return
    setIsLiking(true)
    try {
      const response = await LikeService.toggleLikeComment(Number(comment.id))
      setLiked(response.liked)
      setLikesCount(response.likesCount)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bình luận",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleReply = async () => {
    if (replyText.trim() && postId && user) {
      setIsLoading(true)
      try {
        const newReply = await commentService.createComment(postId, replyText, comment.id)
        
        if (level >= 2 && onAddReply) {
          onAddReply(newReply, 1)
        } else {
          setReplies(prevReplies => [...prevReplies, newReply])
        }
        
        setShowReplies(true)
        
        if (onCommentCountChange) {
          onCommentCountChange(1)
        }
        setReplyText("")
        setShowReplyInput(false)
        toast({
          title: "Thành công",
          description: "Đã gửi bình luận",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể gửi bình luận",
        })
      } finally {
        setIsLoading(false)
      }
    } else if (!user) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để bình luận",
      })
    }
  }

  const handleNestedReply = (reply: CommentData, targetLevel: number) => {
    if (targetLevel === 1) {
      setReplies(prevReplies => [...prevReplies, reply])
      setShowReplies(true)
    } else if (onAddReply) {
      onAddReply(reply, targetLevel)
    }
  }

  const countAllReplies = (comments: CommentData[]): number => {
    return comments.reduce((acc, c) => {
      return acc + 1 + (c.replies ? countAllReplies(c.replies) : 0)
    }, 0)
  }
  const countCommentTree = (c: CommentData): number => {
    let count = c.deleted ? 0 : 1
    if (c.replies && c.replies.length > 0) {
      for (const reply of c.replies) {
        count += countCommentTree(reply)
      }
    }
    return count
  }
  const handleDelete = async () => {
    if (!isOwnerr) return
    try {
      await commentService.deleteComment(comment.id)
      const deletedCount = countCommentTree(comment)
      console.log(deletedCount)
      if (onCommentCountChange) {
        onCommentCountChange(-deletedCount)
      }
      
      if (onDelete) {
          onDelete(comment.id)
      }
      toast({
        title: "Thành công",
        description: "Đã xóa bình luận",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa bình luận",
      })
    }
  }

  const handleEdit = async () => {
    if (!isOwnerr || !editText.trim()) return
    try {
      const updatedComment = await commentService.updateComment(comment.id, editText)
      comment.content = updatedComment.content
      setIsEditing(false)
      toast({
        title: "Thành công",
        description: "Đã cập nhật bình luận",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật bình luận",
      })
    }
  }
  return (
    <div className={`${level > 0 ? "ml-8 mt-3 " : "mt-4"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatar || "/avt.png"} alt={comment.user?.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            {isEditing ? (
              <div className="mt-2 flex gap-2">
                <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8 text-sm" />
                <Button size="sm" onClick={handleEdit} className="h-8">
                  Lưu
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-8">
                  Hủy
                </Button>
              </div>
            ) : (
              <p className="text-sm">
                {comment.replyingTo && <span className="text-blue-600 mr-1">@{comment.replyingTo}</span>}
                {comment.content}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={handleLike} disabled={!user}>
              <Heart className={`h-3 w-3 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likesCount > 0 && likesCount}
            </Button>
            {level < maxLevel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setShowReplyInput(!showReplyInput)}
                disabled={!user}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Trả lời
              </Button>
            )}
            {isOwnerr && !comment.deleted && (
              <>
                <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={() => setIsEditing(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Sửa
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-red-500" onClick={handleDelete}>
                  <Trash className="h-3 w-3 mr-1" />
                  Xóa
                </Button>
              </>
            )}
          </div>
          
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user?.avatar || "/avt.png?height=24&width=24"}
                    alt={user?.firstName || "U"}
                  />
                  <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={
                      level >= 2 ? `Trả lời @${comment.user.username} (sẽ thread lại)...` : "Viết trả lời..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="h-8 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    disabled={isLoading}
                  />
                  <Button size="sm" onClick={handleReply} className="h-8 w-8 p-0" disabled={isLoading}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show/Hide replies logic */}
          {replies.length > 0 && !showReplies && (
            <button
              className="text-xs text-blue-600 mt-2 hover:underline"
              onClick={() => setShowReplies(true)}
            >
              Xem thêm {countAllReplies(replies)} phản hồi
            </button>
          )}

          {replies.length > 0 && showReplies && (
            <>
              <button
                className="text-xs text-gray-500 mt-2 hover:underline"
                onClick={() => setShowReplies(false)}
              >
                Ẩn phản hồi
              </button>
              <div className="mt-2 pl-4">
                {replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    level={level + 1}
                    onAddReply={handleNestedReply}
                    postId={postId}
                    onCommentCountChange={onCommentCountChange}
                    onDelete={(id) => {
                      // remove reply khỏi list tại cha
                      setReplies((prev) => prev.filter((r) => r.id !== id))
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
