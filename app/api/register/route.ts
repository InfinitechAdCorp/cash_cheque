import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, password_confirmation } = await req.json()

    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!laravelApiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined.")
      return NextResponse.json({ message: "Server configuration error: API URL not set." }, { status: 500 })
    }

    console.log("Received registration request:", { name, email, password, password_confirmation })
    console.log("Attempting to call Laravel API at:", `${laravelApiUrl}/register`)

    const response = await fetch(`${laravelApiUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })

    const data = await response.json()

    console.log("Response status from Laravel:", response.status)
    console.log("Response data from Laravel:", data)

    if (response.ok) {
      return NextResponse.json(data, { status: response.status })
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Error in Next.js API route:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
