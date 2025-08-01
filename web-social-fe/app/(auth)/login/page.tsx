
"use client"
import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "./login-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// export const metadata: Metadata = {
//   title: "Đăng nhập",
//   description: "Login to your account",
// }

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Nếu đã đăng nhập thì redirect về home
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-muted-foreground">Đang kiểm tra trạng thái đăng nhập...</h1>
      </div>
    )
  }

  // Don't render login form if already logged in
  if (user) {
    return null
  }
  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Chào mừng</h1>
        <p className="text-muted-foreground">Hêh! Rất vui vì bạn đã đến với chúng tôi</p>
      </div>
      <LoginForm />
      <div className="text-center text-sm">
        Không có tài khoản hả?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  )
}
