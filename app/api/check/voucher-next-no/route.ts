import { NextResponse } from "next/server"

export async function GET() {
  const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  if (!LARAVEL_API_BASE_URL) {
    return NextResponse.json(
      { message: "Laravel API URL (NEXT_PUBLIC_API_URL) not configured in .env.local." },
      { status: 500 },
    )
  }
  try {
    const response = await fetch(`${LARAVEL_API_BASE_URL}/cheque-vouchers/next-voucher-number`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch next voucher number from Laravel." },
        { status: response.status },
      )
    }
    const result = await response.json()
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("Error proxying request to Laravel:", error)
    return NextResponse.json({ message: "Internal server error.", error: error.message }, { status: 500 })
  }
}
