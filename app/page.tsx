"use client"

import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import { ArrowRight, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    setIsAuth(!!authService.getToken())
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsAuth(false)
      console.log("Logout successful")
      router.push("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  if (isAuth) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Welcome Back!</h1>
            <p className="text-muted-foreground">You are now signed in to your account</p>
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground">Sign in to access your account or create a new one</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
