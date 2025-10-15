"use client"

import React from 'react'
import { FilePlus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function InstructorCoursesNav() {
  const pathname = usePathname()
  const isActive = pathname.includes('/instructor/create_course') || pathname === '/instructor/my-courses'

  return (
    <Link 
      href="/instructor/my-courses" 
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-accent hover:text-blue-500 hover:scale-110 ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      }`}
      title="My Courses"
    >
  <FilePlus className="h-4 w-4" />
    </Link>
  )
}