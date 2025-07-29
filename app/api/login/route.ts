import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Ensure NEXT_PUBLIC_API_URL is set in your environment variables
    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!laravelApiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined.")
      return NextResponse.json({ message: "Server configuration error: API URL not set." }, { status: 500 })
    }

    const response = await fetch(`${laravelApiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers required by your Laravel backend, e.g., CSRF token
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      // If Laravel returns a token or user data, forward it to the client
      return NextResponse.json(data, { status: response.status })
    } else {
      // Forward error messages from Laravel to the client
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Error in Next.js API route:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
