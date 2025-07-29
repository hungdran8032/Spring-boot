import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppLayout from "@/components/app-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SkyBlue",
  description: "Professional authentication system with Next.js and shadcn/ui",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SidebarProvider>
              <AppLayout>
                {children}
                <Toaster/>
              </AppLayout>
            </SidebarProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
