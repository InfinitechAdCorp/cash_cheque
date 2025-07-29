"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { PasswordStrength } from "@/types/settings"

interface PasswordStrengthIndicatorProps {
  passwordStrength: PasswordStrength
  password: string
}

export const PasswordStrengthIndicator = ({ passwordStrength, password }: PasswordStrengthIndicatorProps) => {
  const getBackgroundColor = () => {
    switch (passwordStrength) {
      case "excellent":
        return "#059669"
      case "strong":
        return "#10B981"
      case "good":
        return "#34D399"
      case "fair":
        return "#FCD34D"
      case "poor":
        return "#F97316"
      case "forbidden":
        return "#DC2626"
      case "terrible":
        return "#991B1B"
      case "weak":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  const getBoxShadow = () => {
    switch (passwordStrength) {
      case "excellent":
        return "0 0 30px rgba(5, 150, 105, 0.6)"
      case "strong":
        return "0 0 25px rgba(16, 185, 129, 0.5)"
      case "forbidden":
        return "0 0 25px rgba(220, 38, 38, 0.6)"
      case "terrible":
        return "0 0 25px rgba(153, 27, 27, 0.6)"
      default:
        return "0 8px 25px -5px rgba(0, 0, 0, 0.2)"
    }
  }

  const getMessage = () => {
    if (!password) return "🔐 ENTER YOUR SECRET CODE"

    switch (passwordStrength) {
      case "excellent":
        return "🏆 LEGENDARY PASSWORD! 🔐"
      case "strong":
        return "🔒 FORTRESS-LEVEL! 💪"
      case "good":
        return "✅ SOLID SECURITY! 🛡️"
      case "fair":
        return "⚡ GETTING THERE! 📈"
      case "poor":
        return "⚠️ NEEDS WORK! 🔧"
      case "forbidden":
        return "🚫 FORBIDDEN! 😡"
      case "terrible":
        return "💀 TERRIBLE! 🚨"
      default:
        return "😢 TOO WEAK! 🆘"
    }
  }

  return (
    <motion.div
      className="mt-6 px-8 py-4 rounded-full text-white font-bold text-xl shadow-2xl border-2 border-white/20"
      animate={{
        backgroundColor: getBackgroundColor(),
        scale: password ? [1, 1.08, 1] : 1,
        boxShadow: getBoxShadow(),
      }}
      transition={{
        scale: {
          repeat: password ? Number.POSITIVE_INFINITY : 0,
          repeatDelay: 2,
          duration: 0.6,
        },
        backgroundColor: { duration: 0.4 },
        boxShadow: { duration: 0.4 },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={passwordStrength}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {getMessage()}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
