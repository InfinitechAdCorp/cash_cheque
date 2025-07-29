import { NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET() {
  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }

  try {
    const response = await fetch(`${LARAVEL_API_URL}/cheque-vouchers`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorData.message || "Failed to fetch cheque vouchers", details: errorData },
          { status: response.status },
        )
      } catch (parseError) {
        console.error("Laravel API returned non-JSON error for GET /cheque-vouchers:", errorText)
        return NextResponse.json(
          {
            message: "Laravel API returned an unexpected response format (expected JSON, got HTML/text).",
            rawResponse: errorText,
          },
          { status: 500 },
        )
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching cheque vouchers:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }

  try {
    const response = await fetch(`${LARAVEL_API_URL}/cheque-vouchers`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorData.message || "Failed to create cheque voucher", details: errorData },
          { status: response.status },
        )
      } catch (parseError) {
        console.error("Laravel API returned non-JSON error for POST /cheque-vouchers:", errorText)
        return NextResponse.json(
          {
            message: "Laravel API returned an unexpected response format (expected JSON, got HTML/text).",
            rawResponse: errorText,
          },
          { status: 500 },
        )
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error creating cheque voucher:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
