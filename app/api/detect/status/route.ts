import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Checking backend status...")

    // Try multiple URLs to connect to the Flask backend
    const urls = ["http://localhost:5000/health", "http://127.0.0.1:5000/health"]

    let connected = false
    let responseData = null
    const errorDetails = []

    // Try each URL
    for (const url of urls) {
      try {
        console.log(`Trying to connect to: ${url}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          connected = true
          responseData = await response.json()
          console.log(`Successfully connected to ${url}`)
          console.log("Response:", responseData)
          break
        } else {
          errorDetails.push(`${url}: Status ${response.status}`)
        }
      } catch (err) {
        errorDetails.push(`${url}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    if (connected) {
      return NextResponse.json({ status: "online", data: responseData }, { status: 200 })
    } else {
      console.error("All connection attempts failed:", errorDetails)
      return NextResponse.json(
        {
          status: "offline",
          error: "Backend service unavailable",
          details: errorDetails,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Backend connection error:", error)
    return NextResponse.json(
      {
        status: "offline",
        error: `Cannot connect to backend service: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 503 },
    )
  }
}
