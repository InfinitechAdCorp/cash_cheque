"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserContext } from "@/lib/UserContext"
import { magic } from "@/lib/magic"
import { ThemeProvider } from "@/components/theme-provider"
import LoadingWrapper from "@/components/loading-wrapper"
import LayoutWrapper from "@/components/layout-wrapper"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setUser({ loading: true })

    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        magic.user.getMetadata().then((userData) => {
          setUser(userData)
          if (window.location.pathname === "/login") {
            router.push("/dashboard")
          }
        })
      } else {
        router.push("/login")
        setUser(null)
      }
    })
  }, [router])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserContext.Provider value={[user, setUser]}>
        <LoadingWrapper>
          <LayoutWrapper>{children}</LayoutWrapper>
        </LoadingWrapper>
      </UserContext.Provider>
    </ThemeProvider>
  )
}
