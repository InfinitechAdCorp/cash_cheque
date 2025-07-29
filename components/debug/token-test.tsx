"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export const TokenTest = () => {
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<any>(null)

  const testToken = async () => {
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) {
        toast({
          title: "No Token",
          description: "authToken not found in localStorage",
          variant: "destructive",
        })
        return
      }

      console.log("Testing token:", authToken.substring(0, 20) + "...")

      // Test 1: Profile endpoint
      const profileResponse = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      
      const profileData = await profileResponse.json()
      console.log("Profile test result:", profileData)

      // Test 2: Direct Laravel API call
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const directResponse = await fetch(`${backendUrl}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      })

      const directData = await directResponse.json()
      console.log("Direct Laravel test result:", directData)

      const results = {
        token: authToken.substring(0, 20) + "...",
        tokenLength: authToken.length,
        profileTest: {
          status: profileResponse.status,
          success: profileResponse.ok,
          data: profileData,
        },
        directTest: {
          status: directResponse.status,
          success: directResponse.ok,
          data: directData,
        },
        timestamp: new Date().toISOString(),
      }

      setTestResults(results)
      console.log("Token test results:", results)

      toast({
        title: "Token Test Complete",
        description: "Check console for detailed results",
        variant: "default",
      })
    } catch (error) {
      console.error("Token test error:", error)
      toast({
        title: "Token Test Failed",
        description: "Check console for error details",
        variant: "destructive",
      })
    }
  }

  const testPasswordChangeWithRealData = async () => {
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) {
        toast({
          title: "No Token",
          description: "authToken not found in localStorage",
          variant: "destructive",
        })
        return
      }

      // Use placeholder passwords for testing
      const testData = {
        currentPassword: "currentpass123", // You'll need to replace with actual current password
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      }

      console.log("Testing password change with token:", authToken.substring(0, 20) + "...")

      const response = await fetch("/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      console.log("Password change test result:", data)

      toast({
        title: response.ok ? "Password Test Success" : "Password Test Failed",
        description: data.message || "Check console for details",
        variant: response.ok ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Password change test error:", error)
      toast({
        title: "Password Test Error",
        description: "Check console for error details",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Token Validation Test</h4>
        <p className="text-sm text-blue-600 mb-4">This will test if your authToken works with the API endpoints.</p>

        <div className="space-y-2">
          <Button onClick={testToken} className="w-full">
            Test Token with Profile API
          </Button>

          <Button onClick={testPasswordChangeWithRealData} variant="outline" className="w-full bg-transparent">
            Test Password Change API
          </Button>
        </div>
      </div>

      {testResults && (
        <div className="p-4 bg-gray-100 rounded text-xs">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">{JSON.stringify(testResults, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
