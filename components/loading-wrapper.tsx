"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import ABICLoader from "./abic-loader"
import { UserContext } from "@/lib/UserContext"

interface LoadingWrapperProps {
  children: React.ReactNode
  loadingTime?: number
}

export default function LoadingWrapper({ children, loadingTime = 3000 }: LoadingWrapperProps) {
  const [user] = useContext(UserContext) || [null]
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimeElapsed(true)
    }, loadingTime)
    return () => clearTimeout(timer)
  }, [loadingTime])

  const showLoader = user?.loading || !minLoadingTimeElapsed

  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <ABICLoader size="lg" text="Loading ABIC Accounting System..." />
      </div>
    )
  }

  return <>{children}</>
}
