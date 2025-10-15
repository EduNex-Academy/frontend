"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { isPasswordValid, validatePassword } from "@/lib/validation/password"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import type { ProfileUpdateRequest } from "@/types"

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    bio: ""
  })

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        location: user.location || "",
        dateOfBirth: user.dateOfBirth || "",
        bio: user.bio || ""
      })
    }
  }, [user])

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    studentQuestions: true,
    assignmentSubmissions: true,
    weeklyDigest: false,
    newEnrollmentAlerts: true,
    marketingEmails: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  const handleSaveProfile = async () => {
    // Basic validation
    if (!profileData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required.",
        variant: "destructive"
      })
      return
    }

    if (!profileData.lastName.trim()) {
      toast({
        title: "Validation Error", 
        description: "Last name is required.",
        variant: "destructive"
      })
      return
    }

    setIsUpdatingProfile(true)
    
    try {
      // Prepare the data to send to the API
      const updateData: ProfileUpdateRequest = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phoneNumber: profileData.phone.trim(),
        location: profileData.location.trim(),
        dateOfBirth: profileData.dateOfBirth,
        bio: profileData.bio.trim()
      }

      await authApi.updateProfile(updateData)
      
      const updatedUser = await authApi.getUserProfile()
      updateUser(updatedUser)
      
      // Update local profile data with the latest from backend
      setProfileData({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phoneNumber || "",
        location: updatedUser.location || "",
        dateOfBirth: updatedUser.dateOfBirth || "",
        bio: updatedUser.bio || ""
      })
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
        variant: "default"
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleSavePreferences = () => {
    console.log("Saving preferences:", preferences)
    // TODO: Implement API call
    toast({
      title: "Preferences Updated",
      description: "Your notification preferences have been saved successfully.",
      variant: "default"
    })
  }

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true)
    try {
      await authApi.sendEmailVerification()
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
        variant: "default"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive"
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleChangePassword = async () => {
    // Reset previous errors
    setPasswordErrors([])

    // Validate form fields
    const errors: string[] = []
    
    if (!passwordData.currentPassword) {
      errors.push("Current password is required")
    }
    
    if (!passwordData.newPassword) {
      errors.push("New password is required")
    }
    
    if (!passwordData.confirmPassword) {
      errors.push("Please confirm your new password")
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push("New passwords do not match")
    }
    
    // Validate new password strength
    if (passwordData.newPassword && !isPasswordValid(passwordData.newPassword)) {
      const validationErrors = validatePassword(passwordData.newPassword)
      errors.push(...validationErrors.map(error => `New password: ${error}`))
    }
    
    // Check if new password is same as current password
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push("New password must be different from current password")
    }

    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsChangingPassword(true)
    
    try {
      // Use the existing auth API function
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )

      // Reset form on success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      // Show success toast
      toast({
        title: "Success",
        description: "Password changed successfully.",
        variant: "default"
      })
      
    } catch (error: any) {
      console.error("Error changing password:", error)
      setPasswordErrors([error.message || "Failed to change password. Please try again."])
      
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAvatarUpload = () => {
    console.log("Uploading avatar")
    // TODO: Implement avatar upload
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Profile</h1>
          <p className="text-gray-600">Manage your profile, notification preferences, and security settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-blue-200/30 p-1 rounded-full">
            <TabsTrigger value="profile" className="rounded-full">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-full">Preferences</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-1 border-blue-200/30 group-hover:border-blue-500/50 transition-colors cursor-pointer rounded-full overflow-hidden bg-gradient-to-br from-blue-200 to-blue-400 p-1">
                      <AvatarImage src={user?.profilePictureUrl} alt={user?.username} className="w-full h-full rounded-full object-cover bg-white" />
                      <AvatarFallback className="text-2xl font-semibold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                            disabled={true} // Email is not editable
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-blue-600">
                            {user?.emailVerified ? (
                              <span className="flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Not verified
                              </span>
                            )}
                          </span>
                          
                          {!user?.emailVerified && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-xs p-0 h-auto"
                              onClick={handleVerifyEmail}
                              disabled={isVerifyingEmail}
                            >
                              {isVerifyingEmail ? "Sending..." : "Verify Email"}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                            disabled={isUpdatingProfile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="mt-2 pl-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                </div>
                


                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="mt-2 bg-white/60 border-blue-200/50 focus:border-blue-400 min-h-[100px]"
                    placeholder="Tell students about yourself and your teaching style..."
                    disabled={isUpdatingProfile}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile || isLoadingProfile}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingProfile ? "Loading..." : isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* Notification Preferences */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'courseUpdates', label: 'Course Updates', desc: 'Updates about your courses' },
                  { key: 'studentQuestions', label: 'Student Questions', desc: 'Questions from your students' },
                  { key: 'assignmentSubmissions', label: 'Assignment Submissions', desc: 'When students submit assignments' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your course activity' },
                  { key: 'newEnrollmentAlerts', label: 'New Enrollments', desc: 'When new students enroll in your courses' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={preferences[item.key as keyof typeof preferences] as boolean}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, [item.key]: checked })}
                    />
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Password Change */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display validation errors */}
                {passwordErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="font-medium text-red-700">Please fix the following issues:</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="mt-2 pr-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isChangingPassword}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="mt-2 pr-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isChangingPassword}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {/* Show password requirements when typing new password */}
                  {passwordData.newPassword && (
                    <PasswordRequirements 
                      password={passwordData.newPassword} 
                      className="mt-2"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="mt-2 pr-10 bg-white/60 border-blue-200/50 focus:border-blue-400"
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isChangingPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {/* Show match indicator when confirming password */}
                  {passwordData.confirmPassword && (
                    <div className="mt-2 text-sm flex items-center gap-1">
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
                  <div>
                    <h3 className="font-medium text-gray-900">Login Alerts</h3>
                    <p className="text-sm text-gray-500">Receive alerts when your account is accessed from a new device</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
