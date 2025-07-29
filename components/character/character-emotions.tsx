"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { CharacterMood } from "@/types/settings"

interface CharacterEmotionsProps {
  characterMood: CharacterMood
}

export const CharacterEmotions = ({ characterMood }: CharacterEmotionsProps) => {
  return (
    <>
      {/* Blush for happy/excited moods */}
      <AnimatePresence>
        {(characterMood === "happy" || characterMood === "excited") && (
          <>
            <motion.div
              className="absolute w-8 h-6 bg-pink-300 rounded-full left-6 top-24 opacity-60"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: characterMood === "excited" ? [1, 1.1, 1] : 1,
                opacity: 0.6,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                opacity: { duration: 0.3 },
              }}
            />
            <motion.div
              className="absolute w-8 h-6 bg-pink-300 rounded-full right-6 top-24 opacity-60"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: characterMood === "excited" ? [1, 1.1, 1] : 1,
                opacity: 0.6,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                opacity: { duration: 0.3 },
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Sweat drops for stress/anger */}
      <AnimatePresence>
        {(characterMood === "angry" || characterMood === "worried" || characterMood === "disgusted") && (
          <>
            {[...Array(characterMood === "angry" ? 3 : 2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-5 bg-blue-400 rounded-full opacity-70"
                style={{
                  right: `${5 + i * 8}px`,
                  top: `${12 + i * 4}px`,
                }}
                initial={{ scale: 0, y: -15 }}
                animate={{
                  scale: [0, 1, 0.8, 0],
                  y: [-15, -5, 5, 20],
                  opacity: [0, 0.7, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1 + i * 0.3,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Question marks for confused state */}
      <AnimatePresence>
        {characterMood === "confused" && (
          <>
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl font-bold text-purple-600"
                style={{
                  right: `${10 + i * 15}px`,
                  top: `${5 + i * 8}px`,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [i === 0 ? -180 : 180, 0],
                  y: [0, -10, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                  delay: i * 0.5,
                }}
              >
                ?
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ZZZ for sleepy state */}
      <AnimatePresence>
        {characterMood === "sleepy" && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute font-bold text-blue-400"
                style={{
                  fontSize: `${14 + i * 4}px`,
                  right: `${15 + i * 8}px`,
                  top: `${8 + i * 5}px`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  y: [0, -20],
                  rotate: [0, 5, -5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                  delay: i * 0.3,
                }}
              >
                Z
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Hearts for excited state */}
      <AnimatePresence>
        {characterMood === "excited" && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg text-red-400"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${5 + (i % 2) * 15}px`,
                }}
                initial={{ scale: 0, y: 0 }}
                animate={{
                  scale: [0, 1.2, 0.8, 0],
                  y: [0, -25, -40, -60],
                  opacity: [0, 1, 0.8, 0],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                  delay: i * 0.4,
                }}
              >
                ♥
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </>
  )
}
