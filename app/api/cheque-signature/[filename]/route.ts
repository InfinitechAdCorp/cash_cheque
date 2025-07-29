import { NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  // Await params before destructuring to satisfy the Next.js warning/error
  const { filename } = await params

  if (!LARAVEL_API_URL) {
    console.error("LARAVEL_API_URL is not configured.")
    return NextResponse.json({ message: "Laravel API URL is not configured." }, { status: 500 })
  }

  try {
    let baseLaravelUrl = LARAVEL_API_URL.endsWith("/") ? LARAVEL_API_URL.slice(0, -1) : LARAVEL_API_URL
    if (baseLaravelUrl.endsWith("/api")) {
      baseLaravelUrl = baseLaravelUrl.slice(0, -4) // Remove "/api" to get the base domain
    }

    const imageUrl = `${baseLaravelUrl}/signatures/${filename}`
    console.log(`[Cheque Signature Proxy] Attempting to fetch from Laravel: ${imageUrl}`)

    const response = await fetch(imageUrl, {
      cache: "no-store", // Ensure fresh image is fetched
    })

    if (!response.ok) {
      console.error(
        `[Cheque Signature Proxy] Failed to fetch image from Laravel. Status: ${response.status}, Status Text: ${response.statusText}, URL: ${imageUrl}`,
      )
      // If Laravel returns a 404, pass it through. Otherwise, return a generic 500.
      return new NextResponse(null, { status: response.status, statusText: response.statusText })
    }

    const contentType = response.headers.get("Content-Type") || "application/octet-stream"
    console.log(`[Cheque Signature Proxy] Successfully fetched image. Content-Type: ${contentType}`)

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache images for better performance
      },
      status: 200,
    })
  } catch (error: any) {
    console.error("[Cheque Signature Proxy] Error proxying signature image:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
