"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal, X, ChevronLeft, ChevronRight, Trash2, Edit, EyeOff, AlertTriangle, Bookmark } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { type PostCardProps, PostService } from "@/lib/post-service"
import { useToast } from "@/hooks/use-toast"
import EditPostModal from "@/components/feed/edit-post-modal"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import Link from "next/link"
import { LikeService } from "@/lib/like-service"
import { type CommentData, commentService } from "@/lib/comment-service"
import PostCommentModal from "@/components/feed/post-comment-modal"

export default function PostCard({ post, onDeletePost, onUpdatePost }: PostCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [liked, setLiked] = useState<boolean>(post.isLiked || false)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [comments, setComments] = useState<CommentData[]>([])
  const [postData, setPostData] = useState({
    ...post,
    media: post.media || [],
  })
  const [isLiking, setIsLiking] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)

  // Create stable dependencies for useEffect
  const postDependencies = useMemo(
    () => ({
      isLiked: post.isLiked,
      likesCount: post.likesCount || 0,
      media: post.media || [],
    }),
    [post.isLiked, post.likesCount, post.media],
  )

  useEffect(() => {
    setLiked(postDependencies.isLiked)
    setLikesCount(postDependencies.likesCount)
    setPostData({
      ...post,
      media: postDependencies.media,
    })
  }, [postDependencies, post])

  // Load comments when showing comments section - ALWAYS load fresh data
  useEffect(() => {
    if (showComments) {
      loadComments()
    } else {
      // Reset comments when modal is closed
      setComments([])
      setCommentText("")
    }
  }, [showComments])

  const loadComments = async () => {
    if (isLoadingComments) return
    setIsLoadingComments(true)
    try {
      const commentsData = await commentService.getCommentsByPost(post.id)
      setComments(commentsData)
    } catch (error) {
      console.error("Không thể tải bình luận:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải bình luận",
      })
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
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
    } finally {
      setIsLiking(false)
    }
  }

  const handleTotalCommentCountChange = (delta: number) => {
    setCommentsCount((prev) => prev + delta)
  }

  const handleShare = () => {
    console.log("Sharing post:", post.id)
  }

  const openImageModal = (index: number) => {
    if (post.media && post.media.length > index) {
      setCurrentImageIndex(index)
      setShowImageModal(true)
    }
  }

  const nextImage = () => {
    if (post.media && post.media.length > 0 && currentImageIndex < post.media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleDeletePost = async () => {
    setIsDeleting(true)
    try {
      await PostService.deletePost(Number(post.id))
      onDeletePost?.(Number(post.id))
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      })
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete post",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditPost = () => {
    setShowEditModal(true)
  }

  const handleUpdatePost = (updatedPost: any) => {
    setPostData({
      ...postData,
      content: updatedPost.content,
      media: updatedPost.media || [],
    })
    onUpdatePost?.(updatedPost)
  }

  // Handle closing comments modal
  

  const isOwner = user?.userName === post.userName

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Lưu
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Báo cáo
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ẩn
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleEditPost}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xoá
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <p className="whitespace-pre-wrap mb-3">{postData.content}</p>
          {postData.media && postData.media.length > 0 && (
            <div className="rounded-md overflow-hidden mt-3">
              {postData.media.length === 1 ? (
                <img
                  src={postData.media[0]?.url || "/placeholder.svg"}
                  alt="Post image"
                  className="w-full h-auto object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageModal(0)}
                />
              ) : (
                <div
                  className={`grid gap-1 ${
                    postData.media.length === 2
                      ? "grid-cols-2"
                      : postData.media.length === 3
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  }`}
                >
                  {postData.media.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image?.url || "/placeholder.svg"}
                        alt={`Post image ${index + 1}`}
                        className={`w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                          postData.media && postData.media.length === 3 && index === 0 ? "row-span-2 h-full" : ""
                        }`}
                        onClick={() => openImageModal(index)}
                      />
                      {index === 3 && postData.media && postData.media.length > 4 && (
                        <div
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                          onClick={() => openImageModal(index)}
                        >
                          <span className="text-white font-semibold text-lg">+{postData.media.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col">
          <div className="flex items-center justify-between w-full border-t pt-3">
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleLike}>
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(true)}>
              <MessageCircle className="h-5 w-5" />
              <span>{commentsCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              <span>Chia sẻ</span>
            </Button>
          </div>
        </CardFooter>

        <PostCommentModal
          post={post}
          showComments={showComments}
          setShowComments={setShowComments}
          comments={comments}
          setComments={setComments}
          commentText={commentText}
          setCommentText={setCommentText}
          commentsCount={commentsCount}
          setCommentsCount={setCommentsCount}
          likesCount={likesCount}
          setLikesCount={setLikesCount}
          liked={liked}
          setLiked={setLiked}
          isLoadingComments={isLoadingComments}
          setIsLoadingComments={setIsLoadingComments}
          isSubmittingComment={isSubmittingComment}
          setIsSubmittingComment={setIsSubmittingComment}
          handleTotalCommentCountChange={handleTotalCommentCountChange}
          onRefreshComments={loadComments}
        />
      </Card>

      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">
            Post image {currentImageIndex + 1} of {post.media?.length || 1}
          </DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {post.media && post.media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                  disabled={!post.media || currentImageIndex === post.media.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            {post.media && (
              <img
                src={post.media[currentImageIndex]?.url || "/placeholder.svg"}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            )}
            {post.media && post.media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {post.media.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={{
          id: postData.id.toString(),
          content: postData.content,
          images: postData.media?.map((m) => m.url) || [],
        }}
        onUpdatePost={handleUpdatePost}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}
