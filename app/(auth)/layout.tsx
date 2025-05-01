import type { ReactNode } from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex flex-col justify-between p-8 md:p-12">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-semibold text-xl">
            Brand
          </Link>
          <ModeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">{children}</div>
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden md:block bg-gradient-to-br from-rose-400 to-pink-600 dark:from-rose-900 dark:to-pink-950">
        <div className="h-full flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Experience Seamless Authentication
              </h1>
              <p className="text-white/80 md:text-xl">
                Secure, fast, and user-friendly authentication for your application.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-white/10 backdrop-blur-sm p-4 flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-md bg-white/20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
