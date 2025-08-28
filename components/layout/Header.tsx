import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/common/Logo"
import { Navigation } from "@/components/layout/Navigation"

interface HeaderProps {
  showNavigation?: boolean
}

export function Header({ showNavigation = true }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        {showNavigation && <Navigation />}
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
