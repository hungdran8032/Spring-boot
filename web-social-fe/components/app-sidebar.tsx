"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Bell, MessageSquare, Bookmark, User, Settings, TrendingUp, Users, Hash } from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()

  const mainNavItems = [
    { href: "/", icon: Home, label: "Trang chủ" },
    { href: "/search", icon: Search, label: "Tìm kiếm" },
    { href: "/notifications", icon: Bell, label: "Thông báo" },
    { href: "/messages", icon: MessageSquare, label: "Tin nhắn" },
    { href: "/bookmarks", icon: Bookmark, label: "Lưu" },
    { href: "/my-profile", icon: User, label: "Hồ sơ" },
  ]

  const discoverItems = [
    { href: "/trending", icon: TrendingUp, label: "Xu hướng" },
    { href: "/communities", icon: Users, label: "Cộng đồng" },
    { href: "/hashtags", icon: Hash, label: "Hashtag" },
  ]

  const settingsItems = [{ href: "/settings", icon: Settings, label: "Cài đặt" }]

  return (
    <Sidebar collapsible="icon" className="border-r bg-background">
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {/* <span className="font-bold text-lg">EL</span> */}
                  <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Echo Link</span>
                  <span className="text-xs text-muted-foreground">Social Network</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-background overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" /> {/* Increased icon size from default */}
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Khám phá</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {discoverItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" /> {/* Increased icon size from default */}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" /> {/* Increased icon size from default */}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      
        
      <SidebarRail />
    </Sidebar>
  )
}
