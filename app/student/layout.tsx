import { StudentProtectedRoute } from "@/components/layout/StudentProtectedRoute"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { Footer } from "@/components/layout/Footer"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentProtectedRoute>
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 ml-12">
          <DashboardHeader />
          <main className="p-6 animate-fade-in-up">{children}</main>
          <Footer />
        </div>
      </div>
    </StudentProtectedRoute>
  )
}
