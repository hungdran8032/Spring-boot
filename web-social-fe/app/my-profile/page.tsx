"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MyProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else {
        // Redirect to dynamic profile page
        router.push(`/${user.userName}`)
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="container py-6">Loading...</div>
  }

  return null
}
