// Component Props Types
export interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface TestimonialCardProps {
  name: string
  role: string
  content: string
  rating: number
}

export interface HeroSectionProps {
  isVisible: boolean
}

// Data Types
export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

export interface StatItem {
  value: string
  label: string
}

// Navigation Types
export interface NavigationItem {
  label: string
  href: string
  external?: boolean
}

export interface FooterSection {
  title: string
  links: NavigationItem[]
}
