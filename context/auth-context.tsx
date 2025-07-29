"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>
  logout: () => void
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; data?: any; error?: string }>
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; data?: any; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { toast } = useToast()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    const user = localStorage.getItem("auth_user")

    if (token && user) {
      try {
        setAuthState({
          user: JSON.parse(user),
          token,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store auth data
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      })

      toast({
        title: "Success",
        description: "Logged in successfully",
        variant: "default",
      })

      return { success: true, data }
    } catch (error: any) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      if (!authState.token) {
        throw new Error("Not authenticated")
      }

      console.log("AuthContext changePassword called with:", {
        hasCurrentPassword: !!currentPassword,
        hasNewPassword: !!newPassword,
        hasConfirmPassword: !!confirmPassword,
        currentPasswordLength: currentPassword?.length,
        newPasswordLength: newPassword?.length,
        token: authState.token?.substring(0, 20) + "...",
      })

      const requestBody = {
        currentPassword,
        newPassword,
        confirmPassword,
      }

      console.log("Making request to /api/changepassword with body:", {
        currentPassword: "***",
        newPassword: "***",
        confirmPassword: "***",
      })

      const response = await fetch("/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Password change failed")
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
        variant: "default",
      })

      return { success: true, data }
    } catch (error: any) {
      console.error("Password change error in AuthContext:", error)
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (name: string, email: string) => {
    try {
      if (!authState.token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed")
      }

      // Update local state
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      setAuthState((prev) => ({
        ...prev,
        user: data.user,
      }))

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      })

      return { success: true, data }
    } catch (error: any) {
      toast({
        title: "Profile Update Failed",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
    toast({
      title: "Success",
      description: "Logged out successfully",
      variant: "default",
    })
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    changePassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
