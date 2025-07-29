import { NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Await params before destructuring to satisfy the Next.js warning/error
  const { id } = await params
  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }
  try {
    let baseUrl = LARAVEL_API_URL.replace(/\/+$/, "")
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4)
    }
    const response = await fetch(`${baseUrl}/api/cheque-vouchers/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorData.message || "Failed to fetch cheque voucher", details: errorData },
          { status: response.status },
        )
      } catch (parseError) {
        console.error(`Laravel API returned non-JSON error for GET /cheque-vouchers/${id}:`, errorText)
        return NextResponse.json(
          {
            message: "Laravel API returned an unexpected response format (expected JSON).",
            rawResponse: errorText,
          },
          { status: 500 },
        )
      }
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching cheque voucher:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Await params before destructuring to satisfy the Next.js warning/error
  const { id } = await params
  const body = await request.json()
  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }
  try {
    let baseUrl = LARAVEL_API_URL.replace(/\/+$/, "")
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4)
    }
    const response = await fetch(`${baseUrl}/api/cheque-vouchers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorData.message || "Failed to update cheque voucher", details: errorData },
          { status: response.status },
        )
      } catch (parseError) {
        console.error(`Laravel API returned non-JSON error for PUT /cheque-vouchers/${id}:`, errorText)
        return NextResponse.json(
          {
            message: "Laravel API returned an unexpected response format (expected JSON).",
            rawResponse: errorText,
          },
          { status: 500 },
        )
      }
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating cheque voucher:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Await params before destructuring to satisfy the Next.js warning/error
  const { id } = await params
  const formData = await request.formData()
  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }
  try {
    let baseUrl = LARAVEL_API_URL.replace(/\/+$/, "")
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4)
    }
    const response = await fetch(`${baseUrl}/api/cheque-vouchers/${id}`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorData.message || "Failed to update cheque voucher with files", details: errorData },
          { status: response.status },
        )
      } catch (parseError) {
        console.error(
          `Laravel API returned non-JSON error for POST (PUT simulation) /cheque-vouchers/${id}:`,
          errorText,
        )
        return NextResponse.json(
          {
            message: "Laravel API returned an unexpected response format (expected JSON).",
            rawResponse: errorText,
          },
          { status: 500 },
        )
      }
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating cheque voucher with files:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
