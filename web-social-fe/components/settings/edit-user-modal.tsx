"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { UserService } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLoadScript } from "@react-google-maps/api"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
}

const libraries: ("places")[] = ["places"]

export default function EditUserModal({ isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  // Debug loading state
  useEffect(() => {
    console.log('Google Maps API loaded:', isLoaded)
    console.log('Google Maps API error:', loadError)
    console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  }, [isLoaded, loadError])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    gender: "",
    birthDay: ""
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        gender: user.gender || "",
        birthDay: user.birthDay || ""
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [isOpen, user])

  useEffect(() => {
    if (isLoaded && addressInputRef.current && isOpen) {
      console.log('Setting up autocomplete...')
      
      // Cleanup previous instance
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'vn' },
        }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        console.log('Place selected:', place)
        if (place?.formatted_address) {
          setFormData(prev => ({ ...prev, address: place.formatted_address || "" }))
        }
      })

      console.log('Autocomplete setup complete')
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = new FormData()
      
      // Add user fields
      if (formData.firstName) updateData.append('firstName', formData.firstName)
      if (formData.lastName) updateData.append('lastName', formData.lastName)
      if (formData.phone) updateData.append('phone', formData.phone)
      if (formData.address) updateData.append('address', formData.address)
      if (formData.gender) updateData.append('gender', formData.gender)
      if (formData.birthDay) updateData.append('birthDay', formData.birthDay)
      if (avatarFile) updateData.append('avatar', avatarFile)

      await UserService.updateProfile(updateData)
      
      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật!"
      })
      
      onUserUpdated()
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show error if API failed to load
  if (loadError) {
    console.error('Google Maps API failed to load:', loadError)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar 
                className="h-24 w-24 cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <AvatarImage src={avatarPreview || user?.avatar} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Tên</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Họ</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={formData.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              ref={addressInputRef}
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder={isLoaded ? "Nhập địa chỉ của bạn..." : "Đang tải Google Maps..."}
              disabled={!isLoaded}
            />
            {loadError && (
              <p className="text-sm text-red-500 mt-1">
                Không thể tải Google Maps API. Vui lòng nhập địa chỉ thủ công.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDay">Ngày sinh</Label>
            <Input
              id="birthDay"
              type="date"
              value={formData.birthDay}
              onChange={(e) => handleInputChange('birthDay', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

