"use client"

import { motion } from "framer-motion"
import type { CharacterMood } from "@/types/settings"

interface CharacterMouthProps {
  characterMood: CharacterMood
}

export const CharacterMouth = ({ characterMood }: CharacterMouthProps) => {
  return (
    <motion.div
      className="absolute left-1/2 bottom-14 transform -translate-x-1/2"
      animate={{
        y: characterMood === "shocked" ? 3 : characterMood === "disgusted" ? -2 : 0,
      }}
    >
      <motion.div
        className="bg-gray-700 rounded-full"
        animate={{
          width:
            characterMood === "excited"
              ? 36
              : characterMood === "happy"
                ? 32
                : characterMood === "shocked"
                  ? 24
                  : characterMood === "disgusted"
                    ? 20
                    : characterMood === "sad"
                      ? 18
                      : characterMood === "angry"
                        ? 28
                        : characterMood === "worried"
                          ? 16
                          : characterMood === "confused"
                            ? 14
                            : characterMood === "sleepy"
                              ? 12
                              : 20,
          height:
            characterMood === "excited"
              ? 16
              : characterMood === "happy"
                ? 14
                : characterMood === "shocked"
                  ? 20
                  : characterMood === "disgusted"
                    ? 8
                    : characterMood === "sad"
                      ? 6
                      : characterMood === "angry"
                        ? 8
                        : characterMood === "worried"
                          ? 4
                          : characterMood === "confused"
                            ? 6
                            : characterMood === "sleepy"
                              ? 4
                              : 6,
          borderRadius:
            characterMood === "excited"
              ? "18px 18px 0 0"
              : characterMood === "happy"
                ? "16px 16px 0 0"
                : characterMood === "shocked"
                  ? "50%"
                  : characterMood === "disgusted"
                    ? "0 0 20px 20px"
                    : characterMood === "sad"
                      ? "0 0 18px 18px"
                      : characterMood === "worried"
                        ? "0 0 16px 16px"
                        : characterMood === "angry"
                          ? "14px 14px 0 0"
                          : "9999px",
          rotate: characterMood === "sad" ? 180 : characterMood === "worried" ? 180 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Teeth for happy expressions */}
      {(characterMood === "happy" || characterMood === "excited") && (
        <motion.div
          className="absolute top-1 left-1/2 transform -translate-x-1/2 flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(characterMood === "excited" ? 6 : 4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-3 bg-white rounded-sm"
              animate={{ y: [0, -1.5, 0] }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Tongue for disgusted expression */}
      {characterMood === "disgusted" && (
        <motion.div
          className="absolute top-2 left-1/2 w-3 h-4 bg-pink-400 rounded-full transform -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}
