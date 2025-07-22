"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, LinkIcon, MessageSquare, UserPlus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProfileHeaderProps {
  username: string
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  // Mock user data - in a real app, this would come from an API
  const user = {
    name: "John Doe",
    username: username,
    avatar: "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=300&width=1200",
    bio: "Software developer and designer. Passionate about creating beautiful user experiences.",
    location: "San Francisco, CA",
    website: "johndoe.com",
    joinedDate: "January 2020",
    following: 245,
    followers: 1024,
    posts: 358,
  }

  return (
    <div className="mb-6">
      {/* Cover image */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
        <img src={user.coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
      </div>

      {/* Profile info */}
      <div className="relative px-4">
        <div className="flex justify-between">
          <Avatar className="absolute -top-16 ring-4 ring-background h-32 w-32">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="ml-auto mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={() => setIsFollowing(!isFollowing)}
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
        </div>

        <div className="mt-16">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>

          <p className="mt-3">{user.bio}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {user.location}
              </div>
            )}
            {user.website && (
              <div className="flex items-center">
                <LinkIcon className="mr-1 h-4 w-4" />
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Joined {user.joinedDate}
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <span className="font-bold">{user.following}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
            <div>
              <span className="font-bold">{user.followers}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold">{user.posts}</span> <span className="text-muted-foreground">Posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
