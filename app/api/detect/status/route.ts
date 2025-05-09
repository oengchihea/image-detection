import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Checking backend status...")

    // Try multiple URLs to connect to the Flask backend
    const urls = [
      "http://localhost:5000/health",
      "http://127.0.0.1:5000/health",
      "http://localhost:5000/",
      "http://127.0.0.1:5000/",
      "http://localhost:5000/api/detect",
      "http://127.0.0.1:5000/api/detect",
    ]

    let connected = false
    let responseData = null
    const errorDetails = []

    // Try each URL
    for (const url of urls) {
      try {
        console.log(`Trying to connect to: ${url}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

        const response = await fetch(url, {
          method: url.includes("/api/detect") ? "OPTIONS" : "GET", // Use OPTIONS for API endpoint
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (response.ok || response.status === 204) {
          // 204 is common for OPTIONS
          connected = true
          try {
            responseData = await response.json()
          } catch (e) {
            // Some endpoints might not return JSON
            responseData = { message: "Backend is online" }
          }
          console.log(`Successfully connected to ${url}`)
          break
        } else {
          errorDetails.push(`${url}: Status ${response.status}`)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        errorDetails.push(`${url}: ${errorMessage}`)

        // Add more detailed logging
        if (err instanceof TypeError && errorMessage.includes("Failed to fetch")) {
          console.error(`Network error for ${url}: Make sure the Flask server is running and accessible`)
        } else if (err instanceof DOMException && errorMessage.includes("abort")) {
          console.error(`Request timed out for ${url}: The server took too long to respond`)
        }
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
          message: "Please make sure the Flask backend server is running on port 5000",
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
        message: "Please make sure the Flask backend server is running on port 5000",
      },
      { status: 503 },
    )
  }
}
