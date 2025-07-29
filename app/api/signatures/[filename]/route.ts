import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  const { filename } = params
  const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

  if (!LARAVEL_API_URL) {
    return NextResponse.json({ message: "API URL is not configured." }, { status: 500 })
  }

  try {
    // Clean up the base URL to ensure correct path concatenation
    let baseUrl = LARAVEL_API_URL.replace(/\/+$/, "") // Remove trailing slashes
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.slice(0, -4) // Remove '/api' if it's at the end
    }

    const imageUrl = `${baseUrl}/signatures/${filename}`
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json({ message: "Signature image not found or failed to fetch" }, { status: response.status })
    }

    // Return the image directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache images aggressively
      },
      status: 200,
    })
  } catch (error: any) {
    console.error("Error proxying signature image:", error)
    return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 })
  }
}
