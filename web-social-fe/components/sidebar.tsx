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
    { href: "/feed", icon: Home, label: "Trang chủ" },
    { href: "/search", icon: Search, label: "Tìm kiếm" },
    { href: "/notifications", icon: Bell, label: "Thông báo" },
    { href: "/messages", icon: MessageSquare, label: "Tin nhắn" },
    { href: "/bookmarks", icon: Bookmark, label: "Lưu" },
    { href: "/my-profile", icon: User, label: "Trang cá nhân" },
    { href: "/settings", icon: Settings, label: "Cài đặt" },
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
    </div>
  )
}
