"use client"

import { motion } from "framer-motion"
import { CharacterHead } from "./character-head"
import type { CharacterMood } from "@/types/settings"

interface CharacterBodyProps {
  characterMood: CharacterMood
  eyesClosed: boolean
  isTyping: boolean
  isPasswordFocused: boolean
  isConfirmFocused: boolean
}

export const CharacterBody = ({
  characterMood,
  eyesClosed,
  isTyping,
  isPasswordFocused,
  isConfirmFocused,
}: CharacterBodyProps) => {
  return (
    <div className="relative w-64 h-64">
      {/* Body */}
      <motion.div
        className="absolute w-48 h-48 bg-white rounded-full left-8 top-8 shadow-2xl"
        animate={{
          scale: [1, 1.03, 1],
          y: isPasswordFocused || isConfirmFocused ? -10 : 0,
        }}
        transition={{
          scale: { duration: 4, repeat: Number.POSITIVE_INFINITY },
          y: { type: "spring", stiffness: 300, damping: 15 },
        }}
      />

      <CharacterHead
        characterMood={characterMood}
        eyesClosed={eyesClosed}
        isTyping={isTyping}
        isPasswordFocused={isPasswordFocused}
        isConfirmFocused={isConfirmFocused}
      />

      {/* Ears */}
      <motion.div
        className="absolute w-14 h-14 bg-white rounded-full left-1 top-14 shadow-lg border-2 border-gray-100"
        animate={{
          rotate: [0, 8, -8, 0],
          scale: isPasswordFocused || isConfirmFocused ? 1.15 : 1,
        }}
        transition={{
          rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY },
          scale: { type: "spring", stiffness: 300, damping: 15 },
        }}
      />
      <motion.div
        className="absolute w-14 h-14 bg-white rounded-full right-1 top-14 shadow-lg border-2 border-gray-100"
        animate={{
          rotate: [0, -8, 8, 0],
          scale: isPasswordFocused || isConfirmFocused ? 1.15 : 1,
        }}
        transition={{
          rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY },
          scale: { type: "spring", stiffness: 300, damping: 15 },
        }}
      />

      {/* Scarf */}
      <motion.div
        className="absolute w-52 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full left-6 top-40 shadow-xl"
        animate={{
          y: [0, 3, 0],
          scaleX: [1, 1.03, 1],
          background: [
            "linear-gradient(to right, #EC4899, #8B5CF6)",
            "linear-gradient(to right, #8B5CF6, #3B82F6)",
            "linear-gradient(to right, #3B82F6, #10B981)",
            "linear-gradient(to right, #10B981, #EC4899)",
            "linear-gradient(to right, #EC4899, #8B5CF6)",
          ],
        }}
        transition={{
          y: { duration: 3, repeat: Number.POSITIVE_INFINITY },
          scaleX: { duration: 3, repeat: Number.POSITIVE_INFINITY },
          background: { duration: 6, repeat: Number.POSITIVE_INFINITY },
        }}
      />
    </div>
  )
}
