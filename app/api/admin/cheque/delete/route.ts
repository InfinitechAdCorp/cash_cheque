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
    const { voucher_id, otp } = body

    console.log("🗑️ Delete cheque voucher request:", { voucher_id, otp: otp ? "***" : "missing" })

    if (!voucher_id || !otp) {
      return NextResponse.json({ message: "Voucher ID and OTP are required" }, { status: 400 })
    }

    // Verify OTP first
    const storageKey = `cheque_${voucher_id}`
    const storedData = global.otpStore.get(storageKey)

    console.log("Checking OTP for key:", storageKey)
    console.log("Store has data:", !!storedData)

    if (!storedData) {
      return NextResponse.json(
        {
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 401 },
      )
    }

    if (Date.now() > storedData.expires) {
      global.otpStore.delete(storageKey)
      return NextResponse.json(
        {
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 401 },
      )
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        {
          message: "Invalid OTP. Please try again.",
        },
        { status: 401 },
      )
    }

    // OTP is valid, clear it
    global.otpStore.delete(storageKey)
    console.log("✅ OTP verified, proceeding with deletion")

    // Call Laravel API to delete
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
    }

    const deleteResponse = await fetch(`${apiUrl}/cheque-vouchers/${voucher_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const responseData = await deleteResponse.json()

    if (!deleteResponse.ok) {
      console.error("Laravel API Error:", responseData)
      return NextResponse.json(
        {
          message: responseData.message || "Failed to delete cheque voucher",
          errors: responseData.errors || null,
        },
        { status: deleteResponse.status },
      )
    }

    console.log("✅ Cheque voucher deleted successfully")
    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error("Delete cheque voucher error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
