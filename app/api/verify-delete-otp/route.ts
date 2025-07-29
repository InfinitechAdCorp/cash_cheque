import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage using global variable
declare global {
  var otpStore: Map<string, { otp: string; expires: number; voucherData: any }>
}

// Initialize global store if it doesn't exist
if (!global.otpStore) {
  global.otpStore = new Map()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voucher_id, voucher_type, otp } = body

    console.log("🔍 Verify OTP Request:", { voucher_id, voucher_type, otp })

    if (!voucher_id || !voucher_type || !otp) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Create the same storage key
    const storageKey = `${voucher_type}_${voucher_id}`
    console.log("Looking for key:", storageKey)
    console.log("Available keys:", Array.from(global.otpStore.keys()))
    console.log("Store size:", global.otpStore.size)

    // Get stored data
    const storedData = global.otpStore.get(storageKey)

    if (!storedData) {
      console.log("❌ No data found for key:", storageKey)
      return NextResponse.json(
        {
          message: "OTP not found. Please request a new OTP.",
          debug: {
            searchedKey: storageKey,
            availableKeys: Array.from(global.otpStore.keys()),
          },
        },
        { status: 401 },
      )
    }

    console.log("✅ Found stored data:", storedData)

    // Check if expired
    if (Date.now() > storedData.expires) {
      console.log("⏰ OTP expired")
      global.otpStore.delete(storageKey)
      return NextResponse.json(
        {
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 401 },
      )
    }

    // Check OTP match
    console.log("Comparing OTPs:")
    console.log("Input:", otp)
    console.log("Stored:", storedData.otp)
    console.log("Match:", otp === storedData.otp)

    if (otp !== storedData.otp) {
      console.log("❌ OTP mismatch")
      return NextResponse.json(
        {
          message: "Invalid OTP. Please try again.",
          debug: {
            expected: storedData.otp,
            received: otp,
          },
        },
        { status: 401 },
      )
    }

    // OTP is valid - remove it to prevent reuse
    global.otpStore.delete(storageKey)
    console.log("✅ OTP verified and removed from store")

    return NextResponse.json({
      message: "OTP verified successfully. You can now delete the voucher.",
      voucherData: storedData.voucherData,
    })
  } catch (error) {
    console.error("❌ Verify OTP error:", error)
    return NextResponse.json(
      {
        message: "Failed to verify OTP",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
