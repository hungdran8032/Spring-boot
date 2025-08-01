"use client"
import Link from "next/link"
import { RegisterForm } from "./register-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// export const metadata: Metadata = {
//   title: "Đăng ký",
//   description: "Create a new account",
// }

export default function RegisterPage() {
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
  if (user) {
    return null
  }

  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Đăng ký</h1>
        <p className="text-muted-foreground">Nhập thông tin để tiếp tục</p>
      </div>
      <RegisterForm />
      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Đăng nhập
        </Link>
      </div>
    </div>
  )
}
