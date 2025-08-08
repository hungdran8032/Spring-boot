"use client"

import { useState, Dispatch, SetStateAction } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, Heart, Share2, Send } from 'lucide-react'
import Link from "next/link"
import Comment from "@/components/feed/comment"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { type PostCardProps } from "@/lib/post-service"
import { type CommentData, commentService } from "@/lib/comment-service"
import { LikeService } from "@/lib/like-service"

interface PostCommentModalProps {
  post: PostCardProps["post"]
  showComments: boolean
  setShowComments: (open: boolean) => void
  comments: CommentData[]
  setComments: Dispatch<SetStateAction<CommentData[]>>
  commentText: string
  setCommentText: Dispatch<SetStateAction<string>>
  commentsCount: number
  setCommentsCount: Dispatch<SetStateAction<number>>
  likesCount: number
  setLikesCount: Dispatch<SetStateAction<number>>
  liked: boolean
  setLiked: Dispatch<SetStateAction<boolean>>
  isLoadingComments: boolean
  setIsLoadingComments: Dispatch<SetStateAction<boolean>>
  isSubmittingComment: boolean
  setIsSubmittingComment: Dispatch<SetStateAction<boolean>>
  handleTotalCommentCountChange: (delta: number) => void
  onRefreshComments?: () => void
}

export default function PostCommentModal({
  post,
  showComments,
  setShowComments,
  comments,
  setComments,
  commentText,
  setCommentText,
  commentsCount,
  setCommentsCount,
  likesCount,
  setLikesCount,
  liked,
  setLiked,
  isLoadingComments,
  setIsLoadingComments,
  isSubmittingComment,
  setIsSubmittingComment,
  handleTotalCommentCountChange,
  onRefreshComments,
}: PostCommentModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleComment = async () => {
    if (commentText.trim() && !isSubmittingComment && user) {
      setIsSubmittingComment(true)
      try {
        const newComment = await commentService.createComment(post.id, commentText)
        setComments([newComment, ...comments])
        setCommentText("")
        setCommentsCount((prev) => prev + 1)
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
        setIsSubmittingComment(false)
      }
    } else if (!user) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để bình luận",
      })
    }
  }

  const handleLike = async () => {
    try {
      const response = await LikeService.toggleLikePost(post.id)
      setLiked(response.liked)
      setLikesCount(response.likesCount)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bài viết",
      })
    }
  }

  const handleShare = () => {
    console.log("Sharing post:", post.id)
  }

  const openImageModal = (index: number) => {
    if (post.media && post.media.length > index) {
      setCurrentImageIndex(index)
      // Note: You may need to handle image modal logic separately if needed
    }
  }

  // Handle comment updates WITHOUT refreshing from server
  const handleCommentUpdate = (delta: number) => {
    handleTotalCommentCountChange(delta)
    // Remove the automatic refresh to prevent losing local state
    // if (onRefreshComments) {
    //   onRefreshComments()
    // }
  }

  return (
    <Dialog open={showComments} onOpenChange={setShowComments}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-auto p-10">
        <DialogTitle className="sr-only">Bình luận</DialogTitle>
        <div className="grid grid-cols-2 gap-0">
          {/* Cột trái: Bài viết */}
          <div className="border-r p-4">
            <div className="flex items-center mb-4">
              <Link href={`/${post.userName}`}>
                <Avatar>
                  <AvatarImage src={post.userAvatar || "/placeholder.svg"} alt={post.userFullName} />
                  <AvatarFallback>{post.userFullName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/${post.userName}`}>
                  <p className="font-medium hover:underline cursor-pointer">{post.userFullName}</p>
                </Link>
                <p className="text-sm text-muted-foreground">
                  <Link href={`/${post.userName}`} className="hover:underline">
                    @{post.userName}
                  </Link>{" "}
                  · {new Date(post.createAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-wrap mb-3">{post.content}</p>
            {post.media && post.media.length > 0 && (
              <div className="rounded-md overflow-hidden mt-3">
                {post.media.length === 1 ? (
                  <img
                    src={post.media[0]?.url || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full h-auto object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(0)}
                  />
                ) : (
                  <div
                    className={`grid gap-1 ${
                      post.media.length === 2
                        ? "grid-cols-2"
                        : post.media.length === 3
                        ? "grid-cols-2"
                        : "grid-cols-2"
                    }`}
                  >
                    {post.media.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image?.url || "/placeholder.svg"}
                          alt={`Post image ${index + 1}`}
                          className={`w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                            post.media && post.media.length === 3 && index === 0 ? "row-span-2 h-full" : ""
                          }`}
                          onClick={() => openImageModal(index)}
                        />
                        {index === 3 && post.media && post.media.length > 4 && (
                          <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                            onClick={() => openImageModal(index)}
                          >
                            <span className="text-white font-semibold text-lg">+{post.media.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between w-full border-t pt-3">
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleLike}>
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{commentsCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
                <span>Chia sẻ</span>
              </Button>
            </div>
          </div>
          
          {/* Cột phải: Danh sách bình luận */}
          <div className="flex flex-col p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Viết bình luận..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                  disabled={isSubmittingComment || !user}
                />
                <Button size="sm" onClick={handleComment} disabled={!commentText.trim() || isSubmittingComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isLoadingComments ? (
              <p className="text-muted-foreground">Đang tải bình luận...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onCommentCountChange={handleCommentUpdate}
                />
              ))
            ) : (
              <p className="text-muted-foreground">Chưa có bình luận nào</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
