"use client"

import type React from "react"
import { useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserContext } from "@/lib/UserContext"
import { magic } from "@/lib/magic"
import {
  DollarSign,
  CreditCard,
  Receipt,
  Calculator,
  TrendingUp,
  PieChart,
  Banknote,
  Coins,
  FileText,
  Wallet,
} from "lucide-react"

// Enhanced animation keyframes with more dynamic movement
const animationStyles = `
  @keyframes floatUpDown {
    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    25% { transform: translateY(-30px) translateX(10px) rotate(5deg); }
    50% { transform: translateY(-15px) translateX(-10px) rotate(-3deg); }
    75% { transform: translateY(-25px) translateX(5px) rotate(2deg); }
    100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  }
  @keyframes floatSideways {
    0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
    25% { transform: translateX(20px) translateY(-10px) rotate(-5deg); }
    50% { transform: translateX(-15px) translateY(-20px) rotate(5deg); }
    75% { transform: translateX(10px) translateY(-5px) rotate(-2deg); }
    100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  }
  @keyframes floatCircular {
    0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
    25% { transform: translateX(15px) translateY(-15px) rotate(90deg); }
    50% { transform: translateX(0px) translateY(-30px) rotate(180deg); }
    75% { transform: translateX(-15px) translateY(-15px) rotate(270deg); }
    100% { transform: translateX(0px) translateY(0px) rotate(360deg); }
  }
  @keyframes floatDiagonal {
    0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
    25% { transform: translateX(25px) translateY(-25px) rotate(10deg); }
    50% { transform: translateX(10px) translateY(-40px) rotate(-5deg); }
    75% { transform: translateX(-10px) translateY(-20px) rotate(8deg); }
    100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 0.9; }
  }
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

// Enhanced floating element component with different animation types
const FloatingElement = ({
  children,
  delay = 0,
  duration = 20,
  startX = 0,
  startY = 0,
  animationType = "floatUpDown",
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  startX?: number
  startY?: number
  animationType?: "floatUpDown" | "floatSideways" | "floatCircular" | "floatDiagonal" | "pulse"
}) => (
  <div
    className="absolute opacity-30 hover:opacity-50 transition-opacity duration-300"
    style={{
      left: `${startX}%`,
      top: `${startY}%`,
      animation: `${animationType} ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    {children}
  </div>
)

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useContext(UserContext) || [null, () => {}]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.status === true) {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        })

        magic.user.setLoggedIn(true, data.token)
        const userData = await magic.user.getMetadata()
        setUser(userData)
        router.push("/dashboard")
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && !user.loading && user.email) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <>
      {/* Inject enhanced animation keyframes */}
      <style jsx global>
        {animationStyles}
      </style>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0">
          {/* Large floating accounting cards */}
          <FloatingElement delay={0} duration={8} startX={5} startY={15} animationType="floatUpDown">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
              <DollarSign className="w-10 h-10 text-white mb-2" />
              <div className="text-white text-lg font-bold">$12,450.00</div>
              <div className="text-white/80 text-sm">Total Revenue</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={1} duration={10} startX={75} startY={10} animationType="floatSideways">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
              <CreditCard className="w-10 h-10 text-white mb-2" />
              <div className="text-white text-lg font-bold">Card Payment</div>
              <div className="text-white/80 text-sm">**** 4532</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={2} duration={12} startX={10} startY={65} animationType="floatCircular">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <Receipt className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Invoice #2024-001</div>
              <div className="text-white/80 text-xs">Due: Jan 15</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={0.5} duration={9} startX={80} startY={70} animationType="floatDiagonal">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <Calculator className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Calculator</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={3} duration={11} startX={2} startY={40} animationType="floatUpDown">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
              <TrendingUp className="w-10 h-10 text-white mb-2" />
              <div className="text-white text-lg font-bold">+24.5%</div>
              <div className="text-white/80 text-sm">Growth</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={4} duration={7} startX={85} startY={35} animationType="pulse">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <PieChart className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Analytics</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={1.5} duration={13} startX={20} startY={5} animationType="floatSideways">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-2xl">
              <Banknote className="w-10 h-10 text-white mb-2" />
              <div className="text-white text-lg font-bold">Check #2024-156</div>
              <div className="text-white/80 text-sm">$3,250.00</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={5} duration={14} startX={65} startY={80} animationType="floatCircular">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <Coins className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Balance</div>
              <div className="text-white/80 text-sm">$8,750.00</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={2.5} duration={6} startX={45} startY={25} animationType="floatDiagonal">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <FileText className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Report</div>
            </div>
          </FloatingElement>
          <FloatingElement delay={6} duration={15} startX={90} startY={55} animationType="floatUpDown">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-2xl">
              <Wallet className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-base font-semibold">Wallet</div>
            </div>
          </FloatingElement>
          {/* Smaller floating elements with different animations */}
          <FloatingElement delay={7} duration={5} startX={60} startY={20} animationType="pulse">
            <div className="w-4 h-4 bg-white/40 rounded-full shadow-lg"></div>
          </FloatingElement>
          <FloatingElement delay={8} duration={8} startX={35} startY={55} animationType="floatCircular">
            <div className="w-3 h-3 bg-white/50 rounded-full shadow-lg"></div>
          </FloatingElement>
          <FloatingElement delay={9} duration={6} startX={70} startY={45} animationType="floatSideways">
            <div className="w-5 h-5 bg-white/35 rounded-full shadow-lg"></div>
          </FloatingElement>
          <FloatingElement delay={10} duration={9} startX={25} startY={85} animationType="floatDiagonal">
            <div className="w-6 h-6 bg-white/30 rounded-full shadow-lg"></div>
          </FloatingElement>
          <FloatingElement delay={11} duration={7} startX={55} startY={75} animationType="pulse">
            <div className="w-2 h-2 bg-white/60 rounded-full shadow-lg"></div>
          </FloatingElement>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card
            className="w-full max-w-md backdrop-blur-xl bg-white/95 shadow-2xl border-0 transform hover:scale-[1.02] transition-all duration-300"
            style={{ animation: "fadeInUp 0.8s ease-out" }}
          >
            <CardHeader className="space-y-1 text-center pb-8">
              {/* Fixed logo container - wider and maintains aspect ratio */}
              <div className="mx-auto mb-4 flex items-center justify-center w-full max-w-xs">
                <img src="/logo.png" alt="Logo" className="w-full max-w-xs h-auto object-contain" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">Sign in to your accounting dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 hover:border-purple-300"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 hover:border-purple-300"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        style={{ animation: "spin 1s linear infinite" }}
                      ></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
