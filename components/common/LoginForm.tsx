import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserType } from "../layout/UserTypeContext"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { SessionTokenManager } from "@/lib/auth/tokens/session-manager"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const { userType } = useUserType()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.auth.login(formData.email, formData.password)

      // check if userType matches the response user type
      if (response.user.role !== userType) {
        toast({
          title: "Error",
          description: "User type mismatch. Please select the correct user type.",
          variant: "destructive",
        })
        return
      }

      // Only pass accessToken, tokenType, expiresIn, and user (no refreshToken)
      login({
        accessToken: response.accessToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
        user: response.user
      })

      // Store access token in session storage
      SessionTokenManager.setAccessToken(
        response.accessToken,
        response.tokenType,
        response.expiresIn
      )

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Redirect based on user type
      if (userType === "STUDENT") {
        router.push("/student/dashboard")
      } else {
        router.push("/instructor/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      // This will redirect to Google OAuth, so no response handling needed here
      await api.auth.loginWithGoogle(userType)
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Google login failed",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
    // Note: setIsGoogleLoading(false) is not called on success because the page will redirect
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Only render the form for the active userType
  if (userType === "STUDENT") {
    return (
      <div className="h-full flex flex-col justify-center">
        <CardHeader className="px-0 pb-6">
          <CardTitle className="text-2xl font-bold text-blue-900 text-center">Welcome Back, Student!</CardTitle>
          <p className="text-gray-600 text-center">Continue your learning journey</p>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input id="email" name="email" type="email" placeholder="student@example.com" value={formData.email} onChange={handleInputChange} className="h-10 w-full border rounded px-3" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} className="h-10 w-full border rounded px-3 pr-12" required />
                <button type="button" className="absolute right-0 top-0 h-10 px-3 text-sm text-gray-600 hover:text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="ml-auto inline-block text-xs underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">
              Log In as Student
            </Button>
          </form>
          <div className="mt-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 h-9 bg-transparent"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              <span className="text-sm">Continue with Google</span>
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </div>
    )
  }

  // Instructor form
  return (
    <div className="h-full flex flex-col justify-center">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold text-blue-900 text-center">Welcome Back, Instructor!</CardTitle>
        <p className="text-gray-600 text-center">Manage your courses and students</p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input id="email" name="email" type="email" placeholder="instructor@example.com" value={formData.email} onChange={handleInputChange} className="h-10 w-full border rounded px-3" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} className="h-10 w-full border rounded px-3 pr-12" required />
              <button type="button" className="absolute right-0 top-0 h-10 px-3 text-sm text-gray-600 hover:text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link href="/auth/forgot-password" className="ml-auto inline-block text-xs underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">
            Sign In as Instructor
          </Button>
        </form>
        <div className="mt-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-3 h-9 bg-transparent"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span className="text-sm">Continue with Google</span>
          </Button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">Sign up</Link>
          </p>
        </div>
      </CardContent>
    </div>
  )
}
