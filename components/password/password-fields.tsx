"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PasswordData, PasswordStrength } from "@/types/settings"

interface PasswordFieldsProps {
  passwordData: PasswordData
  setPasswordData: (data: PasswordData) => void
  passwordStrength: PasswordStrength
  passwordsMatch: boolean
  eyesClosed: boolean
  setIsTyping: (typing: boolean) => void
  setIsPasswordFocused: (focused: boolean) => void
  setIsConfirmFocused: (focused: boolean) => void
  setIsFocused: (focused: boolean) => void
}

export const PasswordFields = ({
  passwordData,
  setPasswordData,
  passwordStrength,
  passwordsMatch,
  eyesClosed,
  setIsTyping,
  setIsPasswordFocused,
  setIsConfirmFocused,
  setIsFocused,
}: PasswordFieldsProps) => {
  return (
    <div className="space-y-6 relative z-10">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-gray-700 font-medium text-lg">
          Current Password
        </Label>
        <Input
          id="currentPassword"
          type={eyesClosed ? "password" : "text"}
          value={passwordData.currentPassword}
          onChange={(e) => {
            setPasswordData({ ...passwordData, currentPassword: e.target.value })
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 500)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-300/50 transition-all rounded-xl px-6 py-4 text-lg shadow-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-gray-700 font-medium text-lg">
          New Password
        </Label>
        <Input
          id="newPassword"
          type={eyesClosed ? "password" : "text"}
          value={passwordData.newPassword}
          onChange={(e) => {
            setPasswordData({ ...passwordData, newPassword: e.target.value })
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 500)
          }}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-300/50 transition-all rounded-xl px-6 py-4 text-lg shadow-lg"
        />

        {/* Password Strength Bar */}
        {passwordData.newPassword && (
          <motion.div
            className="h-3 mt-2 rounded-full overflow-hidden bg-gray-200 shadow-inner"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="h-full relative overflow-hidden"
              animate={{
                width:
                  passwordStrength === "excellent"
                    ? "100%"
                    : passwordStrength === "strong"
                      ? "90%"
                      : passwordStrength === "good"
                        ? "75%"
                        : passwordStrength === "fair"
                          ? "60%"
                          : passwordStrength === "poor"
                            ? "40%"
                            : passwordStrength === "weak"
                              ? "25%"
                              : "100%",
                backgroundColor:
                  passwordStrength === "excellent"
                    ? "#059669"
                    : passwordStrength === "strong"
                      ? "#10B981"
                      : passwordStrength === "good"
                        ? "#34D399"
                        : passwordStrength === "fair"
                          ? "#FCD34D"
                          : passwordStrength === "poor"
                            ? "#F97316"
                            : passwordStrength === "forbidden"
                              ? "#DC2626"
                              : passwordStrength === "terrible"
                                ? "#991B1B"
                                : "#EF4444",
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1.5,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-lg">
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={eyesClosed ? "password" : "text"}
            value={passwordData.confirmPassword}
            onChange={(e) => {
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              setIsTyping(true)
              setTimeout(() => setIsTyping(false), 500)
            }}
            onFocus={() => setIsConfirmFocused(true)}
            onBlur={() => setIsConfirmFocused(false)}
            className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-300/50 transition-all rounded-xl px-6 py-4 text-lg shadow-lg"
          />

          {/* Password Match Indicator */}
          {passwordData.confirmPassword && (
            <motion.div
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {passwordsMatch ? (
                <motion.div
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-white"
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(16, 185, 129, 0.8)",
                      "0 0 0 15px rgba(16, 185, 129, 0)",
                      "0 0 0 0 rgba(16, 185, 129, 0)",
                    ],
                  }}
                  transition={{
                    scale: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 },
                    boxShadow: { duration: 1.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 },
                  }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </motion.div>
              ) : (
                <motion.div
                  className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-white"
                  animate={{
                    rotate: [0, 15, -15, 0],
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.8)",
                      "0 0 0 15px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)",
                    ],
                  }}
                  transition={{
                    rotate: { duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 },
                    boxShadow: { duration: 1.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 },
                  }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
