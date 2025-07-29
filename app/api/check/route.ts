import { NextResponse } from "next/server";

const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(request: Request) {
  if (!LARAVEL_API_BASE_URL) {
    return NextResponse.json(
      { message: "Laravel API URL (NEXT_PUBLIC_API_URL) not configured." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();

    const response = await fetch(`${LARAVEL_API_BASE_URL}/cheque-vouchers`, {
      method: "POST",
      body: formData,
      // Do not manually set Content-Type for FormData
    });

    const contentType = response.headers.get("content-type");

    let result: any = {};
    if (contentType?.includes("application/json")) {
      result = await response.json();
    } else {
      result = { message: await response.text() }; // fallback if Laravel returns plain text
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: result.message || "Failed to save voucher in Laravel.",
          errors: result.errors || {},
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error proxying request to Laravel:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
