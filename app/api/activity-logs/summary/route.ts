import { NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET() {
  try {
    console.log("Fetching activity log summary from:", `${LARAVEL_API_URL}/activity-logs/summary`)

    const response = await fetch(`${LARAVEL_API_URL}/activity-logs/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    console.log("Laravel API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Laravel API error response:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: "Failed to fetch activity log summary",
            details: errorData,
            status: response.status,
          },
          { status: response.status },
        )
      } catch (parseError) {
        return NextResponse.json(
          {
            error: "Failed to fetch activity log summary",
            details: errorText,
            status: response.status,
          },
          { status: response.status },
        )
      }
    }

    const data = await response.json()
    console.log("Successfully fetched activity log summary")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching activity log summary:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch activity log summary",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
