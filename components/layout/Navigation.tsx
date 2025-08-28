import Link from "next/link"
import { navigationItems } from "@/data/constants"

export function Navigation({ className = "" }: { className?: string }) {
  return (
    <nav className={`hidden md:flex items-center space-x-8 ${className}`}>
      {navigationItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="text-gray-600 hover:text-blue-600 transition-colors"
          {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
