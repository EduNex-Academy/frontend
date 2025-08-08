import { StudentProtectedRoute } from "@/components/layout/StudentProtectedRoute"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentProtectedRoute>
      {children}
    </StudentProtectedRoute>
  )
}
