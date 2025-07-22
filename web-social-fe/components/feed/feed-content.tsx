"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"
import PostCard from "@/components/feed/post-card"
import FloatingActionButton from "@/components/floating-action-button"

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    user: {
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just launched my new website! Check it out and let me know what you think. It's been months of hard work and I'm finally ready to share it with the world! 🚀",
    image: "/placeholder.svg?height=400&width=600",
    likes: 24,
    comments: 5,
    createdAt: "2h ago",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Beautiful sunset at the beach today! 🌅 Nature never fails to amaze me. #nature #sunset #beach #photography",
    image: "/placeholder.svg?height=400&width=600",
    likes: 56,
    comments: 8,
    createdAt: "4h ago",
  },
  {
    id: "3",
    user: {
      name: "Alex Johnson",
      username: "alexj",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Working on a new project with the team. Excited to share more details soon! The collaboration has been amazing and we're making great progress. Stay tuned for updates! 💪",
    image: null,
    likes: 18,
    comments: 3,
    createdAt: "6h ago",
  },
  {
    id: "4",
    user: {
      name: "Sarah Wilson",
      username: "sarahw",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Coffee and code - the perfect combination for a productive morning! ☕️ Working on some exciting new features that I can't wait to release.",
    image: "/placeholder.svg?height=400&width=600",
    likes: 32,
    comments: 12,
    createdAt: "8h ago",
  },
]

export default function FeedContent() {
  const [newPostContent, setNewPostContent] = useState("")
  const [posts, setPosts] = useState(mockPosts)

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost = {
      id: `${Date.now()}`,
      user: {
        name: "Current User",
        username: "currentuser",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newPostContent,
      image: null,
      likes: 0,
      comments: 0,
      createdAt: "Just now",
    }

    setPosts([newPost, ...posts])
    setNewPostContent("")
  }

  const handleCreatePostFromModal = (content: string, image: string | null) => {
    const newPost = {
      id: `${Date.now()}`,
      user: {
        name: "Current User",
        username: "currentuser",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content,
      image,
      likes: 0,
      comments: 0,
      createdAt: "Just now",
    }

    setPosts([newPost, ...posts])
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Create Post Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="resize-none border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground"
                rows={3}
              />
              <div className="flex justify-between items-center pt-2 border-t">
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Posts Feed */}
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating Action Button */}
      <FloatingActionButton onCreatePost={handleCreatePostFromModal} />
    </div>
  )
}
