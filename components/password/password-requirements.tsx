"use client"

import { motion } from "framer-motion"
import { WEAK_PASSWORDS, KEYBOARD_PATTERNS } from "@/constants/password-validation"

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements = [
    { test: password.length >= 8, text: "At least 8 characters", icon: "📏" },
    { test: password.length >= 12, text: "12+ characters (stronger)", icon: "📐" },
    { test: /[a-z]/.test(password), text: "Lowercase letter", icon: "🔤" },
    { test: /[A-Z]/.test(password), text: "Uppercase letter", icon: "🔠" },
    { test: /[0-9]/.test(password), text: "Number", icon: "🔢" },
    { test: /[^A-Za-z0-9]/.test(password), text: "Special character", icon: "🔣" },
    {
      test: !WEAK_PASSWORDS.some((weak) => password.toLowerCase().includes(weak)),
      text: "Not a common password",
      icon: "🚫",
    },
    {
      test: !KEYBOARD_PATTERNS.some((pattern) => password.toLowerCase().includes(pattern)),
      text: "No keyboard patterns",
      icon: "⌨️",
    },
    { test: !/(.)\1{2,}/.test(password), text: "No repeated characters", icon: "🔄" },
    { test: !/123|abc|qwe|asd|zxc/i.test(password), text: "No sequences", icon: "➡️" },
  ]

  if (!password) return null

  return (
    <motion.div
      className="mt-8 p-6 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-gray-200 shadow-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h4 className="font-bold text-gray-800 mb-4 text-lg">Password Security Requirements:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                req.test ? "bg-green-500" : "bg-gray-400"
              }`}
              animate={{
                scale: req.test ? [1, 1.3, 1] : 1,
                backgroundColor: req.test ? "#10B981" : "#9CA3AF",
                boxShadow: req.test ? "0 0 15px rgba(16, 185, 129, 0.3)" : "none",
              }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {req.test ? (
                <motion.svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0, scale: 0 }}
                  animate={{ pathLength: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <span className="text-xs">✗</span>
              )}
            </motion.div>
            <span className="text-base">
              <span className="mr-2">{req.icon}</span>
              <span className={req.test ? "text-green-700 font-medium" : "text-gray-600"}>{req.text}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
