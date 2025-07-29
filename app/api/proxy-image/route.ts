import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is missing" }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Return the image data with appropriate headers
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for a long time
      },
    })
  } catch (error: any) {
    console.error(`Error proxying image ${imageUrl}:`, error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
