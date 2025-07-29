"use client"

import { motion } from "framer-motion"
import { Settings, Shield } from "lucide-react"
import type { PasswordStrength } from "@/types/settings"

interface PasswordControlsProps {
  eyesClosed: boolean
  setEyesClosed: (closed: boolean) => void
  handlePasswordChange: () => void
  isLoading: boolean
  passwordStrength: PasswordStrength
}

export const PasswordControls = ({
  eyesClosed,
  setEyesClosed,
  handlePasswordChange,
  isLoading,
  passwordStrength,
}: PasswordControlsProps) => {
  return (
    <>
      {/* Toggle Password Visibility */}
      <div className="mt-8 flex justify-center relative z-10">
        <motion.button
          type="button"
          onClick={() => setEyesClosed(!eyesClosed)}
          className="flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm rounded-full border-2 border-gray-200 hover:border-purple-400 transition-all shadow-xl font-bold text-lg"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: eyesClosed ? "0 0 30px rgba(139, 92, 246, 0.4)" : "0 8px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <motion.span animate={{ color: eyesClosed ? "#8B5CF6" : "#374151" }} className="mr-4">
            {eyesClosed ? "👁️ Show Password" : "🙈 Hide Password"}
          </motion.span>
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            animate={{
              backgroundColor: eyesClosed ? "#8B5CF6" : "#10B981",
              rotate: eyesClosed ? 180 : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-inner"
              animate={{
                scale: eyesClosed ? 0.6 : 1,
                opacity: eyesClosed ? 0.8 : 1,
              }}
            />
          </motion.div>
        </motion.button>
      </div>

      {/* Update Button */}
      <motion.button
        onClick={handlePasswordChange}
        disabled={isLoading || passwordStrength === "forbidden" || passwordStrength === "terrible"}
        className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-10 rounded-xl shadow-2xl transition-all relative z-10 overflow-hidden text-xl"
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow:
            passwordStrength === "excellent"
              ? "0 0 40px rgba(5, 150, 105, 0.5)"
              : passwordStrength === "strong"
                ? "0 0 35px rgba(16, 185, 129, 0.4)"
                : passwordStrength === "forbidden" || passwordStrength === "terrible"
                  ? "0 0 35px rgba(220, 38, 38, 0.4)"
                  : "0 15px 35px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span className="relative z-10 flex items-center justify-center">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="mr-4"
            >
              <Settings className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div
              animate={{
                scale:
                  passwordStrength === "excellent" ? [1, 1.15, 1] : passwordStrength === "strong" ? [1, 1.1, 1] : 1,
                rotate: passwordStrength === "forbidden" || passwordStrength === "terrible" ? [0, 8, -8, 0] : 0,
              }}
              transition={{
                scale: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 },
                rotate: { duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 },
              }}
              className="mr-4"
            >
              <Shield className="h-7 w-7" />
            </motion.div>
          )}
          {passwordStrength === "forbidden" || passwordStrength === "terrible"
            ? "Choose Different Password"
            : "Update Password"}
        </span>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-600"
          animate={{
            x: ["0%", "100%", "0%"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      </motion.button>
    </>
  )
}
