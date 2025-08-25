"use client"

import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/common/Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, KeyboardEvent } from "react"

export function DashboardHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const basePath = user?.role === 'INSTRUCTOR' ? '/instructor' : '/student'
      router.push(`${basePath}/courses?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery)
    }
  }

  const handleSearchSubmit = () => {
    handleSearch(searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="block">
            <Logo />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative group">
            <button
              onClick={handleSearchSubmit}
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500 hover:text-blue-500 cursor-pointer z-10"
            >
              <Search className="h-4 w-4" />
            </button>
            <Input
              type="search"
              placeholder="Search courses, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-12 pr-4 h-11 bg-transparent border-0 ring-1 ring-blue-200/30 rounded-full placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-400/30 focus:bg-background/50 transition-all duration-200 hover:ring-blue-300/40"
            />
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full hover:bg-muted/60 transition-colors">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 animate-pulse">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-md border-border/40">
              <DropdownMenuLabel className="font-semibold text-base">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem className="flex flex-col items-start space-y-1 p-4 hover:bg-muted/60 transition-colors">
                <div className="font-medium text-sm">Assignment Due Tomorrow</div>
                <div className="text-xs text-muted-foreground">CS101 - Data Structures Project</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start space-y-1 p-4 hover:bg-muted/60 transition-colors">
                <div className="font-medium text-sm">New Course Available</div>
                <div className="text-xs text-muted-foreground">Advanced React Development</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start space-y-1 p-4 hover:bg-muted/60 transition-colors">
                <div className="font-medium text-sm">Grade Posted</div>
                <div className="text-xs text-muted-foreground">Mathematics Midterm - Grade: A</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem className="text-center p-3 hover:bg-muted/60 transition-colors">
                <Link href="/student/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar with Status Indicator */}
          <div className="flex items-center ml-3">
            <div className="relative group">
              <Avatar className="h-10 w-10 border-2 border-blue-400/30 group-hover:border-blue-500/50 transition-colors cursor-pointer">
                <AvatarImage src={user?.profilePictureUrl} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator with pulse animation */}
              <span className="absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
