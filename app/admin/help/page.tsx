"use client"

import { motion } from "framer-motion"
import { Hammer } from "lucide-react"

export default function BankPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-xl shadow-2xl p-8 md:p-12 max-w-lg w-full border border-gray-700"
      >
        {/* Subtle internal gradient for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl pointer-events-none"></div>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 120 }}
          className="text-center mb-8"
        >
          <motion.div
            // Hammer animation to simulate building/hammering
            initial={{ y: 0, rotate: 0 }}
            animate={{
              y: [0, 15, 0], // Move down, then up
              rotate: [0, 15, -5, 0], // Rotate slightly, then back
            }}
            transition={{
              duration: 0.6, // Faster animation for a hammering feel
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              repeatType: "loop",
            }}
            className="inline-block origin-bottom" // Set origin for rotation
          >
            <Hammer className="h-32 w-32 text-yellow-500 mx-auto drop-shadow-lg" />
          </motion.div>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-yellow-400 text-center leading-tight">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}>
            Building Something Great
          </motion.span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 text-center mb-6">Our dedicated developers are hard at work!</p>
        <p className="text-md text-gray-400 text-center">
          We're crafting new features and improving your experience. Thank you for your patience as we work to bring you
          the best.
        </p>
        {/* Simple progress bar animation */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
          className="h-1 bg-yellow-500 rounded-full mt-8 mx-auto"
          style={{ maxWidth: "80%" }}
        ></motion.div>
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">For urgent inquiries, please contact support.</p>
        </div>
      </motion.div>
    </div>
  )
}
