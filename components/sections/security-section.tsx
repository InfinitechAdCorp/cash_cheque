"use client"

import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/character/animated-background"
import { CharacterBody } from "@/components/character/character-body"
import { PasswordStrengthIndicator } from "@/components/password/password-strength-indicator"
import { PasswordFields } from "@/components/password/password-fields"
import { PasswordControls } from "@/components/password/password-controls"
import { PasswordRequirements } from "@/components/password/password-requirements"
import type { CharacterMood, PasswordData, PasswordStrength } from "@/types/settings"
import { useToast } from "@/hooks/use-toast"

interface SecuritySectionProps {
  characterMood: CharacterMood
  eyesClosed: boolean
  isTyping: boolean
  isPasswordFocused: boolean
  isConfirmFocused: boolean
  passwordData: PasswordData
  setPasswordData: (data: PasswordData) => void
  passwordStrength: PasswordStrength
  passwordsMatch: boolean
  setIsTyping: (typing: boolean) => void
  setIsPasswordFocused: (focused: boolean) => void
  setIsConfirmFocused: (focused: boolean) => void
  setIsFocused: (focused: boolean) => void
  setEyesClosed: (closed: boolean) => void
  handlePasswordChange: () => Promise<void>
  isLoading: boolean
}

export const SecuritySection = ({
  characterMood,
  eyesClosed,
  isTyping,
  isPasswordFocused,
  isConfirmFocused,
  passwordData,
  setPasswordData,
  passwordStrength,
  passwordsMatch,
  setIsTyping,
  setIsPasswordFocused,
  setIsConfirmFocused,
  setIsFocused,
  setEyesClosed,
  handlePasswordChange,
  isLoading,
}: SecuritySectionProps) => {
  const { toast } = useToast()

  const validateAndChangePassword = async () => {
    console.log("SecuritySection validateAndChangePassword called with:", {
      currentPassword: passwordData.currentPassword ? "***" : "EMPTY",
      newPassword: passwordData.newPassword ? "***" : "EMPTY",
      confirmPassword: passwordData.confirmPassword ? "***" : "EMPTY",
      currentPasswordLength: passwordData.currentPassword?.length,
      newPasswordLength: passwordData.newPassword?.length,
      confirmPasswordLength: passwordData.confirmPassword?.length,
      passwordStrength,
      passwordsMatch,
    })

    if (passwordStrength === "forbidden" || passwordStrength === "terrible") {
      console.log("Password rejected due to strength:", passwordStrength)
      toast({
        title: "Password Not Allowed",
        description:
          "This password is too common, contains patterns, or is easy to guess. Please choose a more secure password.",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength === "weak" || passwordStrength === "poor") {
      console.log("Password rejected due to weakness:", passwordStrength)
      toast({
        title: "Password Too Weak",
        description: "Your password needs to be stronger. Add more character types and length.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.log("Password confirmation mismatch")
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      console.log("Password too short:", passwordData.newPassword.length)
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    console.log("All validations passed, calling handlePasswordChange")
    await handlePasswordChange()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 relative overflow-hidden">
        <AnimatedBackground />

        {/* Character Container */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <CharacterBody
            characterMood={characterMood}
            eyesClosed={eyesClosed}
            isTyping={isTyping}
            isPasswordFocused={isPasswordFocused}
            isConfirmFocused={isConfirmFocused}
          />

          <PasswordStrengthIndicator passwordStrength={passwordStrength} password={passwordData.newPassword} />
        </div>

        <PasswordFields
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          passwordStrength={passwordStrength}
          passwordsMatch={passwordsMatch}
          eyesClosed={eyesClosed}
          setIsTyping={setIsTyping}
          setIsPasswordFocused={setIsPasswordFocused}
          setIsConfirmFocused={setIsConfirmFocused}
          setIsFocused={setIsFocused}
        />

        <PasswordControls
          eyesClosed={eyesClosed}
          setEyesClosed={setEyesClosed}
          handlePasswordChange={validateAndChangePassword}
          isLoading={isLoading}
          passwordStrength={passwordStrength}
        />

        <PasswordRequirements password={passwordData.newPassword} />
      </div>
    </motion.div>
  )
}
