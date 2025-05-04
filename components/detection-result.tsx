"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Clock, Info, Leaf, Camera, Palette, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetectionResultProps {
  isReal: boolean
  confidence: number
  processingTime: number
  analysisDetails: {
    detectedArtifacts: string[]
    naturalElements: string[]
    detectedSubject?: string | null
    humanDetected?: boolean
    realWorldIndicators?: string[]
    reason?: string
    brandDetected?: string[]
    landscapeFeatures?: string[]
  }
}

export default function DetectionResult({ isReal, confidence, processingTime, analysisDetails }: DetectionResultProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format confidence to 2 decimal places
  const formattedConfidence = confidence.toFixed(2)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isReal ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                Likely Real
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="mr-1 h-3 w-3" />
                AI Generated
              </Badge>
            )}
            <CardTitle className="text-lg">Confidence: {formattedConfidence}%</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Processed in {processingTime.toFixed(2)} seconds
          </Badge>
        </div>
        <CardDescription>Analysis result for the uploaded image</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{isReal ? "Likely Real" : "AI Generated"}</span>
                <span>{formattedConfidence}%</span>
              </div>
              <Progress
                value={confidence}
                className={cn("h-2", isReal ? "bg-green-100" : "bg-red-100")}
                style={
                  {
                    "--progress-foreground": isReal ? "rgb(22 163 74)" : "rgb(220 38 38)",
                  } as React.CSSProperties
                }
              />
            </div>

            {analysisDetails.reason && (
              <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Detection Reason</h4>
                    <p className="text-sm text-slate-600">{analysisDetails.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Brand detection section */}
            {analysisDetails.brandDetected && analysisDetails.brandDetected.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                <h4 className="text-sm font-medium mb-2 text-green-800 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Brand Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.brandDetected.map((brand, i) => (
                    <Badge key={i} variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {brand}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Real-world brand logos are strong indicators of authentic photographs
                </p>
              </div>
            )}

            {/* Landscape features section */}
            {analysisDetails.landscapeFeatures && analysisDetails.landscapeFeatures.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                <h4 className="text-sm font-medium mb-2 text-green-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Natural Landscape Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.landscapeFeatures.slice(0, 3).map((feature, i) => (
                    <Badge key={i} variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {feature}
                    </Badge>
                  ))}
                  {analysisDetails.landscapeFeatures.length > 3 && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      +{analysisDetails.landscapeFeatures.length - 3} more
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Natural landscape features are consistent with authentic outdoor photography
                </p>
              </div>
            )}

            {analysisDetails.detectedSubject && (
              <div className="mt-4 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <div>
                  <h4 className="text-sm font-medium">Detected Subject</h4>
                  <p className="text-sm text-slate-600">{analysisDetails.detectedSubject}</p>
                </div>
              </div>
            )}

            {isReal && analysisDetails.naturalElements && analysisDetails.naturalElements.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                <h4 className="text-sm font-medium mb-2 text-green-800">Natural Characteristics</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.naturalElements.slice(0, 3).map((element, i) => (
                    <Badge key={i} variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {element}
                    </Badge>
                  ))}
                  {analysisDetails.naturalElements.length > 3 && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      +{analysisDetails.naturalElements.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {!isReal && analysisDetails.detectedArtifacts && analysisDetails.detectedArtifacts.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                <h4 className="text-sm font-medium mb-2 text-red-800">AI Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.detectedArtifacts.slice(0, 3).map((artifact, i) => (
                    <Badge key={i} variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      {artifact}
                    </Badge>
                  ))}
                  {analysisDetails.detectedArtifacts.length > 3 && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      +{analysisDetails.detectedArtifacts.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="details" className="space-y-4 pt-4">
            {analysisDetails.detectedArtifacts.length > 0 && !isReal && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-red-600" />
                  Detected AI Artifacts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.detectedArtifacts.map((artifact, i) => (
                    <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {artifact}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisDetails.naturalElements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Natural Elements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.naturalElements.map((element, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisDetails.realWorldIndicators && analysisDetails.realWorldIndicators.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-green-600" />
                  Real World Indicators
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisDetails.realWorldIndicators.map((indicator, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Brand detection details */}
            {analysisDetails.brandDetected && analysisDetails.brandDetected.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-green-600" />
                  Brand Detection
                </h4>
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-green-800">
                    Detected {analysisDetails.brandDetected.length > 1 ? "brands" : "brand"}:{" "}
                    <span className="font-medium">{analysisDetails.brandDetected.join(", ")}</span>
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    The presence of real-world brand logos like Samsung is a strong indicator of an authentic photograph
                    rather than AI-generated content.
                  </p>
                </div>
              </div>
            )}

            {/* Landscape features details */}
            {analysisDetails.landscapeFeatures && analysisDetails.landscapeFeatures.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Landscape Analysis
                </h4>
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-green-800 font-medium mb-1">Detected natural landscape features:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisDetails.landscapeFeatures.map((feature, i) => (
                      <Badge key={i} variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Natural landscapes with consistent lighting, perspective, and environmental features are typically
                    found in real photographs.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
