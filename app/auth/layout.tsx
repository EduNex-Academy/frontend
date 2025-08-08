import { Header } from "@/components/layout/Header"
import { UserTypeProvider } from "@/components/layout/UserTypeContext"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <UserTypeProvider>
            <Header showNavigation={false} />
            {children}
        </UserTypeProvider>
    )
}