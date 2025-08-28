import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserType } from "../layout/UserTypeContext"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { validatePassword, isPasswordValid } from "@/lib/validation/password"
import { api } from "@/lib/api"
import { SessionTokenManager } from "@/lib/auth/tokens/session-manager"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SignupForm() {
  const { userType } = useUserType()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password
    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Password Error",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      })
      return
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await api.auth.register({
        username: formData.email, // Using email as username
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: "", // Optional, can be added later
        role: userType, // Use userType from context
      })

      // Handle the new API response structure
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
        description: "Account created successfully",
      })

      // check if userType matches the response user type
      if (response.user.role !== userType) {
        toast({
          title: "Error",
          description: "User type mismatch. Please select the correct user type.",
          variant: "destructive",
        })
        return
      }

      // Redirect based on user type
      if (userType === "STUDENT") {
        router.push("/student/dashboard")
      } else {
        router.push("/instructor/dashboard")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    let newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    }

    // If password field changes, validate password
    if (name === "password") {
      const errors = validatePassword(value)
      setPasswordErrors(errors)
    }
    setFormData(newFormData)
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    try {
      // This will redirect to Google OAuth, so no response handling needed here
      await api.auth.loginWithGoogle(userType)
    } catch (error) {
      console.error("Google signup error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Google signup failed",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
    // Note: setIsGoogleLoading(false) is not called on success because the page will redirect
  }


  // Only render the form for the active userType
  if (userType === "STUDENT") {
    return (
      <div className="h-full flex flex-col justify-center">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-2xl font-bold text-blue-900 text-center">Join as a Student</CardTitle>
          <p className="text-gray-600 text-center text-sm">Start your learning journey today</p>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
              </div>
              <div className="space-y-1">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input id="email" name="email" type="email" placeholder="student@example.com" value={formData.email} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={handleInputChange} className="h-9 w-full border rounded px-3 pr-12 text-sm" required />
                <button type="button" className="absolute right-0 top-0 h-9 px-3 text-xs text-gray-600 hover:text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordRequirements password={formData.password} />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} className="h-9 w-full border rounded px-3 pr-12 text-sm" required />
                <button type="button" className="absolute right-0 top-0 h-9 px-3 text-xs text-gray-600 hover:text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center">
                  <span className="mr-1">✗</span>
                  Passwords do not match
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-green-600 flex items-center">
                  <span className="mr-1">✓</span>
                  Passwords match
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" checked={formData.agreeToTerms} onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })} />
              <label htmlFor="terms" className="text-xs">
                I agree to the <Link href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and <Link href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
              </label>
            </div>
            <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-sm">
              Create Student Account
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
              onClick={handleGoogleSignup}
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
            <p className="text-gray-600 text-xs">
              Already have an account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </div>
    )
  }

  // Instructor form
  return (
    <div className="h-full flex flex-col justify-center">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-bold text-blue-900 text-center">Join as an Instructor</CardTitle>
        <p className="text-gray-600 text-center text-sm">Share your knowledge with the world</p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
              <input id="firstName" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
              <input id="lastName" name="lastName" placeholder="Smith" value={formData.lastName} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input id="email" name="email" type="email" placeholder="instructor@example.com" value={formData.email} onChange={handleInputChange} className="h-9 w-full border rounded px-3 text-sm" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={handleInputChange} className="h-9 w-full border rounded px-3 pr-12 text-sm" required />
              <button type="button" className="absolute right-0 top-0 h-9 px-3 text-xs text-gray-600 hover:text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <PasswordRequirements password={formData.password} />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} className="h-9 w-full border rounded px-3 pr-12 text-sm" required />
              <button type="button" className="absolute right-0 top-0 h-9 px-3 text-xs text-gray-600 hover:text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600 flex items-center">
                <span className="mr-1">✗</span>
                Passwords do not match
              </p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
              <p className="text-xs text-green-600 flex items-center">
                <span className="mr-1">✓</span>
                Passwords match
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" checked={formData.agreeToTerms} onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })} />
            <label htmlFor="terms" className="text-xs">
              I agree to the <Link href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and <Link href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
            </label>
          </div>
          <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-sm">
            Create Instructor Account
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
            onClick={handleGoogleSignup}
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
          <p className="text-gray-600 text-xs">
            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </p>
        </div>
      </CardContent>
    </div>
  )
}
