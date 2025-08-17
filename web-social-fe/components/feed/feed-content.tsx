"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ImageIcon, Smile, MapPin, Users, Calendar, Music, Video, Mic, X, Loader2 } from "lucide-react"
import PostCard from "@/components/feed/post-card"
import FloatingActionButton from "@/components/floating-action-button"
import { PostService } from "@/lib/post-service"
import { PostResponse } from "@/lib/post-service"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function FeedContent() {
  const [newPostContent, setNewPostContent] = useState("")
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await PostService.getAllPosts()
        setPosts(response.content)
      } catch (error) {
        console.error('Failed to load posts:', error)
      }
    }
    loadPosts()
  }, [])

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0) return

    setIsSubmitting(true)
    try {
      const postRequest = {
        content: newPostContent.trim()
      }

      const newPost = await PostService.createPost(postRequest, selectedFiles)
      
      setPosts([newPost, ...posts])
      setNewPostContent("")
      setSelectedFiles([])
      setPreviewUrls([])
      
      toast({
        title: "Success",
        description: "Post created successfully!"
      })
    } catch (error: any) {
      console.error('Failed to create post:', error)
      
      let errorMessage = "Failed to create post. Please try again."
      if (error.response?.status === 413 || error.message?.includes("10MB")) {
        errorMessage = "Kích thước file vượt quá giới hạn cho phép (10MB)"
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Only images and videos are allowed."
        })
        return false
      }
      
      if (!isValidSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB."
        })
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    setSelectedFiles(prev => [...prev, ...validFiles])
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const actionButtons = [
    { 
      icon: ImageIcon, 
      label: "Hình ảnh",   
      color: "text-green-600 hover:bg-green-50",
      action: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = "image/*"
          fileInputRef.current.click()
        }
      }
    },
    { 
      icon: Video, 
      label: "Video", 
      color: "text-blue-600 hover:bg-blue-50",
      action: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = "video/*"
          fileInputRef.current.click()
        }
      }
    },
    { 
      icon: Smile, 
      label: "Cảm xúc", 
      color: "text-yellow-600 hover:bg-yellow-50",
      action: () => console.log("Add feeling/activity")
    },
    { 
      icon: MapPin, 
      label: "Vị trí", 
      color: "text-red-600 hover:bg-red-50",
      action: () => console.log("Add location")
    },
    { 
      icon: Users, 
      label: "Gắn thẻ", 
      color: "text-purple-600 hover:bg-purple-50",
      action: () => console.log("Tag people")
    },
    { 
      icon: Calendar, 
      label: "Sự kiện", 
      color: "text-indigo-600 hover:bg-indigo-50",
      action: () => console.log("Create event")
    },
    { 
      icon: Music, 
      label: "Nhạc", 
      color: "text-pink-600 hover:bg-pink-50",
      action: () => console.log("Add music")
    },
    { 
      icon: Mic, 
      label: "Trực tiếp", 
      color: "text-red-500 hover:bg-red-50",
      action: () => console.log("Go live")
    }
  ]

  const handleCreatePostFromModal = (newPost: any) => {
    setPosts([newPost, ...posts])
  }

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  const handleUpdatePost = (updatedPost: any) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
  }

  return (
    <div className="space-y-6 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Create Post Section */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar || "/avt.png?height=40&width=40"} alt="User" />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder={`Bạn đang nghĩ gì thế, ${user?.firstName}?`}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="resize-none border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground"
                        rows={3}
                        disabled={isSubmitting}
                      />

                      {/* File Previews */}
                      <AnimatePresence>
                        {previewUrls.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-2"
                          >
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative rounded-lg overflow-hidden">
                                {selectedFiles[index]?.type.startsWith('video/') ? (
                                  <video
                                    src={url}
                                    className="w-full h-32 object-cover"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                )}
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 shadow-md"
                                  onClick={() => removeFile(index)}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-2 border-t space-y-3">
                        {/* Action Buttons Grid */}
                        <div className="grid grid-cols-4 gap-2">
                          {actionButtons.map((button, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className={`flex flex-col items-center gap-1 h-auto py-2 px-1 ${button.color} transition-colors`}
                              onClick={button.action}
                              disabled={isSubmitting}
                            >
                              <button.icon className="h-5 w-5" />
                              <span className="text-xs font-medium">{button.label}</span>
                            </Button>
                          ))}
                        </div>

                        {/* Post Button */}
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            onClick={handleCreatePost} 
                            disabled={(!newPostContent.trim() && selectedFiles.length === 0) || isSubmitting}
                            className="px-6"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng...
                              </>
                            ) : (
                              "Đăng"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
      )}
     

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeletePost={handleDeletePost}
            onUpdatePost={handleUpdatePost}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      {user &&(
        <FloatingActionButton onCreatePost={handleCreatePostFromModal} />
      )}
    </div>
  )
}















