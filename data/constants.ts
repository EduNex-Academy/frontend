import { BookOpen, Users, Award } from "lucide-react"
import { Feature, Testimonial, StatItem, NavigationItem, FooterSection } from "@/types/components"

export const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with real-world experience",
  },
  {
    icon: Users,
    title: "Interactive Learning",
    description: "Engage with instructors and fellow students in live sessions",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn recognized certificates to boost your career prospects",
  },
]

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    content: "EduNex transformed my career. The courses are practical and the instructors are amazing!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Marketing Manager",
    content: "The progress tracking and certificates helped me advance in my current role.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "UX Designer",
    content: "Best online learning platform I've used. Highly recommend!",
    rating: 5,
  },
]

export const stats: StatItem[] = [
  { value: "50K+", label: "Active Students" },
  { value: "1,200+", label: "Expert Instructors" },
  { value: "5,000+", label: "Courses Available" },
  { value: "98%", label: "Completion Rate" },
]

export const navigationItems: NavigationItem[] = [
  { label: "Features", href: "#features" },
  // { label: "Courses", href: "#courses" },
  { label: "Testimonials", href: "#testimonials" },
]

export const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Instructors", href: "/instructors" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
]
