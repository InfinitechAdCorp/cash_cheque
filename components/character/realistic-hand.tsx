"use client"

import { motion } from "framer-motion"

interface RealisticHandProps {
  isLeft?: boolean
  isVisible?: boolean
}

export const RealisticHand = ({ isLeft = false, isVisible = false }: RealisticHandProps) => (
  <motion.div
    className={`absolute w-20 h-24 z-20 ${isLeft ? "left-2 top-12" : "right-2 top-12"}`}
    initial={{
      x: isLeft ? -60 : 60,
      y: 10,
      opacity: 0,
      rotate: isLeft ? -30 : 30,
    }}
    animate={
      isVisible
        ? {
            x: 0,
            y: 0,
            opacity: 1,
            rotate: isLeft ? -15 : 15,
          }
        : {
            x: isLeft ? -60 : 60,
            y: 10,
            opacity: 0,
            rotate: isLeft ? -30 : 30,
          }
    }
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.6,
    }}
  >
    {/* Wrist/Arm */}
    <motion.div
      className="absolute bottom-0 left-1/2 w-8 h-12 bg-gradient-to-b from-pink-200 to-pink-300 rounded-t-full transform -translate-x-1/2"
      animate={
        isVisible
          ? {
              scaleY: [1, 1.05, 1],
            }
          : {}
      }
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    />

    {/* Palm */}
    <motion.div
      className="absolute bottom-8 left-1/2 w-12 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl transform -translate-x-1/2 shadow-lg"
      animate={
        isVisible
          ? {
              scale: [1, 1.02, 1],
            }
          : {}
      }
      transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
    >
      {/* Palm lines */}
      <div className="absolute inset-2">
        <div className="w-full h-px bg-pink-300/50 absolute top-2" />
        <div className="w-3/4 h-px bg-pink-300/50 absolute top-4 left-1" />
        <div className="w-1/2 h-px bg-pink-300/50 absolute top-6 left-2" />
      </div>
    </motion.div>

    {/* Thumb */}
    <motion.div
      className={`absolute bottom-12 w-4 h-8 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full shadow-md ${isLeft ? "left-2" : "right-2"}`}
      animate={
        isVisible
          ? {
              rotate: isLeft ? [-5, 5, -5] : [5, -5, 5],
            }
          : {}
      }
      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
    >
      {/* Thumb nail */}
      <div className={`absolute top-1 w-2 h-1.5 bg-pink-200 rounded-full ${isLeft ? "left-1" : "right-1"}`} />
    </motion.div>

    {/* Fingers */}
    {[0, 1, 2, 3].map((finger) => (
      <motion.div
        key={finger}
        className="absolute bottom-16"
        style={{ left: `${20 + finger * 12}%` }}
        animate={
          isVisible
            ? {
                rotate: [0, finger % 2 === 0 ? 3 : -3, 0],
              }
            : {}
        }
        transition={{
          duration: 2 + finger * 0.2,
          repeat: Number.POSITIVE_INFINITY,
          delay: finger * 0.1,
        }}
      >
        {/* Finger segments */}
        {[0, 1, 2].map((segment) => (
          <motion.div
            key={segment}
            className={`w-3 h-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full shadow-sm ${segment === 0 ? "" : "mt-1"}`}
            style={{
              height: segment === 0 ? "16px" : segment === 1 ? "14px" : "12px",
              width: segment === 0 ? "12px" : segment === 1 ? "11px" : "10px",
            }}
            animate={
              isVisible
                ? {
                    scaleY: [1, 0.95, 1],
                  }
                : {}
            }
            transition={{
              duration: 1.5 + segment * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              delay: (finger + segment) * 0.1,
            }}
          >
            {/* Finger nail on tip */}
            {segment === 2 && (
              <div className="absolute top-0.5 left-1/2 w-1.5 h-1 bg-pink-200 rounded-full transform -translate-x-1/2" />
            )}

            {/* Knuckle lines */}
            {segment < 2 && <div className="absolute bottom-0 left-0 right-0 h-px bg-pink-300/30" />}
          </motion.div>
        ))}
      </motion.div>
    ))}

    {/* Hand shadow */}
    <motion.div
      className="absolute bottom-6 left-1/2 w-14 h-6 bg-black/10 rounded-full transform -translate-x-1/2 blur-sm"
      animate={
        isVisible
          ? {
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }
          : {}
      }
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    />
  </motion.div>
)
