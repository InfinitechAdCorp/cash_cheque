import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

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
    const { voucher_id, voucher_type, voucher_no } = body

    console.log("🚀 Send OTP Request:", { voucher_id, voucher_type, voucher_no })

    if (!voucher_id || !voucher_type) {
      return NextResponse.json({ message: "Voucher ID and type are required" }, { status: 400 })
    }

    // Fixed email
    const email = "decastrojustin321@gmail.com"

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("Generated OTP:", otp)

    // Create storage key
    const storageKey = `${voucher_type}_${voucher_id}`
    console.log("Storage key:", storageKey)

    // Store OTP with 10-minute expiry
    const expiryTime = Date.now() + 10 * 60 * 1000 // 10 minutes
    global.otpStore.set(storageKey, {
      otp: otp,
      expires: expiryTime,
      voucherData: { voucher_id, voucher_type, voucher_no },
    })

    console.log("OTP stored successfully")
    console.log("Current store size:", global.otpStore.size)
    console.log("All keys in store:", Array.from(global.otpStore.keys()))

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Simple email template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>OTP Verification</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-box { background: #f0f0f0; padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #e53e3e; letter-spacing: 8px; font-family: monospace; }
            .info { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
    </head>
    <body>
        <h1>🔐 Delete Voucher - OTP Verification</h1>
        
        <div class="info">
            <p><strong>Voucher Type:</strong> ${voucher_type.toUpperCase()}</p>
            <p><strong>Voucher ID:</strong> ${voucher_id}</p>
            <p><strong>Voucher Number:</strong> ${voucher_no || "N/A"}</p>
        </div>
        
        <p>Enter this code to confirm deletion:</p>
        
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>Valid for 10 minutes</p>
        </div>

        <p><strong>Storage Key:</strong> ${storageKey}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </body>
    </html>
    `

    // Send email
    await transporter.sendMail({
      from: `"Voucher System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 OTP for Voucher Deletion",
      html: emailHtml,
    })

    console.log("✅ Email sent successfully")

    return NextResponse.json({
      message: "OTP sent successfully",
      email: email,
      expires_in: 600,
      debug: {
        storageKey,
        otp, // Remove this in production
        storeSize: global.otpStore.size,
      },
    })
  } catch (error) {
    console.error("❌ Send OTP error:", error)
    return NextResponse.json(
      {
        message: "Failed to send OTP",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
