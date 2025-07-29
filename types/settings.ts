import type React from "react"
export interface SettingsSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

export type CharacterMood =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "shocked"
  | "confused"
  | "sleepy"
  | "excited"
  | "worried"
  | "disgusted"

export type PasswordStrength =
  | "empty"
  | "terrible"
  | "weak"
  | "forbidden"
  | "poor"
  | "fair"
  | "good"
  | "strong"
  | "excellent"

export interface ProfileData {
  name: string
  email: string
  role: string
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
