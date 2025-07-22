"use client"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/feed/post-card"

interface ProfileTabsProps {
  username: string
}

export default function ProfileTabs({ username }: ProfileTabsProps) {
  // Mock data for posts
  const posts = [
    {
      id: "1",
      user: {
        name: "John Doe",
        username: username,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Just launched my new website! Check it out and let me know what you think.",
      image: "/placeholder.svg?height=400&width=600",
      likes: 24,
      comments: 5,
      createdAt: "2h ago",
    },
    {
      id: "2",
      user: {
        name: "John Doe",
        username: username,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Working on a new project with the team. Exciting times ahead!",
      image: null,
      likes: 18,
      comments: 3,
      createdAt: "6h ago",
    },
  ]

  // Mock data for media
  const media = [
    {
      id: "1",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "2",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "3",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "4",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  // Mock data for likes
  const likes = [
    {
      id: "1",
      user: {
        name: "Jane Smith",
        username: "janesmith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Beautiful sunset at the beach today! 🌅 #nature #sunset #beach",
      image: "/placeholder.svg?height=400&width=600",
      likes: 56,
      comments: 8,
      createdAt: "4h ago",
    },
  ]

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="space-y-6">
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
      </TabsContent>
      <TabsContent value="media">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="aspect-square rounded-md overflow-hidden"
            >
              <img src={item.image || "/placeholder.svg"} alt="Media" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="likes" className="space-y-6">
        {likes.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  )
}
