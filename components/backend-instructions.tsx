"use client"

import { useState } from "react"
import { Info, Terminal, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { Card } from "@/components/card"

export function BackendInstructions() {
  const [copied, setCopied] = useState(false)

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-700 dark:text-blue-300">Backend Server Setup</AlertTitle>
      <AlertDescription>
        <p className="text-blue-600 dark:text-blue-400 mb-2">
          To use the AI Image Detector, you need to start the Python backend server first.
        </p>

        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Setup</TabsTrigger>
            <TabsTrigger value="docker">Docker Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <Card className="p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded-md relative">
              <div className="flex items-center mb-2">
                <Terminal className="h-4 w-4 mr-2" />
                <span>Run these commands in your terminal:</span>
              </div>
              <div className="pl-4 space-y-2">
                <div className="flex items-start">
                  <code className="block">cd backend</code>
                </div>
                <div className="flex items-start">
                  <code className="block">python minimal_app.py</code>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => copyCommand("cd backend\npython minimal_app.py")}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="docker">
            <Card className="p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded-md relative">
              <div className="flex items-center mb-2">
                <Terminal className="h-4 w-4 mr-2" />
                <span>Run with Docker:</span>
              </div>
              <div className="pl-4 space-y-2">
                <div className="flex items-start">
                  <code className="block">cd backend</code>
                </div>
                <div className="flex items-start">
                  <code className="block">docker build -t ai-detector-backend .</code>
                </div>
                <div className="flex items-start">
                  <code className="block">docker run -p 5000:5000 ai-detector-backend</code>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() =>
                  copyCommand(
                    "cd backend\ndocker build -t ai-detector-backend .\ndocker run -p 5000:5000 ai-detector-backend",
                  )
                }
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-blue-600 dark:text-blue-400 mt-3">
          Once the backend server is running, you should see a message like:
          <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 text-xs">
            Starting minimal Flask server on http://localhost:5000
          </code>
        </p>
      </AlertDescription>
    </Alert>
  )
}
