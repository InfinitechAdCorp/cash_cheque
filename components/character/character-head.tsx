"use client"

import { motion } from "framer-motion"
import { CharacterEyes } from "./character-eyes"
import { CharacterMouth } from "./character-mouth"
import { CharacterEmotions } from "./character-emotions"
import { RealisticHand } from "./realistic-hand"
import type { CharacterMood } from "@/types/settings"

interface CharacterHeadProps {
  characterMood: CharacterMood
  eyesClosed: boolean
  isTyping: boolean
  isPasswordFocused: boolean
  isConfirmFocused: boolean
}

export const CharacterHead = ({
  characterMood,
  eyesClosed,
  isTyping,
  isPasswordFocused,
  isConfirmFocused,
}: CharacterHeadProps) => {
  return (
    <motion.div
      className="absolute w-44 h-44 bg-white rounded-full left-10 top-2 shadow-2xl border-2 border-gray-100"
      animate={{
        y: isPasswordFocused || isConfirmFocused ? -12 : 0,
        rotate:
          characterMood === "excited"
            ? [0, 3, -3, 0]
            : characterMood === "happy"
              ? [0, 2, -2, 0]
              : characterMood === "confused"
                ? [0, -2, 2, 0]
                : characterMood === "worried"
                  ? [0, 1, -1, 0]
                  : 0,
        scale: characterMood === "shocked" ? [1, 1.1, 1] : characterMood === "excited" ? [1, 1.05, 1] : 1,
      }}
      transition={{
        y: { type: "spring", stiffness: 300, damping: 15 },
        rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY },
        scale: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 },
      }}
    >
      <div className="relative w-full h-full">
        <CharacterEyes characterMood={characterMood} eyesClosed={eyesClosed} isTyping={isTyping} />

        {/* Eyebrows */}
        <motion.div
          className="absolute w-14 h-4 bg-gray-700 rounded-full left-9 top-12"
          animate={{
            rotate:
              characterMood === "angry"
                ? -25
                : characterMood === "disgusted"
                  ? -20
                  : characterMood === "worried"
                    ? -12
                    : characterMood === "sad"
                      ? -8
                      : characterMood === "confused"
                        ? -5
                        : characterMood === "excited"
                          ? 8
                          : characterMood === "happy"
                            ? 5
                            : 0,
            y: characterMood === "angry" ? -4 : characterMood === "shocked" ? -6 : characterMood === "excited" ? -2 : 0,
          }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className="absolute w-14 h-4 bg-gray-700 rounded-full right-9 top-12"
          animate={{
            rotate:
              characterMood === "angry"
                ? 25
                : characterMood === "disgusted"
                  ? 20
                  : characterMood === "worried"
                    ? 12
                    : characterMood === "sad"
                      ? 8
                      : characterMood === "confused"
                        ? 5
                        : characterMood === "excited"
                          ? -8
                          : characterMood === "happy"
                            ? -5
                            : 0,
            y: characterMood === "angry" ? -4 : characterMood === "shocked" ? -6 : characterMood === "excited" ? -2 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Nose */}
        <motion.div
          className="absolute w-4 h-3 bg-gray-600 rounded-full left-1/2 top-22 transform -translate-x-1/2"
          animate={{
            scale: [1, 1.15, 1],
            y: characterMood === "angry" ? -2 : characterMood === "disgusted" ? -1 : 0,
          }}
          transition={{
            scale: { duration: 3, repeat: Number.POSITIVE_INFINITY },
            y: { duration: 0.4 },
          }}
        />

        <CharacterMouth characterMood={characterMood} />
        <RealisticHand isLeft={true} isVisible={eyesClosed} />
        <RealisticHand isLeft={false} isVisible={eyesClosed} />
        <CharacterEmotions characterMood={characterMood} />
      </div>
    </motion.div>
  )
}
