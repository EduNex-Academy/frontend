import Link from "next/link";
import {
  Mountain,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-blue-900">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-10 px-4 py-12 md:px-6 md:py-16">
        {/* Logo & Description */}
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-900"
          >
            <Mountain className="h-6 w-6 text-blue-900" />
            <span>EduNex</span>
          </Link>
          <p className="text-base text-blue-700">
            Your journey to knowledge starts here. Learn, grow, and achieve your goals with our expert-led courses.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-blue-900">Quick Links</h3>
          <nav className="space-y-2 flex flex-col text-base">
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Home
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Courses
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              About Us
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-blue-900">Resources</h3>
          <nav className="space-y-2 flex flex-col text-sm">
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Blog
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Support
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              FAQ
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
              Privacy Policy
            </Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-blue-900">Contact Us</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>123 Learning Lane, Knowledge City, 90210</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-900" />
              <span>+1 (123) 456-7890</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-900" />
              <span>info@edunex.com</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container text-center text-xs text-blue-600 py-6 border-t border-gray-200">
        &copy; {new Date().getFullYear()} EduNex. All rights reserved.
      </div>
    </footer>
  );
}
