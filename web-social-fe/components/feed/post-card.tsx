"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Comment from "@/components/feed/comment"
import { useAuth } from "@/contexts/AuthContext"
import { PostService } from "@/lib/post-service"
import { useToast } from "@/hooks/use-toast"
import EditPostModal from "@/components/feed/edit-post-modal"
import ConfirmDialog from "@/components/ui/confirm-dialog"

interface PostCardProps {
  post: {
    id: string
    user: {
      name: string
      username: string
      avatar: string
    }
    content: string
    image: string | null
    images?: string[]
    likes: number
    comments: number
    createdAt: string
  }
  onDeletePost?: (postId: number) => void
  onUpdatePost?: (updatedPost: any) => void
}

export default function PostCard({ post, onDeletePost, onUpdatePost }: PostCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [comments, setComments] = useState([
    {
      id: "1",
      user: {
        name: "Jane Smith",
        username: "janesmith",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "Great post! Thanks for sharing this.",
      likes: 3,
      createdAt: "2h ago",
      replies: [
        {
          id: "1-1",
          user: {
            name: "John Doe",
            username: "johndoe",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          content: "I totally agree with you!",
          likes: 1,
          createdAt: "1h ago",
          replies: [],
        },
      ],
    },
    {
      id: "2",
      user: {
        name: "Mike Johnson",
        username: "mikej",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      content: "This is exactly what I was looking for. Thank you!",
      likes: 5,
      createdAt: "3h ago",
      replies: [],
    },
  ])
  const [postData, setPostData] = useState(post)

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1)
    } else {
      setLikesCount(likesCount + 1)
    }
    setLiked(!liked)
  }

  const handleComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: `${Date.now()}`,
        user: {
          name: "Current User",
          username: "currentuser",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: commentText,
        likes: 0,
        createdAt: "Just now",
        replies: [],
      }

      setComments([newComment, ...comments])
      setCommentText("")
    }
  }

  const handleShare = () => {
    console.log("Sharing post:", post.id)
  }

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
  }

  const nextImage = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
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
        description: "Post deleted successfully!"
      })
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete post"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditPost = () => {
    setShowEditModal(true)
  }

  const handleUpdatePost = (updatedPost: any) => {
    // Cập nhật local state
    setPostData({
      ...postData,
      content: updatedPost.content,
      images: updatedPost.media?.map((m: any) => m.url) || []
    })
    
    // Gọi callback từ parent component
    onUpdatePost?.(updatedPost)
  }

  const isOwner = user?.userName === post.user.username

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{post.user.username} · {post.createdAt}
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
                <DropdownMenuItem>Save post</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Hide</DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEditPost}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <p className="whitespace-pre-wrap mb-3">{postData.content}</p>
          {postData.images && postData.images.length > 0 && (
            <div className="rounded-md overflow-hidden mt-3">
              {postData.images.length === 1 ? (
                <img 
                  src={postData.images[0]} 
                  alt="Post image" 
                  className="w-full h-auto object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={() => openImageModal(0)}
                />
              ) : (
                <div className={`grid gap-1 ${
                  postData.images.length === 2 ? 'grid-cols-2' : 
                  postData.images.length === 3 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {postData.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Post image ${index + 1}`} 
                        className={`w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                          postData.images && postData.images.length === 3 && index === 0 ? 'row-span-2 h-full' : ''
                        }`}
                        onClick={() => openImageModal(index)}
                      />
                      {index === 3 && postData.images && postData.images.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                             onClick={() => openImageModal(index)}>
                          <span className="text-white font-semibold text-lg">
                            +{postData.images.length - 4}
                          </span>
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

            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mt-4 pt-4 border-t"
              >
                <div className="flex gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>CU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    />
                    <Button size="sm" onClick={handleComment}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  {comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>

        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogTitle className="sr-only">
              Post image {currentImageIndex + 1} of {post.images?.length || 1}
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
              
              {post.images && post.images.length > 1 && (
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
                    disabled={!post.images || currentImageIndex === post.images.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {post.images && (
                <img
                  src={post.images[currentImageIndex]}
                  alt={`Post image ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              )}
              
              {post.images && post.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {post.images.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={{
          id: postData.id,
          content: postData.content,
          images: postData.images
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




