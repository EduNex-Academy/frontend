import Link from "next/link";
import { Mountain, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-300 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-900">
          <Mountain className="h-6 w-6 text-blue-900" />
          <span className="text-xl">EduNex</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-base font-medium">
          <Link href="/" className="text-blue-800 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/courses" className="text-blue-800 hover:text-blue-600 transition-colors">
            Courses
          </Link>
          <Link href="#" className="text-blue-800 hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-blue-800 hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-blue-800 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button
            className="hidden md:inline-flex bg-blue-900 text-white px-6 py-1.5 rounded border border-blue-900 hover:bg-white hover:text-blue-900 hover:cursor-pointer transition"
          >
            Register
          </button>

          <button
            className="hidden md:inline-flex border border-blue-900 text-blue-900 px-4 py-2 rounded hover:bg-blue-900 hover:text-white hover:cursor-pointer transition"
          >
            Login
          </button>
          {/* Mobile menu button */}
          <button className="md:hidden text-blue-900 p-2 rounded hover:bg-blue-100 transition">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
