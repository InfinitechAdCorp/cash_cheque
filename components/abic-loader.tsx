"use client"

import { Receipt, DollarSign, CreditCard, TrendingUp, PieChart, Banknote } from 'lucide-react'

interface ABICLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export default function ABICLoader({ size = "md", text = "Processing...", className = "" }: ABICLoaderProps) {
  const sizeClasses = {
    sm: { container: "w-40 h-40", calc: "w-18 h-22", doc: "w-16 h-20", icon: "w-3 h-3" },
    md: { container: "w-48 h-48", calc: "w-22 h-26", doc: "w-20 h-24", icon: "w-4 h-4" },
    lg: { container: "w-56 h-56", calc: "w-26 h-30", doc: "w-24 h-28", icon: "w-5 h-5" },
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }

  const currentSize = sizeClasses[size]

  const floatingElements = [
    { icon: DollarSign, color: "from-green-400 to-green-500", position: "top-6 left-6" },
    { icon: Receipt, color: "from-blue-400 to-blue-500", position: "bottom-6 right-6" },
    { icon: CreditCard, color: "from-orange-400 to-orange-500", position: "top-6 right-10" },
    { icon: TrendingUp, color: "from-emerald-400 to-emerald-500", position: "bottom-6 left-10" },
    { icon: PieChart, color: "from-cyan-400 to-cyan-500", position: "top-12 right-6" },
    { icon: Banknote, color: "from-amber-400 to-amber-500", position: "bottom-12 left-6" },
  ]

  return (
    <div className={`flex flex-col items-center justify-center space-y-10 ${className}`}>
      {/* Enhanced main illustration container */}
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Multiple animated background rings */}
        <div
          className="absolute inset-0 border-2 border-dashed border-purple-300/60 rounded-full animate-spin"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute inset-2 border border-dotted border-pink-300/40 rounded-full animate-spin"
          style={{ animationDuration: "8s", animationDirection: "reverse" }}
        />
        <div className="absolute inset-4 border border-solid border-purple-200/30 rounded-full animate-pulse" />

        {/* Enhanced calculator */}
        <div
          className={`${currentSize.calc} bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-2xl relative z-20 flex flex-col overflow-hidden border border-purple-400/30 animate-bounce`}
        >
          {/* Calculator screen */}
          <div className="h-1/3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 m-1.5 rounded-md flex items-center justify-end px-2 relative overflow-hidden shadow-inner">
            <div className="text-green-400 text-xs font-mono font-bold relative z-10 drop-shadow-sm">Accounting</div>
          </div>

          {/* Calculator buttons */}
          <div className="flex-1 grid grid-cols-3 gap-1 p-1.5">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/30 to-white/10 rounded-sm flex items-center justify-center shadow-sm border border-white/20 relative overflow-hidden"
              >
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm relative z-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced document */}
        <div
          className={`${currentSize.doc} bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl shadow-2xl relative z-20 ml-3 flex flex-col overflow-hidden border border-pink-400/30 animate-pulse`}
        >
          {/* Document header */}
          <div className="h-1/4 bg-gradient-to-br from-white/25 to-white/15 m-1.5 rounded-md flex items-center px-2 relative">
            <div className="w-2 h-2 bg-white/90 rounded-full mr-1 shadow-sm" />
            <div className="flex-1 space-y-0.5">
              <div className="h-0.5 bg-white/80 rounded w-4/5" />
              <div className="h-0.5 bg-white/60 rounded w-3/5" />
            </div>
          </div>

          {/* Document content */}
          <div className="flex-1 p-1.5 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-1 items-center">
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                <div className="flex-1 h-0.5 bg-white/70 rounded" />
                <div className="w-2 h-0.5 bg-white/50 rounded" />
                <div className="w-1.5 h-0.5 bg-white/60 rounded" />
              </div>
            ))}
          </div>

          {/* Document footer */}
          <div className="h-1/6 bg-gradient-to-r from-white/20 to-white/10 mx-1.5 mb-1.5 rounded-sm flex items-center justify-center">
            <div className="text-xs text-white/70 font-bold">REPORT</div>
          </div>
        </div>

        {/* Floating accounting icons */}
        {floatingElements.map((item, i) => {
          const IconComponent = item.icon
          return (
            <div
              key={i}
              className={`absolute ${item.position} opacity-40 animate-bounce`}
              style={{ animationDelay: `${i * 0.8}s`, animationDuration: "5s" }}
            >
              <div className={`p-2 bg-gradient-to-br ${item.color} rounded-full shadow-lg`}>
                <IconComponent className={`${currentSize.icon} text-white`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-center space-x-3 mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* ABIC Accounting text */}
      <div className="text-center space-y-4 relative">
        <div
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 ${textSizes[size]} tracking-wide relative`}
        >
          ABIC Accounting
        </div>
        <div className={`text-purple-600 font-medium ${textSizes[size]} opacity-90 relative`}>{text}</div>
      </div>
    </div>
  )
}
