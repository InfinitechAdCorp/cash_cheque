import { NextResponse } from "next/server"

const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET() {
  try {
    const response = await fetch(`${LARAVEL_API_BASE_URL}/cash-vouchers/latest`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure no caching for this request
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorData
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
      } else {
        errorData = await response.text()
        console.error("Received non-JSON response from Laravel (GET /latest-voucher-no):", errorData)
      }
      return NextResponse.json(
        { message: "Failed to fetch latest voucher number from backend", error: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching latest voucher number:", error)
    return NextResponse.json({ message: "Internal server error", error: (error as Error).message }, { status: 500 })
  }
}
