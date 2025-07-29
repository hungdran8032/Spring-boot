"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/feed/post-card"
import { profileService } from "@/lib/profile-service"
import { PostResponse } from "@/lib/post-service"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreatePostModal from "@/components/feed/create-post-modal"

interface ProfileTabsProps {
  username: string
}

export default function ProfileTabs({ username }: ProfileTabsProps) {
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreatePost = (newPost: any) => {
    setPosts([newPost, ...posts])
  }

  const handleUpdatePost = (updatedPost: any) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
  }

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true)
        const response = await profileService.getUserPosts(username)
        setPosts(response.content || [])
      } catch (error) {
        console.error('Failed to fetch user posts:', error)
        setPosts([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchUserPosts()
  }, [username])

  // Extract media from posts for media tab
  const mediaItems = posts.flatMap(post => 
    post.media?.map(media => ({
      id: `${post.id}-${media.id}`,
      url: media.url,
      type: media.type,
      postId: post.id
    })) || []
  )

  // Mock data for likes (since we don't have this endpoint yet)
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

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  return (
    <>
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No posts yet</div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id.toString(),
                  user: {
                    name: post.userFullName,
                    username: post.userName,
                    avatar: post.userAvatar || "/placeholder.svg?height=40&width=40"
                  },
                  content: post.content,
                  image: post.media?.[0]?.url || null,
                  images: post.media?.map(m => m.url),
                  likes: 0, // TODO: Add likes count from backend
                  comments: 0, // TODO: Add comments count from backend
                  createdAt: new Date(post.createAt).toLocaleDateString()
                }}
                onDeletePost={handleDeletePost}
                onUpdatePost={handleUpdatePost}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="media">
          {mediaItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No media yet</div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {mediaItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="break-inside-avoid rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img 
                    src={item.url} 
                    alt="Media" 
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: 'auto' }}
                  />
                </motion.div>
              ))}
            </div>
          )}
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

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
      />
    </>
  )
}








