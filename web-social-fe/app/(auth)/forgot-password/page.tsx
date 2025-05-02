import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link",
}

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
      </div>
      <ForgotPasswordForm />
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Back to login
        </Link>
      </div>
    </div>
  )
}
