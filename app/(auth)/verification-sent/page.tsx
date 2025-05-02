"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { passwordService } from "@/lib/password-service"
import { authService } from "@/lib/auth-service"

export default function VerificationSentPage() {
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState("")
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Kiểm tra xem người dùng đến từ trang quên mật khẩu hay đăng ký
    const type = searchParams.get("type")
    const userEmail = searchParams.get("email")
    
    if (type === "password-reset") {
      setIsPasswordReset(true)
    }
    
    if (userEmail) {
      setEmail(userEmail)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy email. Vui lòng thử lại từ đầu.",
      })
      return
    }
    
    setIsResending(true)
    try {
      let message
      
      if (isPasswordReset) {
        // Gửi lại email đặt lại mật khẩu
        message = await passwordService.resendResetPasswordEmail(email)
      } else {
        // Gửi lại email xác thực tài khoản
        message = await authService.resendVerification(email)
      }
      
      toast({
        title: "Thành công",
        description: message,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi lại email. Vui lòng thử lại sau.",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email đã được gửi</CardTitle>
          <CardDescription className="text-center">
            {isPasswordReset 
              ? "Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến email của bạn."
              : "Chúng tôi đã gửi một liên kết xác thực đến email của bạn."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p>Vui lòng kiểm tra hộp thư đến (hoặc thư rác).</p>
            <p className="text-sm text-muted-foreground">
              Nếu bạn không nhận được email, vui lòng kiểm tra thư rác hoặc yêu cầu một liên kết mới.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Quay lại trang đăng nhập</Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {isPasswordReset ? "Gửi lại email đặt lại mật khẩu" : "Gửi lại email xác thực"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

