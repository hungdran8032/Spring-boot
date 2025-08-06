
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Trash, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { LikeService } from "@/lib/like-service"
import { type CommentData, type CommentProps, commentService } from "@/lib/comment-service"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export default function Comment({
  comment,
  level = 0,
  onAddReply,
  postId,
  onCommentCountChange,
}: CommentProps & { postId?: number | string }) {
  const [liked, setLiked] = useState(comment.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState<CommentData[]>([])
  const [isLiking, setIsLiking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const { user } = useAuth()

  // Tải replies từ backend nếu có parentId
  useEffect(() => {
    if (comment.replies && comment.replies.length > 0) {
      setReplies(comment.replies)
    }
  }, [comment.replies, comment.id, level])

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
          setReplies([...replies, newReply])
        }

        // QUAN TRỌNG: Thông báo cho PostCard gốc để cập nhật tổng số bình luận
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
      // Thêm vào replies của level hiện tại
      setReplies([...replies, reply])
    } else if (onAddReply) {
      // Chuyển lên parent
      onAddReply(reply, targetLevel)
    }
  }

  const handleDelete = async () => {
    if (!comment.isOwner) return

    try {
      await commentService.deleteComment(comment.id)
      // Đánh dấu comment đã xóa thay vì xóa khỏi UI
      comment.deleted = true
      comment.content = "Bình luận đã bị xóa"

      // Thông báo cho parent để giảm tổng số bình luận
      if (onCommentCountChange) {
        onCommentCountChange(-1)
      }

      toast({
        title: "Thành công",
        description: "Đã xóa bình luận",
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
    if (!comment.isOwner || !editText.trim()) return

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: vi })
    } catch (error) {
      return dateString
    }
  }

  const maxLevel = 3// Giới hạn độ sâu của nested comments

  return (
    <div className={`${level > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} alt={comment.user?.name} />
          {/* <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback> */}
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
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
                {level >= 2 && <span className="ml-1 text-xs text-blue-600">Thread</span>}
              </Button>
            )}

            {comment.isOwner && !comment.deleted && (
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
                    src={user?.avatar || "/placeholder.svg?height=24&width=24"}
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

          {/* {replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  onAddReply={handleNestedReply}
                  postId={postId}
                  onCommentCountChange={onCommentCountChange} // Truyền prop xuống
                />
              ))}
            </div>
          )} */}
          {replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  level={level} 
                  onAddReply={handleNestedReply}
                  postId={postId}
                  onCommentCountChange={onCommentCountChange}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
