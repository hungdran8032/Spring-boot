"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Bell, MessageSquare, Bookmark, User, Settings } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/profile/username", icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="sticky top-20">
      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                  />
                )}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* <div className="mt-6 pt-6 border-t">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Current User</p>
            <p className="text-sm text-muted-foreground">@currentuser</p>
          </div>
        </div>
      </div> */}
    </div>
  )
}
