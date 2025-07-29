"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, LinkIcon, MessageSquare, UserPlus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { profileService, UserProfile } from "@/lib/profile-service"
import { useAuth } from "@/contexts/AuthContext"
import Link from 'next/link'

interface ProfileHeaderProps {
  username: string
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  const isOwnProfile = currentUser?.userName === username

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getUserProfile(username)
        setUserProfile(profile)
        
        // Format joinedDate if birthDay exists
        if (profile.birthDay) {
          const joinedDate = new Date(profile.birthDay).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })
          setUserProfile(prev => prev ? {...prev, joinedDate} : null)
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error)
        if (error.response?.status === 404) {
          setUserProfile(null) // User not found
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await profileService.unfollowUser(username)
      } else {
        await profileService.followUser(username)
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    }
  }

  if (loading) {
    return <div className="mb-6 animate-pulse">Loading...</div>
  }

  if (!userProfile) {
    return (
      <div className="mb-6 text-center py-12">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground">The user @{username} does not exist.</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Cover image */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
        <img 
          src={userProfile.banner || "/placeholder.svg?height=300&width=1200"} 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Profile info */}
      <div className="relative px-4">
        <div className="flex justify-between">
          <Avatar className="absolute -top-16 ring-4 ring-background h-32 w-32">
            <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={`${userProfile.firstName} ${userProfile.lastName}`} />
            <AvatarFallback>
              {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {isOwnProfile ? (
            <div className="ml-auto mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  Edit Profile
                </Link>
              </Button>
            </div>
          ) : (
            <div className="ml-auto mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  "Following"
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Share profile</DropdownMenuItem>
                  <DropdownMenuItem>Block user</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="mt-16">
          <h1 className="text-2xl font-bold">
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          <p className="text-muted-foreground">@{userProfile.userName}</p>

          {userProfile.bio && <p className="mt-3">{userProfile.bio}</p>}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {userProfile.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {userProfile.location}
              </div>
            )}
            {userProfile.website && (
              <div className="flex items-center">
                <LinkIcon className="mr-1 h-4 w-4" />
                <a
                  href={`https://${userProfile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {userProfile.website}
                </a>
              </div>
            )}
            {userProfile.joinedDate && (
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Joined {userProfile.joinedDate}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <span className="font-bold">{userProfile.followingCount || 0}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold">{userProfile.followersCount || 0}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold">{userProfile.postsCount || 0}</span>{" "}
              <span className="text-muted-foreground">Posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






