import { Button } from "@/components/ui/button"
import { GraduationCap, Users } from "lucide-react"
import { useUserType } from "../layout/UserTypeContext"

export function ToggleUserTypeButton() {
  const { userType, setUserType } = useUserType()
  
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-full p-3 shadow-2xl border-4 border-blue-100 backdrop-blur-sm">
        <Button
          onClick={() => setUserType(userType === "STUDENT" ? "INSTRUCTOR" : "STUDENT")}
          className={`w-16 h-16 rounded-full transition-all duration-500 transform hover:scale-110 shadow-lg ${
            userType === "STUDENT" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-sky-400 hover:bg-sky-500"
          }`}
        >
          <div className="transition-transform duration-300">
            {userType === "STUDENT" ? (
              <GraduationCap className="w-8 h-8" />
            ) : (
              <Users className="w-8 h-8" />
            )}
          </div>
        </Button>
      </div>
    </div>
  )
}
