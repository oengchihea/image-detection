import { type NextRequest, NextResponse } from "next/server"
import { classifyImage } from "../../../lib/advanced-image-classifier"
import {
  generateImageHash,
  hasAnalysisInCache,
  getAnalysisFromCache,
  storeAnalysisInCache,
} from "../../../lib/cache-utils"

// Add this GET handler to check backend status
export async function GET(req: NextRequest) {
  try {
    console.log("Checking backend status...")

    // Try multiple URLs to connect to the Flask backend
    const urls = [
      "http://localhost:5000/health",
      "http://127.0.0.1:5000/health",
      "http://localhost:5000/api/detect", // Try the actual API endpoint too
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
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

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
        errorDetails.push(`${url}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    if (connected) {
      return NextResponse.json({ status: "online", data: responseData }, { status: 200 })
    } else {
      console.error("All connection attempts failed:", errorDetails)
      return NextResponse.json({ status: "offline", error: "Failed to connect to backend" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error checking backend status:", error)
    return NextResponse.json({ status: "error", error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get("image") as Blob | null

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!(imageFile instanceof Blob)) {
      return NextResponse.json({ error: "Invalid image provided" }, { status: 400 })
    }

    const imageBuffer = await imageFile.arrayBuffer()
    const imageHash = await generateImageHash(imageBuffer)

    if (await hasAnalysisInCache(imageHash)) {
      const cachedAnalysis = await getAnalysisFromCache(imageHash)
      return NextResponse.json({ ...cachedAnalysis, cached: true }, { status: 200 })
    }

    const analysis = await classifyImage(imageBuffer)

    if (!analysis) {
      return NextResponse.json({ error: "Image classification failed" }, { status: 500 })
    }

    await storeAnalysisInCache(imageHash, analysis)

    return NextResponse.json({ ...analysis, cached: false }, { status: 200 })
  } catch (error: any) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
