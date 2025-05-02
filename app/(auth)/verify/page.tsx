"use client"
// Verify email khi đăng ký tài khoản
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth-service"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setIsVerifying(false)
        setIsSuccess(false)
        setMessage("Không tìm thấy mã xác thực.")
        return
      }

      try {
        const response = await authService.verifyEmail(token)
        setIsSuccess(true)
        setMessage(response)
      } catch (error) {
        setIsSuccess(false)
        setMessage(error instanceof Error ? error.message : "Xác thực thất bại.")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Xác thực tài khoản</CardTitle>
          <CardDescription className="text-center">
            {isVerifying
              ? "Đang xác thực địa chỉ email của bạn..."
              : isSuccess
                ? "Xác thực thành công!"
                : "Xác thực thất bại"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          ) : isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <p className="mt-4 text-center">{message}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push(isSuccess ? "/login" : "/")}>
            {isSuccess ? "Đến trang đăng nhập" : "Quay lại trang chủ"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
