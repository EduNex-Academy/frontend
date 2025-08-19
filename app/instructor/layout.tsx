import { InstructorProtectedRoute } from "@/components/layout/InstructorProtectedRoute"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { Footer } from "@/components/layout/Footer"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InstructorProtectedRoute>
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 ml-12">
          <DashboardHeader />
          <main className="p-6 animate-fade-in-up">{children}</main>
          <Footer />
        </div>
      </div>
    </InstructorProtectedRoute>
  )
}
