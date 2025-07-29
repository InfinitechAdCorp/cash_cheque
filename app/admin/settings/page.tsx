"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Shield, Bug } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { SecuritySection } from "@/components/sections/security-section"
import { AuthDebug } from "@/components/debug/auth-debug"
import type { SettingsSection, CharacterMood, ProfileData, PasswordData } from "@/types/settings"
import { checkPasswordStrength } from "@/utils/password-strength"
import { ProfileSection } from "@/components/sections/profile-section"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("debug") // Start with debug
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isConfirmFocused, setIsConfirmFocused] = useState(false)
  const [eyesClosed, setEyesClosed] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [characterMood, setCharacterMood] = useState<CharacterMood>("neutral")

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Accounting",
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const passwordStrength = checkPasswordStrength(passwordData.newPassword)
  const passwordsMatch =
    passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== ""

  useEffect(() => {
    if (passwordStrength === "excellent") {
      setCharacterMood("excited")
    } else if (passwordStrength === "strong") {
      setCharacterMood("happy")
    } else if (passwordStrength === "good") {
      setCharacterMood("neutral")
    } else if (passwordStrength === "fair") {
      setCharacterMood("confused")
    } else if (passwordStrength === "forbidden") {
      setCharacterMood("disgusted")
    } else if (passwordStrength === "terrible") {
      setCharacterMood("angry")
    } else if (passwordStrength === "weak" || passwordStrength === "poor") {
      setCharacterMood("worried")
    } else {
      setCharacterMood("sleepy")
    }
  }, [passwordStrength, passwordData.newPassword])

  const sections: SettingsSection[] = [
    {
      id: "debug",
      title: "Debug",
      icon: <Bug className="h-5 w-5" />,
      description: "Debug authentication issues",
    },
    {
      id: "profile",
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      description: "Manage your personal information",
    },
    {
      id: "security",
      title: "Security",
      icon: <Shield className="h-5 w-5" />,
      description: "Password and security settings",
    },
  ]

  const handleSave = async (section: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Settings Updated",
      description: `Your ${section} settings have been saved successfully.`,
      variant: "default",
    })
  }

  const getAuthToken = () => {
    // First check for the token key we know exists
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      console.log("Found authToken:", authToken.substring(0, 20) + "...")
      return authToken
    }

    // Check other possible token storage keys as fallback
    const possibleKeys = [
      "auth_token",
      "token",
      "access_token",
      "accessToken",
      "bearer_token",
      "user_token",
      "api_token",
    ]

    console.log("Checking localStorage for other auth tokens...")

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key)
      if (token) {
        console.log(`Found token with key: ${key}`, token.substring(0, 20) + "...")
        return token
      }
    }

    // Also check sessionStorage
    console.log("Checking sessionStorage for auth tokens...")
    for (const key of ["authToken", ...possibleKeys]) {
      const token = sessionStorage.getItem(key)
      if (token) {
        console.log(`Found token in sessionStorage with key: ${key}`, token.substring(0, 20) + "...")
        return token
      }
    }

    console.log("No auth token found")
    console.log("All localStorage keys:", Object.keys(localStorage))
    console.log("All sessionStorage keys:", Object.keys(sessionStorage))

    return null
  }

  const handlePasswordChange = async () => {
    console.log("Settings page handlePasswordChange called")
    setIsLoading(true)

    try {
      const token = getAuthToken()

      if (!token) {
        // Show more detailed error message
        toast({
          title: "Authentication Required",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        })
        console.error("No authentication token found. Please check your login system.")
        return
      }

      const requestBody = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }

      console.log("Making request to /api/changepassword with token:", token.substring(0, 20) + "...")

      const response = await fetch("/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

      // Clear form on success
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setCharacterMood("excited")
    } catch (error: any) {
      console.error("Password change error:", error)
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      })
      setCharacterMood("sad")
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "debug":
        return <AuthDebug />
      case "profile":
        return (
          <ProfileSection
            profileData={profileData}
            setProfileData={setProfileData}
            isLoading={isLoading}
            handleSave={handleSave}
          />
        )
      case "security":
        return (
          <SecuritySection
            characterMood={characterMood}
            eyesClosed={eyesClosed}
            isTyping={isTyping}
            isPasswordFocused={isPasswordFocused}
            isConfirmFocused={isConfirmFocused}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            passwordStrength={passwordStrength}
            passwordsMatch={passwordsMatch}
            setIsTyping={setIsTyping}
            setIsPasswordFocused={setIsPasswordFocused}
            setIsConfirmFocused={setIsConfirmFocused}
            setIsFocused={setIsFocused}
            setEyesClosed={setEyesClosed}
            handlePasswordChange={handlePasswordChange}
            isLoading={isLoading}
          />
        )
      default:
        return <AuthDebug />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`mr-3 ${activeSection === section.id ? "text-purple-600" : "text-gray-400"}`}>
                      {section.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                    </div>
                    {activeSection === section.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-purple-600 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sections.find((s) => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-600 mt-1">{sections.find((s) => s.id === activeSection)?.description}</p>
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
