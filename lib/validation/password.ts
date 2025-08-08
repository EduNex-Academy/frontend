/**
 * Password validation utilities
 */

export interface PasswordValidationRule {
  id: string
  label: string
  test: (password: string) => boolean
  errorMessage: string
}

export const passwordRules: PasswordValidationRule[] = [
  {
    id: "minLength",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
    errorMessage: "At least 8 characters long"
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
    errorMessage: "At least one uppercase letter"
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
    errorMessage: "At least one lowercase letter"
  },
  {
    id: "number",
    label: "At least one number",
    test: (password: string) => /\d/.test(password),
    errorMessage: "At least one number"
  },
  {
    id: "specialChar",
    label: "At least one special character",
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    errorMessage: "At least one special character"
  }
]

/**
 * Validate password against all rules and return error messages
 */
export function validatePassword(password: string): string[] {
  return passwordRules
    .filter(rule => !rule.test(password))
    .map(rule => rule.errorMessage)
}

/**
 * Check if password meets all validation requirements
 */
export function isPasswordValid(password: string): boolean {
  return passwordRules.every(rule => rule.test(password))
}

/**
 * Get password strength score (0-100)
 */
export function getPasswordStrength(password: string): number {
  const passedRules = passwordRules.filter(rule => rule.test(password)).length
  return Math.round((passedRules / passwordRules.length) * 100)
}

/**
 * Get password strength level
 */
export function getPasswordStrengthLevel(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const strength = getPasswordStrength(password)
  
  if (strength < 40) return 'weak'
  if (strength < 60) return 'fair'
  if (strength < 80) return 'good'
  return 'strong'
}
