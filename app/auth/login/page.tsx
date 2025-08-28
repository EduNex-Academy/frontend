"use client"

import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/common/LoginForm"
import { ToggleUserTypeButton } from "@/components/common/ToggleUserTypeButton"
import { useUserType } from "@/components/layout/UserTypeContext"
import { Users, GraduationCap, ChevronRight } from "lucide-react"

export default function LoginPage() {
  const { userType } = useUserType()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="overflow-hidden shadow-md border-0 relative h-[600px]">
          {/* Toggle Button - Centered */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <ToggleUserTypeButton />
          </div>

          <div className="flex h-full">
            {/* Student Layout */}
            {userType === "STUDENT" && (
              <>
                {/* Left Side - Login Form */}
                <div className="w-1/2 flex items-center justify-center p-8 bg-white transition-all duration-500 ease-in-out transform">
                  <div className="w-full max-w-md animate-fade-in">
                    <LoginForm />
                  </div>
                </div>

                {/* Right Side - Description */}
                <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-8 text-white transition-all duration-500 ease-in-out">
                  <div className="text-center space-y-6 animate-slide-in-right">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <GraduationCap className="w-10 h-10" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold">Welcome Back, Learner!</h2>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Continue your educational journey with access to thousands of courses, 
                      track your progress, and achieve your learning goals.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-blue-300" />
                        <span>Access to premium courses</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-blue-300" />
                        <span>Track your learning progress</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-blue-300" />
                        <span>Earn certificates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Instructor Layout */}
            {userType === "INSTRUCTOR" && (
              <>
                {/* Left Side - Description */}
                <div className="w-1/2 bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center p-8 text-white transition-all duration-500 ease-in-out">
                  <div className="text-center space-y-6 animate-slide-in-left">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Users className="w-10 h-10" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold">Welcome Back, Educator!</h2>
                    <p className="text-lg text-white leading-relaxed">
                      Manage your courses, engage with students, and make a difference 
                      in the lives of learners around the world.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Create and manage courses</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Engage with students</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Track student progress</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-1/2 flex items-center justify-center p-8 bg-white transition-all duration-500 ease-in-out transform">
                  <div className="w-full max-w-md animate-fade-in">
                    <LoginForm />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
