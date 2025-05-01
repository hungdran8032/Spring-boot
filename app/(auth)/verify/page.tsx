"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyEmail } from "@/lib/auth-service"
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
        setMessage("Verification token is missing.")
        return
      }

      try {
        const response = await verifyEmail(token)
        setIsSuccess(true)
        setMessage(response)
      } catch (error) {
        setIsSuccess(false)
        setMessage(error instanceof Error ? error.message : "Verification failed.")
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
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {isVerifying
              ? "Verifying your email address..."
              : isSuccess
                ? "Verification successful!"
                : "Verification failed"}
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
            {isSuccess ? "Go to Login" : "Back to Home"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
