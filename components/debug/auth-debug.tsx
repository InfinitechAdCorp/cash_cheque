"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TokenTest } from "./token-test"

export const AuthDebug = () => {
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkAuthStatus = async () => {
    try {
      // Get all possible tokens
      const possibleKeys = [
        "auth_token",
        "token",
        "access_token",
        "authToken",
        "accessToken",
        "bearer_token",
        "user_token",
        "api_token",
      ]

      const tokens: any = {}
      for (const key of possibleKeys) {
        const token = localStorage.getItem(key)
        if (token) {
          tokens[key] = token.substring(0, 20) + "..."
        }
      }

      // Test each token
      const tokenTests: any = {}
      for (const [key, token] of Object.entries(tokens)) {
        const fullToken = localStorage.getItem(key)
        if (fullToken) {
          try {
            const response = await fetch("/profile", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${fullToken}`,
              },
            })
            const data = await response.json()
            tokenTests[key] = {
              status: response.status,
              success: response.ok,
              data: data,
            }
          } catch (error) {
            tokenTests[key] = {
              status: "error",
              success: false,
              error: error,
            }
          }
        }
      }

      const info = {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        cookies: document.cookie,
        foundTokens: tokens,
        tokenTests: tokenTests,
        timestamp: new Date().toISOString(),
      }

      setDebugInfo(info)
      console.log("Auth Debug Info:", info)

      toast({
        title: "Debug Complete",
        description: "Check console for detailed auth information",
        variant: "default",
      })
    } catch (error) {
      console.error("Debug error:", error)
      toast({
        title: "Debug Error",
        description: "Failed to run debug check",
        variant: "destructive",
      })
    }
  }

  const testPasswordChange = async () => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      if (!token) {
        toast({
          title: "No Token",
          description: "No authentication token found",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: "test123",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        }),
      })

      const data = await response.json()
      console.log("Password change test result:", data)

      toast({
        title: response.ok ? "Test Success" : "Test Failed",
        description: data.message || "Check console for details",
        variant: response.ok ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Password change test error:", error)
      toast({
        title: "Test Error",
        description: "Failed to test password change",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
      <h3 className="text-lg font-semibold mb-4 text-blue-800">Authentication Debug</h3>

      <div className="space-y-4">
        <Button onClick={checkAuthStatus} className="w-full">
          Check Auth Status
        </Button>

        <Button onClick={testPasswordChange} variant="outline" className="w-full bg-transparent">
          Test Password Change
        </Button>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mt-6">
        <TokenTest />
      </div>
    </div>
  )
}
