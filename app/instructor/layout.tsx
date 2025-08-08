import { InstructorProtectedRoute } from "@/components/layout/InstructorProtectedRoute"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InstructorProtectedRoute>
      {children}
    </InstructorProtectedRoute>
  )
}
