import type React from "react"
import { passwordRules } from "@/lib/validation/password"

interface PasswordRequirementsProps {
  password: string
  className?: string
}

export function PasswordRequirements({ password, className = "" }: PasswordRequirementsProps) {
  return (
    <div className={`mt-1 p-1.5 bg-gray-50/50 rounded ${className}`}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {passwordRules.map((rule) => {
          const isValid = rule.test(password)
          return (
            <li
              key={rule.id}
              className={`text-xs flex items-center ${
                isValid ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span className="mr-1 text-xs">{isValid ? '✓' : '✗'}</span>
              {rule.label}
            </li>
          )
        })}
        {!/[A-Z]/.test(password) && password.length > 0 && (
          <li className="text-xs flex items-center text-yellow-600 col-span-2">
            <span className="mr-1 text-xs">!</span>
            Your password does not contain an uppercase letter.
          </li>
        )}
      </ul>
    </div>
  )
}
