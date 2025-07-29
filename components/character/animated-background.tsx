"use client"

import { motion } from "framer-motion"

export const AnimatedBackground = () => {
  return (
    <>
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, #3B82F6 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, #8B5CF6 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, #EC4899 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, #10B981 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, #3B82F6 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            i % 3 === 0 ? "w-3 h-3 bg-blue-300/20" : i % 3 === 1 ? "w-2 h-2 bg-purple-300/20" : "w-1 h-1 bg-pink-300/20"
          }`}
          animate={{
            x: [0, Math.sin(i) * 150, 0],
            y: [0, -Math.cos(i) * 100, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 6 + (i % 3),
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
          style={{
            left: `${5 + (i % 6) * 15}%`,
            top: `${10 + (i % 4) * 20}%`,
          }}
        />
      ))}
    </>
  )
}
