import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Get authorization token from headers
    const authorization = request.headers.get("authorization")
    console.log("Authorization header:", authorization ? authorization.substring(0, 30) + "..." : "MISSING")

    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header")
      return NextResponse.json(
        {
          status: false,
          message: "Authorization token is required",
          debug: {
            hasAuthHeader: !!authorization,
            authHeaderStart: authorization ? authorization.substring(0, 10) : null,
          },
        },
        { status: 401 },
      )
    }

    const token = authorization.substring(7) // Remove 'Bearer ' prefix
    console.log("Extracted token:", token.substring(0, 20) + "...")
    console.log("Token length:", token.length)

    // Log what we received
    console.log("Password change request received:", {
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      hasConfirmPassword: !!confirmPassword,
      currentPasswordLength: currentPassword?.length,
      newPasswordLength: newPassword?.length,
      tokenLength: token.length,
    })

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log("Missing required fields")
      return NextResponse.json(
        {
          status: false,
          message: "All password fields are required",
          errors: {
            currentPassword: !currentPassword ? ["Current password is required"] : [],
            newPassword: !newPassword ? ["New password is required"] : [],
            confirmPassword: !confirmPassword ? ["Password confirmation is required"] : [],
          },
        },
        { status: 400 },
      )
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      console.log("Password confirmation mismatch")
      return NextResponse.json(
        {
          status: false,
          message: "Password confirmation does not match",
          errors: {
            confirmPassword: ["Password confirmation does not match"],
          },
        },
        { status: 400 },
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          status: false,
          message: "Password does not meet security requirements",
          errors: {
            newPassword: passwordValidation.errors,
          },
        },
        { status: 400 },
      )
    }

    // Make request to Laravel backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    console.log("Making request to:", `${backendUrl}/api/change-password`)

    const requestBody = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    }

    console.log("Request body to Laravel:", {
      current_password: "***",
      new_password: "***",
      new_password_confirmation: "***",
      current_password_length: currentPassword.length,
      new_password_length: newPassword.length,
    })

    const response = await fetch(`${backendUrl}/api/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Laravel response status:", response.status)
    console.log("Laravel response headers:", Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log("Laravel response data:", data)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error occurred while changing password",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Password strength validation function
function validatePasswordStrength(password: string) {
  const errors: string[] = []

  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  // Maximum length
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters")
  }

  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  // Must contain number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  // Must contain special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  // Check for common weak passwords
  const weakPasswords = [
    "password",
    "password123",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password1",
    "admin",
    "letmein",
    "welcome",
  ]

  if (weakPasswords.some((weak) => password.toLowerCase().includes(weak))) {
    errors.push("Password contains common words or patterns that are not secure")
  }

  // Check for keyboard patterns
  const keyboardPatterns = ["123", "abc", "qwe", "asd", "zxc"]
  if (keyboardPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    errors.push("Password contains keyboard patterns that are not secure")
  }

  // Check for repeated characters (3 or more)
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password should not contain repeated characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
