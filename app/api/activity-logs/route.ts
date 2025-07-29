import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "15"
    const logName = searchParams.get("log_name")
    const fromDate = searchParams.get("from_date")
    const toDate = searchParams.get("to_date")
    const userId = searchParams.get("user_id")
    const subjectType = searchParams.get("subject_type")

    // Build query string for Laravel API
    const queryParams = new URLSearchParams({
      page,
      per_page: perPage,
    })

    if (logName && logName !== "all") queryParams.append("log_name", logName)
    if (fromDate) queryParams.append("from_date", fromDate)
    if (toDate) queryParams.append("to_date", toDate)
    if (userId) queryParams.append("user_id", userId)
    if (subjectType && subjectType !== "all") queryParams.append("subject_type", subjectType)

    console.log("Fetching activity logs from:", `${LARAVEL_API_URL}/activity-logs?${queryParams.toString()}`)

    const response = await fetch(`${LARAVEL_API_URL}/activity-logs?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Laravel API error response:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: "Failed to fetch activity logs",
            details: errorData,
            status: response.status,
          },
          { status: response.status },
        )
      } catch (parseError) {
        return NextResponse.json(
          {
            error: "Failed to fetch activity logs",
            details: errorText,
            status: response.status,
          },
          { status: response.status },
        )
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch activity logs",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
