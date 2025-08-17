"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, LinkIcon, MessageSquare, UserPlus, MoreHorizontal, Camera, Eye, Edit, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ProfileResponse, profileService } from "@/lib/profile-service"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/lib/user-service"
import Link from 'next/link'
import EditProfileModal from "./edit-profile-modal"

interface ProfileHeaderProps {
  username: string
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [userProfile, setUserProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const isOwnProfile = currentUser?.userName === username

  const handleProfileUpdated = async () => {
    // Refresh profile data
    const updatedProfile = await profileService.getProfile()
    setUserProfile(updatedProfile)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfileByUsername(username)
        setUserProfile(profile)
        
        // Format joinedDate if birthDay exists
        if (profile.user?.birthDay) {
          const joinedDate = new Date(profile.user?.birthDay).toLocaleDateString('en-US', {
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      await UserService.updateProfile(formData)
      
      // Refresh profile data
      const updatedProfile = await profileService.getProfile()
      setUserProfile(updatedProfile)
      
      toast({
        title: "Thành công",
        description: "Cập nhật ảnh đại diện thành công!"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật ảnh đại diện"
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('banner', file)
      
      await profileService.updateProfile(formData)
      
      // Refresh profile data
      const updatedProfile = await profileService.getProfile()
      setUserProfile(updatedProfile)
      
      toast({
        title: "Thành công", 
        description: "Cập nhật ảnh bìa thành công!"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật ảnh bìa"
      })
    } finally {
      setIsUploadingBanner(false)
    }
  }

  if (loading) {
    return <div className="mb-6 animate-pulse">Loading...</div>
  }

  if (!userProfile) {
    return (
      <div className="mb-6 text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy người dùng</h2>
        <p className="text-muted-foreground">Không thấy người dùng {username} này </p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Cover image */}
      <div 
        className="relative h-48 md:h-64 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowBannerDialog(true)}
      >
        <img 
          src={userProfile.banner || "/banner.png?height=300&width=1200"} 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
        {isUploadingBanner && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        {isOwnProfile && !isUploadingBanner && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              bannerInputRef.current?.click()
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa ảnh bìa
          </Button>
        )}
      </div>

      {/* Profile info */}
      <div className="relative px-4">
        <div className="flex justify-between">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="absolute -top-16 ring-4 ring-background h-32 w-32 cursor-pointer hover:opacity-90 transition-opacity">
                  <AvatarImage src={userProfile.user?.avatar || "/avt.png"} alt={`${userProfile.user?.firstName} ${userProfile.user?.lastName}`} />
                  <AvatarFallback>
                    {userProfile.user?.firstName?.charAt(0)}{userProfile.user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setShowAvatarDialog(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem ảnh đại diện
                </DropdownMenuItem>
                {isOwnProfile && (
                  <DropdownMenuItem 
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa ảnh đại diện
                      </>
                    )}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isUploadingAvatar && (
              <div className="absolute -top-16 inset-0 bg-black/50 rounded-full flex items-center justify-center h-32 w-32">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {isOwnProfile ? (
            <div className="ml-auto mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditModal(true)}
              >
                Chỉnh sửa trang cá nhân
              </Button>
            </div>
          ) : (
            <div className="ml-auto mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nhắn tin
              </Button>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  "Đang theo dõi"
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Theo dõi
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
                  <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                  <DropdownMenuItem>Chặn</DropdownMenuItem>
                  <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="mt-16">
          <h1 className="text-2xl font-bold">
            {userProfile.user?.firstName} {userProfile.user?.lastName}
          </h1>
          <p className="text-muted-foreground">@{userProfile.user?.userName}</p>

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
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <span className="font-bold">{userProfile.followingCount || 0}</span>{" "}
              <span className="text-muted-foreground">Đang theo dõi</span>
            </div>
            <div>
              <span className="font-bold">{userProfile.followersCount || 0}</span>{" "}
              <span className="text-muted-foreground">Người theo dõi</span>
            </div>
            <div>
              <span className="font-bold">{userProfile.postsCount || 0}</span>{" "}
              <span className="text-muted-foreground">Bài đăng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Ảnh đại diện</DialogTitle>
          <div className="flex justify-center">
            <img 
              src={userProfile.user?.avatar || "/avt.png"} 
              alt="Avatar" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Ảnh bìa</DialogTitle>
          <div className="relative">
            <img 
              src={userProfile.banner || "/banner.png?height=300&width=1200"} 
              alt="Banner" 
              className="w-full h-auto rounded-lg"
            />
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 right-4"
                onClick={() => {
                  setShowBannerDialog(false)
                  bannerInputRef.current?.click()
                }}
                disabled={isUploadingBanner}
              >
                {isUploadingBanner ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa ảnh bìa
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
        disabled={isUploadingAvatar}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerChange}
        className="hidden"
        disabled={isUploadingBanner}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}


