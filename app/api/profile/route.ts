import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from headers
    const authorization = request.headers.get("authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          status: false,
          message: "Authorization token is required",
        },
        { status: 401 },
      )
    }

    const token = authorization.substring(7) // Remove 'Bearer ' prefix

    // Make request to Laravel backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error occurred while fetching profile",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          status: false,
          message: "Name and email are required",
          errors: {
            name: !name ? ["Name is required"] : [],
            email: !email ? ["Email is required"] : [],
          },
        },
        { status: 400 },
      )
    }

    // Get authorization token from headers
    const authorization = request.headers.get("authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          status: false,
          message: "Authorization token is required",
        },
        { status: 401 },
      )
    }

    const token = authorization.substring(7) // Remove 'Bearer ' prefix

    // Make request to Laravel backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error occurred while updating profile",
      },
      { status: 500 },
    )
  }
}
