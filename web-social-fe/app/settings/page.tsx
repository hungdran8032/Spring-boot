"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  Mail,
  CheckCircle,
  XCircle,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import EditUserModal from "@/components/settings/edit-user-modal"

const SettingPage = () => {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter() 
  const [isLoading, setIsLoading] = useState(true)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Chờ AuthContext load xong
    if (!loading) {
      if (user === null) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }
  }, [user, loading, router])

  const handleUserUpdated = () => {
    // Refresh user data or trigger re-fetch
    window.location.reload()
  }

  // Show loading while AuthContext is loading OR while redirecting
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-muted-foreground">Đang kiểm tra trạng thái đăng nhập...</h1>
      </div>
    )
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null
  }

  // Fetch real account status from user data
  const accountStatus = {
    isVerified: user?.verified || false,
    isActive: user?.enabled || false,
    twoFactorEnabled: false, //tính năng đang phát triển
    lastLogin: "2024-01-15 10:30 AM"  //tính năng đang phát triển
  }

  const handlePasswordChange = async () => {
    // Redirect to change password page or open modal
    window.location.href = "/change-password"
  }
 
  return (
    <div className="container max-w-4xl py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý cài đặt tài khoản của bạn
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="privacy">Chia sẻ & Riêng tư</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin tài khoản
                </CardTitle>
                <CardDescription>
                  Xem và quản lý thông tin tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className={`space-y-4 transition-all duration-300 ${!isExpanded ? 'max-h-48 overflow-hidden' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Họ</Label>
                        <Input value={user?.firstName || ""} disabled />
                      </div>
                      <div>
                        <Label>Tên</Label>
                        <Input value={user?.lastName || ""} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>Tên người dùng</Label>
                      <Input value={user?.userName || ""} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled />
                    </div>
                    {user?.phone && (
                      <div>
                        <Label>Số điện thoại</Label>
                        <Input value={user.phone} disabled />
                      </div>
                    )}
                    {user?.address && (
                      <div>
                        <Label>Địa chỉ</Label>
                        <Input value={user.address} disabled />
                      </div>
                    )}
                    {user?.gender && (
                      <div>
                        <Label>Giới tính</Label>
                        <Input value={user.gender} disabled />
                      </div>
                    )}
                    {user?.birthDay && (
                      <div>
                        <Label>Ngày sinh</Label>
                        <Input value={user.birthDay} disabled />
                      </div>
                    )}
                  </div>
                  
                  {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        Thu gọn <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Xem thêm <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  onClick={() => setShowEditUserModal(true)}
                >
                  Sửa hồ sơ
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trạng thái tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Xác thực email</span>
                  </div>
                  <Badge variant={user?.verified ? "default" : "destructive"}>
                    {user?.verified ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Đã xác thực</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Chưa xác thực</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Trạng thái tài khoản</span>
                  </div>
                  <Badge variant={user?.enabled ? "default" : "secondary"}>
                    {user?.enabled ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                
                
                <div className="flex items-center justify-between">
                  <span>Lần đăng nhập cuối</span>
                  {/* icon lịch */}
                  
                  <span className="text-sm text-muted-foreground">
                    {accountStatus.lastLogin}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Mật khẩu và bảo mật
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mật khẩu</h4>
                    <p className="text-sm text-muted-foreground">
                      Lần cuối thay đổi là 30 ngày trước
                    </p>
                  </div>
                  <Button onClick={handlePasswordChange}>
                    Đổi mật khẩu
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Xác thực 2 yếu tố</h4>
                    <p className="text-sm text-muted-foreground">
                      Thêm 1 lớp bảo mật để bảo mật tài khoản của bạn
                    </p>
                  </div>
                  <Switch checked={accountStatus.twoFactorEnabled} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Tuỳ chọn thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Thông báo email</h4>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nhận thông báo</h4>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Thông báo quảng cáo</h4>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo quảng cáo
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Chia sẻ & Riêng tư
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị hồ sơ</h4>
                    <p className="text-sm text-muted-foreground">
                      Chỉ những người theo dõi mới được xem 
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hiển thị trạng thái hoạt động</h4>
                    <p className="text-sm text-muted-foreground">
                      Chỉ những người theo dõi mới được xem trạng thái hoạt động
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Phân tích dữ liệu</h4>
                    <p className="text-sm text-muted-foreground">
                      Giúp chúng tôi cải thiện dịch vụ của bạn
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}

export default SettingPage
