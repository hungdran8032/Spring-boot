"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, X, Smile, MapPin, Users, Calendar, Music, Loader2 } from "lucide-react"
import { PostService } from "@/lib/post-service"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (post: any) => void // Updated to pass the full post object
}

export default function CreatePostModal({ isOpen, onClose, onCreatePost }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return

    setIsSubmitting(true)
    try {
      const postRequest = {
        content: content.trim()
      }

      const newPost = await PostService.createPost(postRequest, selectedFiles)
      
      onCreatePost(newPost)
      onClose()
      
      // Reset form
      setContent("")
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

  const handleImageSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate file types and sizes
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

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const actionButtons = [
    { icon: ImageIcon, label: "Ảnh/Video", action: handleImageSelect },
    { icon: Smile, label: "Cảm xúc", action: () => console.log("Emoji picker") },
    { icon: MapPin, label: "Vị trí", action: () => console.log("Location picker") },
    { icon: Users, label: "Gắn thẻ", action: () => console.log("Tag people") },
    { icon: Calendar, label: "Sự kiện", action: () => console.log("Create event") },
    { icon: Music, label: "Nhạc", action: () => console.log("Add music") },
  ]

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-0 flex flex-col rounded-2xl shadow-lg z-50">
          {/* Header - Fixed */}
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-0 border-b">
            <DialogTitle className="text-lg font-semibold">Đăng bài</DialogTitle>
          </DialogHeader>

          {/* Content area - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-[calc(90vh-200px)]">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex gap-3">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={user?.avatar || "/avt.png?height=40&width=40"} alt="User" />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground truncate">@{user?.userName}</p>
                  </div>
                </div>

                <Textarea
                  autoFocus
                  placeholder="Đăng bài gì hế?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] sm:min-h-[150px] resize-none border-0 focus-visible:ring-0 text-base sm:text-lg placeholder:text-muted-foreground"
                  disabled={isSubmitting}
                />

                <AnimatePresence>
                  {previewUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden">
                          {selectedFiles[index]?.type.startsWith('video/') ? (
                            <video
                              src={url}
                              className="w-full h-auto max-h-60 sm:max-h-80 object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Selected ${index + 1}`}
                              className="w-full h-auto max-h-60 sm:max-h-80 object-cover"
                            />
                          )}
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 shadow-md"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 border-t bg-background">
            {/* Scrollable action buttons */}
            <div className="p-3 sm:p-4 border-b">
              <div className="relative">
                <div
                  ref={scrollContainerRef}
                  className="overflow-x-auto w-full scrollbar-visible"
                  onWheel={(e) => {
                    if (e.deltaY !== 0 && scrollContainerRef.current) {
                      scrollContainerRef.current.scrollLeft += e.deltaY
                      e.preventDefault()
                    }
                  }}
                >
                  <div className="flex gap-1 sm:gap-2 min-w-max px-2">
                    {actionButtons.map((button, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 gap-1 sm:gap-2 px-2 sm:px-3"
                        onClick={button.action}
                        disabled={isSubmitting}
                      >
                        <button.icon className="h-4 w-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">{button.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed main action buttons */}
            <div className="p-3 sm:p-4 flex justify-end gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="px-4 sm:px-6"
                disabled={isSubmitting}
              >
                Huỷ
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting} 
                className="px-4 sm:px-6"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang đăng..." : "Đăng"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


