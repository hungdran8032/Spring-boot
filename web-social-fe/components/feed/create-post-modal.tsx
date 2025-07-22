"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, X, Smile, MapPin, Users, Calendar, Music } from "lucide-react"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (content: string, image: string | null) => void
}

export default function CreatePostModal({ isOpen, onClose, onCreatePost }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) return

    onCreatePost(content, selectedImage)

    // Reset form
    setContent("")
    setSelectedImage(null)
  }

  const handleImageSelect = () => {
    // In a real app, you would open file picker
    setSelectedImage("/placeholder.svg?height=300&width=400")
  }

  const removeImage = () => {
    setSelectedImage(null)
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
    { icon: ImageIcon, label: "Photo", action: handleImageSelect },
    { icon: Smile, label: "Emoji", action: () => console.log("Emoji picker") },
    { icon: MapPin, label: "Location", action: () => console.log("Location picker") },
    { icon: Users, label: "Tag people", action: () => console.log("Tag people") },
    { icon: Calendar, label: "Event", action: () => console.log("Create event") },
    { icon: Music, label: "Music", action: () => console.log("Add music") },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] p-0 flex flex-col rounded-2xl shadow-lg z-50">
        {/* Header - Fixed */}
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-0 border-b">
          <DialogTitle className="text-lg font-semibold">Create new post</DialogTitle>
        </DialogHeader>

        {/* Content area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[calc(90vh-200px)]">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex gap-3">
                <Avatar className="flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback>CU</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Current User</p>
                  <p className="text-sm text-muted-foreground truncate">@currentuser</p>
                </div>
              </div>

              <Textarea
                autoFocus
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] sm:min-h-[150px] resize-none border-0 focus-visible:ring-0 text-base sm:text-lg placeholder:text-muted-foreground"
              />

              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative rounded-lg overflow-hidden"
                  >
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected"
                      className="w-full h-auto max-h-60 sm:max-h-80 object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 shadow-md"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
              {/* Scrollable container with visible scrollbar on desktop */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto w-full scrollbar-visible"
                onWheel={(e) => {
                  // Enable horizontal scrolling with mouse wheel
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
            <Button variant="outline" onClick={onClose} className="px-4 sm:px-6">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim() && !selectedImage} className="px-4 sm:px-6">
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
