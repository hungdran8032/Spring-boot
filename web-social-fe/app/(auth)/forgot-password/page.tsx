import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Request a password reset link",
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Quên mật khẩu</h1>
        <p className="text-muted-foreground">Nhập email để đặt lại mật khẩu</p>
      </div>
      <ForgotPasswordForm />
      <div className="text-center text-sm">
        Nhớ mật khẩu?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  )
}
