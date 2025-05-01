import type { Metadata } from "next"
import Link from "next/link"
import ResetPasswordForm from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">Enter your new password</p>
      </div>
      <ResetPasswordForm />
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Back to login
        </Link>
      </div>
    </div>
  )
}
