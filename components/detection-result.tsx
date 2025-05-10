"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Progress } from "./progress"
import { CheckCircle, AlertCircle, Clock, Info, User, ImageIcon } from "lucide-react"
import { useState } from "react"

interface DetectionResultProps {
  isReal: boolean
  confidence: number
  processingTime: number
  analysisDetails: {
    detectedArtifacts: string[]
    naturalElements?: string[]
    detectedSubject?: string | null
    humanDetected?: boolean
    realWorldIndicators?: string[]
    reason?: string
    brandDetected?: string[]
    landscapeFeatures?: string[]
    enhancedAnalysis?: {
      backendResult?: {
        heatmap_url?: string
        frequency_analysis?: string
        model_results?: any[]
        frequency_features?: {
          low_to_high_ratio: number
          mid_to_high_ratio: number
          filtered_std: number
        }
      }
    }
    aiIndicators?: string[]
  }
}

export default function DetectionResultComponent({
  isReal,
  confidence,
  processingTime,
  analysisDetails,
}: DetectionResultProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Detection Result</CardTitle>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            {processingTime.toFixed(2)}s
          </div>
        </div>
        <CardDescription>
          {isReal ? "This image appears to be a real photograph" : "This image appears to be AI-generated"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            {isReal ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Real Photo
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                AI Generated
              </div>
            )}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Confidence: {confidence.toFixed(2)}%</span>
          </div>

          <Progress
            value={confidence}
            className={`h-2 ${isReal ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {analysisDetails.reason && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Detection Reason</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{analysisDetails.reason}</p>
              </div>
            )}

            {analysisDetails.detectedSubject && (
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {analysisDetails.detectedSubject === "human" ? (
                    <User className="h-5 w-5 text-blue-500" />
                  ) : analysisDetails.detectedSubject === "landscape" ? (
                    <ImageIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <Info className="h-5 w-5 text-purple-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium mb-1 dark:text-white">Detected Subject</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {analysisDetails.detectedSubject}
                  </p>
                </div>
              </div>
            )}

            {analysisDetails.naturalElements && analysisDetails.naturalElements.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Natural Elements Detected</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.naturalElements.slice(0, 5).map((element, i) => (
                    <li key={i}>{element}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.detectedArtifacts && analysisDetails.detectedArtifacts.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">AI Artifacts Detected</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.detectedArtifacts.slice(0, 5).map((artifact, i) => (
                    <li key={i}>{artifact}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.humanDetected && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">Human Subject Detected</h3>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  {isReal
                    ? "Natural human features detected with realistic characteristics"
                    : "AI-generated human features detected with potential uncanny valley effects"}
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            {analysisDetails.realWorldIndicators && analysisDetails.realWorldIndicators.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Real-World Indicators</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.realWorldIndicators.slice(0, 8).map((indicator, i) => (
                    <li key={i}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.aiIndicators && analysisDetails.aiIndicators.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">AI Generation Indicators</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.aiIndicators.slice(0, 8).map((indicator, i) => (
                    <li key={i}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.landscapeFeatures && analysisDetails.landscapeFeatures.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Landscape Features</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.landscapeFeatures.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.brandDetected && analysisDetails.brandDetected.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Brands Detected</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {analysisDetails.brandDetected.map((brand, i) => (
                    <li key={i}>{brand}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisDetails.enhancedAnalysis?.backendResult?.model_results && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Model Results</h3>
                <div className="space-y-2">
                  {analysisDetails.enhancedAnalysis.backendResult.model_results.map((model, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm font-medium">{model.model_name}</span>
                      <div className="flex items-center">
                        <span
                          className={`text-sm ${model.prediction === "Real" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} mr-2`}
                        >
                          {model.prediction}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{model.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisDetails.enhancedAnalysis?.backendResult?.frequency_features && (
              <div>
                <h3 className="font-medium mb-2 dark:text-white">Frequency Analysis</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
                  <li>
                    Low-to-high frequency ratio:{" "}
                    {analysisDetails.enhancedAnalysis.backendResult.frequency_features.low_to_high_ratio.toFixed(2)}
                  </li>
                  <li>
                    Mid-to-high frequency ratio:{" "}
                    {analysisDetails.enhancedAnalysis.backendResult.frequency_features.mid_to_high_ratio.toFixed(2)}
                  </li>
                  <li>
                    Filtered standard deviation:{" "}
                    {analysisDetails.enhancedAnalysis.backendResult.frequency_features.filtered_std.toFixed(2)}
                  </li>
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
