"use client"

import { Card } from "@/components/ui/card"
import { SignupForm } from "@/components/common/SignupForm"
import { ToggleUserTypeButton } from "@/components/common/ToggleUserTypeButton"
import { useUserType } from "@/components/layout/UserTypeContext"
import { Users, GraduationCap, ChevronRight, Star, Award, Globe } from "lucide-react"

export default function SignupPage() {
  const { userType } = useUserType()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="overflow-hidden shadow-2xl border-0 relative min-h-[700px]">
          {/* Toggle Button - Centered */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <ToggleUserTypeButton />
          </div>

          <div className="flex min-h-[700px]">
            {/* Student Layout */}
            {userType === "STUDENT" && (
              <>
                {/* Left Side - Signup Form */}
                <div className="w-1/2 flex items-center justify-center p-8 bg-white transition-all duration-500 ease-in-out transform">
                  <div className="w-full max-w-md animate-fade-in">
                    <SignupForm />
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
                    <h2 className="text-3xl font-bold">Start Your Learning Journey!</h2>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Join thousands of students worldwide and unlock your potential with 
                      our comprehensive learning platform.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-300" />
                        <span>Access 1000+ premium courses</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Award className="w-5 h-5 text-yellow-300" />
                        <span>Earn verified certificates</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Globe className="w-5 h-5 text-yellow-300" />
                        <span>Learn from global experts</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-blue-100">
                        &ldquo;EduNex transformed my career. The courses are top-notch!&rdquo; 
                        <span className="block mt-1 font-semibold">- Sarah K., Student</span>
                      </p>
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
                    <h2 className="text-3xl font-bold">Share Your Expertise!</h2>
                    <p className="text-lg text-white leading-relaxed">
                      Become an instructor and inspire learners worldwide. Create courses, 
                      build your brand, and earn while teaching.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Create unlimited courses</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Reach global audience</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <ChevronRight className="w-5 h-5 text-white" />
                        <span>Earn from your expertise</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-emerald-100">
                        &ldquo;Teaching on EduNex has been incredibly rewarding!&rdquo; 
                        <span className="block mt-1 font-semibold">- Dr. John M., Instructor</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-1/2 flex items-center justify-center p-8 bg-white transition-all duration-500 ease-in-out transform">
                  <div className="w-full max-w-md animate-fade-in">
                    <SignupForm />
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
