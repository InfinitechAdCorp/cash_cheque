import { NextResponse } from "next/server"

// Ensure you set this environment variable in your .env.local or Vercel project settings
// For example: NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api
const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET() {
  if (!LARAVEL_API_BASE_URL) {
    return NextResponse.json({ error: "Laravel API URL is not configured." }, { status: 500 })
  }

  try {
    const response = await fetch(`${LARAVEL_API_BASE_URL}/vouchers/counts`, {
      // You might need to add headers like Authorization if your Laravel API is protected
      // headers: {
      //   'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`,
      // },
      cache: "no-store", // Ensure fresh data on each request
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error fetching from Laravel API:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch voucher counts from backend", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in Next.js API route:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
