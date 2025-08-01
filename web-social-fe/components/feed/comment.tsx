"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { LikeService } from "@/lib/like-service"

export interface CommentData {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  likes: number
  createdAt: string
  replies?: CommentData[]
  replyingTo?: string // Username being replied to
}

interface CommentProps {
  comment: CommentData
  level?: number
  onAddReply?: (reply: CommentData, targetLevel: number) => void
}

export default function Comment({ comment, level = 0, onAddReply }: CommentProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replies, setReplies] = useState(comment.replies || [])
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    try {
      const response = await LikeService.toggleLikeComment(Number(comment.id))
      setLiked(response.liked)
      setLikesCount(response.likesCount)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bình luận"
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleReply = () => {
    if (replyText.trim()) {
      const newReply: CommentData = {
        id: `${Date.now()}`,
        user: {
          name: "Current User",
          username: "currentuser",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: replyText,
        likes: 0,
        createdAt: "Just now",
        replies: [],
        replyingTo: comment.user.username,
      }

      // If we're at level 2 or higher, thread back to level 1
      if (level >= 2 && onAddReply) {
        onAddReply(newReply, 1)
      } else {
        // Normal nesting for level 0 and 1
        setReplies([...replies, newReply])
      }

      setReplyText("")
      setShowReplyInput(false)
    }
  }

  const handleNestedReply = (reply: CommentData, targetLevel: number) => {
    if (targetLevel === 1) {
      // Add to current level's replies
      setReplies([...replies, reply])
    } else if (onAddReply) {
      // Pass up to parent
      onAddReply(reply, targetLevel)
    }
  }

  const maxLevel = 3 // Maximum nesting level

  return (
    <div className={`${level > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
            </div>
            <p className="text-sm">
              {comment.replyingTo && <span className="text-blue-600 mr-1">@{comment.replyingTo}</span>}
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={handleLike}>
              <Heart className={`h-3 w-3 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likesCount > 0 && likesCount}
            </Button>
            {level < maxLevel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Trả lời
                {level >= 2 && <span className="ml-1 text-xs text-blue-600">Thread</span>}
              </Button>
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
                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={
                      level >= 2 ? `Reply to @${comment.user.username} (will thread back)...` : "Write a reply..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="h-8 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                  />
                  <Button size="sm" onClick={handleReply} className="h-8 w-8 p-0">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply) => (
                <Comment key={reply.id} comment={reply} level={level + 1} onAddReply={handleNestedReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

