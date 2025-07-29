"use client"

import { motion } from "framer-motion"
import type { CharacterMood } from "@/types/settings"

interface CharacterEyesProps {
  characterMood: CharacterMood
  eyesClosed: boolean
  isTyping: boolean
}

export const CharacterEyes = ({ characterMood, eyesClosed, isTyping }: CharacterEyesProps) => {
  const getIrisColor = () => {
    switch (characterMood) {
      case "excited":
        return "#F59E0B"
      case "happy":
        return "#10B981"
      case "angry":
        return "#EF4444"
      case "disgusted":
        return "#7C2D12"
      case "sad":
        return "#6B7280"
      case "worried":
        return "#F97316"
      case "confused":
        return "#8B5CF6"
      case "sleepy":
        return "#64748B"
      default:
        return "#3B82F6"
    }
  }

  return (
    <>
      {/* Left Eye */}
      <motion.div
        className="absolute w-12 h-12 bg-gray-800 rounded-full left-10 top-16"
        animate={{
          scaleY: eyesClosed
            ? 0.05
            : characterMood === "shocked"
              ? 1.4
              : characterMood === "sleepy"
                ? 0.6
                : characterMood === "disgusted"
                  ? 0.8
                  : 1,
          scaleX: characterMood === "shocked" ? 1.3 : characterMood === "disgusted" ? 0.9 : 1,
          y: eyesClosed ? 4 : characterMood === "angry" ? -3 : characterMood === "worried" ? -1 : 0,
          rotate: characterMood === "angry" ? -15 : characterMood === "confused" ? -8 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Pupil */}
        <motion.div
          className="absolute w-7 h-7 bg-white rounded-full left-2.5 top-1.5"
          animate={{
            scale: eyesClosed ? 0 : characterMood === "shocked" ? 1.3 : characterMood === "sleepy" ? 0.8 : 1,
            opacity: eyesClosed ? 0 : 1,
            x: isTyping ? [0, 2, -2, 0] : 0,
            y: characterMood === "sleepy" ? 2 : 0,
          }}
          transition={{
            scale: { duration: 0.3 },
            x: { duration: 0.15, repeat: isTyping ? Number.POSITIVE_INFINITY : 0 },
            y: { duration: 0.5 },
          }}
        >
          {/* Iris */}
          <motion.div
            className="absolute w-5 h-5 rounded-full left-1 top-1"
            animate={{
              backgroundColor: getIrisColor(),
              scale: [1, 1.1, 1],
            }}
            transition={{
              backgroundColor: { duration: 0.5 },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            }}
          />

          {/* Pupil highlight */}
          <motion.div
            className="absolute w-2 h-2 bg-white rounded-full left-3 top-1 opacity-80"
            animate={{
              scale: [1, 0.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>

        {/* Eyelashes */}
        <motion.div
          className="absolute -top-3 left-3 w-8 h-2"
          animate={{
            opacity: characterMood === "excited" ? 1 : 0.8,
            scaleY: characterMood === "excited" ? 1.3 : 1,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-4 bg-gray-700 rounded-full origin-bottom"
              style={{ left: `${i * 6}px` }}
              animate={{
                rotate: characterMood === "excited" ? [0, 8, 0] : characterMood === "happy" ? [0, 5, 0] : 0,
                scaleY: characterMood === "excited" ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Right Eye (similar structure) */}
      <motion.div
        className="absolute w-12 h-12 bg-gray-800 rounded-full right-10 top-16"
        animate={{
          scaleY: eyesClosed
            ? 0.05
            : characterMood === "shocked"
              ? 1.4
              : characterMood === "sleepy"
                ? 0.6
                : characterMood === "disgusted"
                  ? 0.8
                  : 1,
          scaleX: characterMood === "shocked" ? 1.3 : characterMood === "disgusted" ? 0.9 : 1,
          y: eyesClosed ? 4 : characterMood === "angry" ? -3 : characterMood === "worried" ? -1 : 0,
          rotate: characterMood === "angry" ? 15 : characterMood === "confused" ? 8 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="absolute w-7 h-7 bg-white rounded-full left-2.5 top-1.5"
          animate={{
            scale: eyesClosed ? 0 : characterMood === "shocked" ? 1.3 : characterMood === "sleepy" ? 0.8 : 1,
            opacity: eyesClosed ? 0 : 1,
            x: isTyping ? [0, -2, 2, 0] : 0,
            y: characterMood === "sleepy" ? 2 : 0,
          }}
          transition={{
            scale: { duration: 0.3 },
            x: { duration: 0.15, repeat: isTyping ? Number.POSITIVE_INFINITY : 0 },
          }}
        >
          <motion.div
            className="absolute w-5 h-5 rounded-full left-1 top-1"
            animate={{
              backgroundColor: getIrisColor(),
              scale: [1, 1.1, 1],
            }}
            transition={{
              backgroundColor: { duration: 0.5 },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            }}
          />

          <motion.div
            className="absolute w-2 h-2 bg-white rounded-full left-3 top-1 opacity-80"
            animate={{
              scale: [1, 0.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>

        <motion.div
          className="absolute -top-3 left-3 w-8 h-2"
          animate={{
            opacity: characterMood === "excited" ? 1 : 0.8,
            scaleY: characterMood === "excited" ? 1.3 : 1,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-4 bg-gray-700 rounded-full origin-bottom"
              style={{ left: `${i * 6}px` }}
              animate={{
                rotate: characterMood === "excited" ? [0, -8, 0] : characterMood === "happy" ? [0, -5, 0] : 0,
                scaleY: characterMood === "excited" ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </>
  )
}
