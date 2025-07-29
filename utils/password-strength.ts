import { WEAK_PASSWORDS, KEYBOARD_PATTERNS } from "@/constants/password-validation"
import type { PasswordStrength } from "@/types/settings"

export const checkPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return "empty"

  const lowerPassword = password.toLowerCase()

  // Check for forbidden/common passwords
  if (WEAK_PASSWORDS.some((weak) => lowerPassword.includes(weak))) {
    return "forbidden"
  }

  // Check for keyboard patterns
  if (KEYBOARD_PATTERNS.some((pattern) => lowerPassword.includes(pattern))) {
    return "terrible"
  }

  // Check for sequential patterns
  const hasSequential = /123|abc|qwe|asd|zxc|987|fed|cba/i.test(password)
  if (hasSequential) return "terrible"

  // Check for repeated characters (3 or more)
  const hasRepeated = /(.)\1{2,}/.test(password)
  if (hasRepeated) return "poor"

  // Check for simple patterns like "abab" or "1212"
  const hasSimplePattern = /(..).*\1/.test(password) || /(\w)\1/.test(password)
  if (hasSimplePattern && password.length < 10) return "poor"

  // Check for only numbers or only letters
  const onlyNumbers = /^\d+$/.test(password)
  const onlyLetters = /^[a-zA-Z]+$/.test(password)
  if (onlyNumbers || onlyLetters) return "weak"

  // Check for personal info patterns
  const hasPersonalInfo = /john|jane|admin|user|guest|test|demo|2023|2024|birth|name/i.test(password)
  if (hasPersonalInfo) return "poor"

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const isLongEnough = password.length >= 8
  const isVeryLong = password.length >= 12
  const isExtraLong = password.length >= 16
  const hasMultipleSpecial = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2

  const score = [
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
    isLongEnough,
    isVeryLong,
    isExtraLong,
    hasMultipleSpecial,
  ].filter(Boolean).length

  if (score <= 2) return "weak"
  if (score <= 3) return "poor"
  if (score <= 4) return "fair"
  if (score <= 5) return "good"
  if (score <= 6) return "strong"
  return "excellent"
}
