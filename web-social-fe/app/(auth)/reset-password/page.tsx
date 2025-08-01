import type { Metadata } from "next"
import Link from "next/link"
import ResetPasswordForm from "./reset-password-form"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Reset your password",
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground">Nhập mật khẩu mới của bạn</p>
      </div>
      <ResetPasswordForm />
      <div className="text-center text-sm">
        Nhớ mật khẩu?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Trở về đăng nhập
        </Link>
      </div>
    </div>
  )
}
