"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

// Define the type for userType
export type UserType = "STUDENT" | "INSTRUCTOR"

// Context value type
interface UserTypeContextValue {
  userType: UserType
  setUserType: React.Dispatch<React.SetStateAction<UserType>>
}

const USER_TYPE_STORAGE_KEY = 'selected_user_type'

const UserTypeContext = createContext<UserTypeContextValue | undefined>(undefined)

export function UserTypeProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType>("STUDENT")

  // Load user type from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem(USER_TYPE_STORAGE_KEY) as UserType
      if (storedUserType && (storedUserType === "STUDENT" || storedUserType === "INSTRUCTOR")) {
        setUserType(storedUserType)
      }
    }
  }, [])

  // Save user type to localStorage whenever it changes
  const handleSetUserType: React.Dispatch<React.SetStateAction<UserType>> = (value) => {
    setUserType(value)
    if (typeof window !== 'undefined') {
      const newUserType = typeof value === 'function' ? value(userType) : value
      localStorage.setItem(USER_TYPE_STORAGE_KEY, newUserType)
    }
  }

  return (
    <UserTypeContext.Provider value={{ userType, setUserType: handleSetUserType }}>
      {children}
    </UserTypeContext.Provider>
  )
}

export function useUserType() {
  const context = useContext(UserTypeContext)
  if (!context) {
    throw new Error("useUserType must be used within a UserTypeProvider")
  }
  return context
}
