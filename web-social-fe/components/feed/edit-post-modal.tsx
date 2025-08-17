"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { PostService } from "@/lib/post-service"
import { useToast } from "@/hooks/use-toast"

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    content: string
    images?: string[]
  }
  onUpdatePost: (updatedPost: any) => void
}

export default function EditPostModal({ isOpen, onClose, post, onUpdatePost }: EditPostModalProps) {
  const [content, setContent] = useState(post.content)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setContent(post.content)
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingImages(post.images || [])
    }
  }, [isOpen, post.content, post.images])

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return

    setIsSubmitting(true)
    try {
      const postRequest = { content: content.trim() }
      const updatedPost = await PostService.updatePost(Number(post.id), postRequest, selectedFiles)
      
      onUpdatePost(updatedPost)
      onClose()
      
      toast({
        title: "Success",
        description: "Post updated successfully!"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update post"
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
      const isValidSize = file.size <= 10 * 1024 * 1024

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

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar || "/avt.png"} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground">@{user?.userName}</p>
              </div>
            </div>

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base"
              disabled={isSubmitting}
            />

            {/* Existing Images */}
            <AnimatePresence>
              {existingImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">Current images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Current ${index + 1}`} 
                          className="w-full h-32 object-cover" 
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeExistingImage(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Images */}
            <AnimatePresence>
              {previewUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">New images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative rounded-lg overflow-hidden">
                        {selectedFiles[index]?.type.startsWith('video/') ? (
                          <video src={url} className="w-full h-32 object-cover" controls />
                        ) : (
                          <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeNewFile(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="text-green-600 hover:bg-green-50"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Thêm ảnh/video
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Huỷ
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={(!content.trim() && existingImages.length === 0 && selectedFiles.length === 0) || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
