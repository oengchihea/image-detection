import { NextResponse } from "next/server"

export async function GET() {
  const results = {
    nextjs: {
      status: "ok",
      message: "Next.js API is working"
    },
    flask_direct: {
      status: "unknown",
      message: ""
    },
    flask_info: {
      url: "http://localhost:5000/health",
      method: "GET"
    }
  }

  try {
    // Try to connect to the Flask backend
    console.log("Attempting to connect to Flask backend...")
    
    const startTime = Date.now()
    const response = await fetch("http://localhost:5000/health", {
      method: "GET",
      cache: "no-store",
    })
    const endTime = Date.now()
    
    results.flask_direct.status = response.ok ? "ok" : "error"
    
    if (response.ok) {
      const data = await response.json()
      results.flask_direct.message = `Connected successfully in ${endTime - startTime}ms. Response: ${JSON.stringify(data)}`
    } else {
      results.flask_direct.message = `Connection failed with status ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    results.flask_direct.status = "error"
    results.flask_direct.message = `Connection error: ${error instanceof Error ? error.message : String(error)}`
  }

  return NextResponse.json(results)
}