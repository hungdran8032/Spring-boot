"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Comment from "@/components/feed/comment"

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
    likes: number
    comments: number
    createdAt: string
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
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
    // In a real app, you would implement sharing functionality
    console.log("Sharing post:", post.id)
  }

  return (
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <p className="whitespace-pre-wrap mb-3">{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden mt-3">
            <img src={post.image || "/placeholder.svg"} alt="Post image" className="w-full h-auto object-cover" />
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
              {/* Add comment input */}
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

              {/* Comments list */}
              <div className="space-y-1">
                {comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  )
}
