"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, MessageSquare, Search, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  if (loading) {
      return null;
    }
  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
      toast({ title: "Đăng xuất thành công", description: "Bạn đã đăng xuất thành công" });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!user) {
    return (
      <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-background border-b"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        {/* Left side - Sidebar trigger and logo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <Link href="/" className="hidden sm:block">
            <span className="font-bold text-lg">Echo Link</span>
          </Link>
        </div>

        {/* Center - Search bar (hidden on mobile) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="outline"
            type="button"
            className="hidden sm:block"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    </header>
    )
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-background border-b"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        {/* Left side - Sidebar trigger and logo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <Link href="/" className="hidden sm:block">
            <span className="font-bold text-lg">Echo Link</span>
          </Link>
        </div>

        {/* Center - Search bar (hidden on mobile) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-2">
          {/* Quick actions */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">2</Badge>
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <ModeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/avt.png?height=40&width=40"} alt="User" />
                  <AvatarFallback>
                    {(user.firstName?.charAt(0) || "") + (user.lastName?.charAt(0) || "")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user.userName || "unknown"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${user.userName}`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden" asChild>
                <Link href="/notifications" className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Thông báo</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden" asChild>
                <Link href="/messages" className="cursor-pointer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Tin nhắn</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <a onClick={handleLogout}><span >Đăng xuất</span> </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


