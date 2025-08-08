import { BookOpen } from "lucide-react"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-bold text-blue-900">EduNex</span>
    </Link>
  )
}
