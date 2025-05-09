    /**
 * Ensemble detector that combines multiple detection methods
 * for more accurate AI-generated image detection
 */

import { analyzeHumanFace, detectNaturalImage } from "./natural-image-detection"
import { detectAIGeneratedImage } from "./ai-generation-detection"
import { analyzeFrequencyDomain, detectGanFrequencyArtifacts } from "./frequency-analysis"

// Detector weights for ensemble
const DETECTOR_WEIGHTS = {
  naturalImageDetection: 3.0,
  humanFaceAnalysis: 2.5,
  aiArtifactDetection: 2.5,
  frequencyAnalysis: 2.0,
  ganArchitectureDetection: 1.5,
}

/**
 * Ensemble detector that combines multiple specialized detectors
 * @param imageData Raw image data
 * @param width Image width
 * @param height Image height
 * @param fileName File name for metadata analysis
 * @returns Combined detection result with ensemble confidence
 */
export async function ensembleDetect(imageData: Uint8ClampedArray, width: number, height: number, fileName: string) {
  // Run all detectors in parallel for efficiency
  const [naturalImageResult, humanFaceResult, aiArtifactResult, frequencyResult, ganArchitectureResult] =
    await Promise.all([
      detectNaturalImage(imageData, width, height),
      analyzeHumanFace(imageData, width, height, fileName),
      detectAIGeneratedImage(imageData, width, height),
      analyzeFrequencyDomain(imageData, width, height),
      detectGanFrequencyArtifacts(imageData, width, height),
    ])

  // Initialize scores
  let realScore = 0
  let aiScore = 0
  const detectorResults = []

  // 1. Natural Image Detection
  if (naturalImageResult.isNaturalImage) {
    realScore += 100 * DETECTOR_WEIGHTS.naturalImageDetection
    detectorResults.push({
      name: "Natural Image Detection",
      isReal: true,
      confidence: naturalImageResult.confidence,
      weight: DETECTOR_WEIGHTS.naturalImageDetection,
      details: "Natural image characteristics detected",
    })
  } else {
    aiScore += 70 * DETECTOR_WEIGHTS.naturalImageDetection
    detectorResults.push({
      name: "Natural Image Detection",
      isReal: false,
      confidence: 100 - naturalImageResult.confidence,
      weight: DETECTOR_WEIGHTS.naturalImageDetection,
      details: "Unnatural image characteristics detected",
    })
  }

  // 2. Human Face Analysis
  if (humanFaceResult.faceDetected) {
    if (humanFaceResult.isRealHuman) {
      realScore += 100 * DETECTOR_WEIGHTS.humanFaceAnalysis
      detectorResults.push({
        name: "Human Face Analysis",
        isReal: true,
        confidence: humanFaceResult.confidence,
        weight: DETECTOR_WEIGHTS.humanFaceAnalysis,
        details: "Real human face detected",
      })
    } else {
      aiScore += 100 * DETECTOR_WEIGHTS.humanFaceAnalysis
      detectorResults.push({
        name: "Human Face Analysis",
        isReal: false,
        confidence: humanFaceResult.confidence,
        weight: DETECTOR_WEIGHTS.humanFaceAnalysis,
        details: "AI-generated face detected",
      })
    }
  }

  // 3. AI Artifact Detection
  if (aiArtifactResult.isAIGenerated) {
    aiScore += 100 * DETECTOR_WEIGHTS.aiArtifactDetection
    detectorResults.push({
      name: "AI Artifact Detection",
      isReal: false,
      confidence: aiArtifactResult.confidence,
      weight: DETECTOR_WEIGHTS.aiArtifactDetection,
      details: "AI generation artifacts detected",
    })
  } else {
    realScore += 70 * DETECTOR_WEIGHTS.aiArtifactDetection
    detectorResults.push({
      name: "AI Artifact Detection",
      isReal: true,
      confidence: 100 - aiArtifactResult.confidence,
      weight: DETECTOR_WEIGHTS.aiArtifactDetection,
      details: "No significant AI artifacts detected",
    })
  }

  // 4. Frequency Analysis
  if (frequencyResult.hasGanArtifacts) {
    aiScore += 100 * DETECTOR_WEIGHTS.frequencyAnalysis
    detectorResults.push({
      name: "Frequency Analysis",
      isReal: false,
      confidence: frequencyResult.confidence,
      weight: DETECTOR_WEIGHTS.frequencyAnalysis,
      details: "Frequency domain artifacts detected",
    })
  } else {
    realScore += 80 * DETECTOR_WEIGHTS.frequencyAnalysis
    detectorResults.push({
      name: "Frequency Analysis",
      isReal: true,
      confidence: 100 - frequencyResult.confidence,
      weight: DETECTOR_WEIGHTS.frequencyAnalysis,
      details: "Natural frequency patterns detected",
    })
  }

  // 5. GAN Architecture Detection
  if (ganArchitectureResult.architectureDetection.isKnownGan) {
    aiScore += 100 * DETECTOR_WEIGHTS.ganArchitectureDetection
    detectorResults.push({
      name: "GAN Architecture Detection",
      isReal: false,
      confidence: ganArchitectureResult.architectureDetection.confidence,
      weight: DETECTOR_WEIGHTS.ganArchitectureDetection,
      details: `Detected ${ganArchitectureResult.architectureDetection.detectedArchitecture} architecture patterns`,
    })
  }

  // Calculate total weights used
  const totalWeightUsed = detectorResults.reduce((sum, result) => sum + result.weight, 0)

  // Calculate final scores
  const normalizedRealScore = realScore / totalWeightUsed
  const normalizedAiScore = aiScore / totalWeightUsed

  // Determine if the image is real or AI-generated
  const isReal = normalizedRealScore > normalizedAiScore

  // Calculate confidence
  const confidence = isReal
    ? (normalizedRealScore / (normalizedRealScore + normalizedAiScore)) * 100
    : (normalizedAiScore / (normalizedRealScore + normalizedAiScore)) * 100

  return {
    isReal,
    confidence,
    realScore: normalizedRealScore,
    aiScore: normalizedAiScore,
    detectorResults,
    frequencyAnalysis: frequencyResult,
    ganArchitectureDetection: ganArchitectureResult.architectureDetection,
  }
}
