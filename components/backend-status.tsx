"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function BackendStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkBackendStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/detect/status")
      const data = await response.json()

      if (data.status === "online") {
        setStatus("online")
        setMessage("Backend server is connected and ready")
      } else {
        setStatus("offline")
        setMessage(data.message || "Backend server is not available")
        setDetails(data.details || [])
      }
    } catch (error) {
      setStatus("offline")
      setMessage("Error checking backend status")
      setDetails([error instanceof Error ? error.message : String(error)])
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkBackendStatus()

    // Set up periodic checking
    const intervalId = setInterval(checkBackendStatus, 30000) // Check every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="mb-6">
      {status === "loading" ? (
        <Alert className="bg-gray-100 border-gray-300">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-gray-500" />
            <AlertTitle>Checking backend connection...</AlertTitle>
          </div>
        </Alert>
      ) : status === "online" ? (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            <AlertTitle>Connected</AlertTitle>
            <Button variant="outline" size="sm" className="ml-auto" onClick={checkBackendStatus} disabled={isChecking}>
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertTitle>Backend Offline</AlertTitle>
            <Button variant="outline" size="sm" className="ml-auto" onClick={checkBackendStatus} disabled={isChecking}>
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          <AlertDescription className="mt-2">
            <p className="font-medium">{message}</p>
            {details.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Error details:</p>
                <ul className="text-xs list-disc pl-5 space-y-1">
                  {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
