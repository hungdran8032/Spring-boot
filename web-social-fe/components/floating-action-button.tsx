"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreatePostModal from "@/components/feed/create-post-modal"

interface FloatingActionButtonProps {
  onCreatePost: (post: any) => void
}

export default function FloatingActionButton({ onCreatePost }: FloatingActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreatePost = (post: any) => {
    onCreatePost(post)
    setIsModalOpen(false)
  }

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreatePost={handleCreatePost} />
    </>
  )
}

