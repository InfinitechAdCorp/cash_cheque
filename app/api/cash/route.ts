import { NextResponse } from "next/server"

const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET() {
  // This GET handler now only fetches all cash vouchers
  try {
    const response = await fetch(`${LARAVEL_API_BASE_URL}/cash-vouchers`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorData
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
      } else {
        errorData = await response.text()
        console.error("Received non-JSON response from Laravel (GET /cash-vouchers):", errorData)
      }
      return NextResponse.json(
        { message: "Failed to fetch cash vouchers from backend", error: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching cash vouchers:", error)
    return NextResponse.json({ message: "Internal server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${LARAVEL_API_BASE_URL}/cash-vouchers`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorData
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json()
      } else {
        errorData = await response.text()
        console.error("Received non-JSON response from Laravel (POST /cash-vouchers):", errorData)
      }
      return NextResponse.json(
        { message: "Failed to create cash voucher in backend", error: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating cash voucher:", error)
    return NextResponse.json({ message: "Internal server error", error: (error as Error).message }, { status: 500 })
  }
}
