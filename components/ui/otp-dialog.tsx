"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Clock, Mail, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OTPDialogProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => Promise<void>
  onResendOTP: () => Promise<void>
  voucherNo: string
  voucherType: "cash" | "cheque"
  email: string
}

export function OTPDialog({ isOpen, onClose, onVerify, onResendOTP, voucherNo, voucherType, email }: OTPDialogProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const { toast } = useToast()

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setOtp("")
      setTimeLeft(600)
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      await onVerify(otp)
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResendOTP()
      setTimeLeft(600) // Reset timer
      setOtp("") // Clear current OTP
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && otp.length === 6) {
      handleVerify()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto m-4 p-4 sm:p-6">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-lg font-semibold">
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span>Security Verification</span>
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-red-600 mb-1">Critical Warning:</div>
                  <div className="text-gray-700">
                    You are about to permanently delete{" "}
                    <span className="font-semibold text-gray-900">
                      {voucherType.charAt(0).toUpperCase() + voucherType.slice(1)} Voucher #{voucherNo}
                    </span>
                    . This action cannot be undone.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 text-gray-700">
                  A 6-digit verification code has been sent to{" "}
                  <span className="font-semibold text-gray-900 break-all">{email}</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
              Enter 6-digit verification code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              onKeyPress={handleKeyPress}
              className="text-center text-xl font-mono tracking-widest border-gray-300 focus:border-red-500 focus:ring-red-500 h-14"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Expires in: </span>
              <span className="font-mono font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || timeLeft > 540} // Allow resend after 1 minute
              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium underline"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          {timeLeft <= 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <span className="text-sm text-red-600">Verification code has expired. Please request a new code.</span>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-2 pt-4">
          <AlertDialogCancel onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying || timeLeft <= 0}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 order-1 sm:order-2"
          >
            {isVerifying ? "Verifying..." : "Verify & Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
