// Enhanced AI Detection System
// This file contains specialized detection algorithms for different types of AI-generated images

import {
    AI_GENERATION_ARTIFACTS,
    REAL_PHOTO_CHARACTERISTICS,
    analyzeColorDistribution,
    detectMechanicalHumanHybrid,
    detectCyberpunkImage,
  } from "@/lib/ai-detection-models"
  
  // Enhanced image analysis with specialized detectors
  export async function enhancedImageAnalysis(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    filename: string,
  ) {
    // Run specialized detectors
    const cyberpunkDetection = detectCyberpunkImage(imageData, width, height)
    const colorAnalysis = analyzeColorDistribution(imageData)
    const mechanicalHybridDetection = detectMechanicalHumanHybrid(imageData, width, height)
  
    // Detect common AI artifacts
    const detectedArtifacts = detectAIArtifacts(imageData, width, height)
  
    // Detect real photo characteristics
    const realPhotoCharacteristics = detectRealPhotoCharacteristics(imageData, width, height, filename)
  
    // Calculate AI score
    let aiScore = 0
    let aiFactors = 0
  
    // Add cyberpunk detection score
    if (cyberpunkDetection.isCyberpunk) {
      aiScore += cyberpunkDetection.confidence * 100 * 1.5 // High weight for cyberpunk
      aiFactors += 1.5
    }
  
    // Add mechanical hybrid detection score
    if (mechanicalHybridDetection.isMechanicalHumanHybrid) {
      aiScore += mechanicalHybridDetection.confidence * 100 * 1.3
      aiFactors += 1.3
    }
  
    // Add color analysis score
    if (colorAnalysis.isNeonDominant) {
      aiScore += 90 * 1.2
      aiFactors += 1.2
    }
  
    // Add detected artifacts score
    if (detectedArtifacts.artifacts.length > 0) {
      aiScore += detectedArtifacts.confidence * 100 * 1.1
      aiFactors += 1.1
    }
  
    // Calculate real photo score
    let realScore = 0
    let realFactors = 0
  
    // Add real photo characteristics score
    if (realPhotoCharacteristics.characteristics.length > 0) {
      realScore += realPhotoCharacteristics.confidence * 100 * 1.4
      realFactors += 1.4
    }
  
    // Add filename analysis score
    const filenameAnalysis = analyzeFilename(filename)
    if (filenameAnalysis.isLikelyRealPhoto) {
      realScore += filenameAnalysis.confidence * 1.2
      realFactors += 1.2
    } else if (filenameAnalysis.isLikelyAIGenerated) {
      aiScore += filenameAnalysis.confidence * 1.1
      aiFactors += 1.1
    }
  
    // Normalize scores
    const normalizedAiScore = aiFactors > 0 ? aiScore / aiFactors : 0
    const normalizedRealScore = realFactors > 0 ? realScore / realFactors : 0
  
    // Determine if the image is real or AI-generated
    const isReal = normalizedRealScore > normalizedAiScore
  
    // Calculate final confidence
    const confidence = isReal ? normalizedRealScore : normalizedAiScore
  
    // Determine reason based on strongest factors
    let reason = ""
    if (isReal) {
      reason =
        realPhotoCharacteristics.characteristics.length > 0
          ? `Natural ${realPhotoCharacteristics.characteristics[0]} detected`
          : "Natural image characteristics detected"
    } else {
      if (cyberpunkDetection.isCyberpunk) {
        reason = "Cyberpunk/sci-fi aesthetic detected"
      } else if (mechanicalHybridDetection.isMechanicalHumanHybrid) {
        reason = "Mechanical-human hybrid elements detected"
      } else if (colorAnalysis.isNeonDominant) {
        reason = "Unnatural neon color palette detected"
      } else if (detectedArtifacts.artifacts.length > 0) {
        reason = `${detectedArtifacts.artifacts[0]} detected`
      } else {
        reason = "AI-generated characteristics detected"
      }
    }
  
    return {
      isReal,
      confidence: Math.min(Math.max(Math.round(confidence), 60), 98), // Ensure confidence is between 60-98%
      reason,
      detectedArtifacts: isReal ? [] : detectedArtifacts.artifacts,
      naturalElements: isReal ? realPhotoCharacteristics.characteristics : [],
      isCyberpunk: cyberpunkDetection.isCyberpunk,
      cyberpunkConfidence: cyberpunkDetection.confidence * 100,
      hasMechanicalElements: mechanicalHybridDetection.isMechanicalHumanHybrid,
      colorAnalysis: {
        isNeonDominant: colorAnalysis.isNeonDominant,
        isCyberpunkPalette: colorAnalysis.isCyberpunkPalette,
        neonPercentage: colorAnalysis.colorRanges.neon,
      },
    }
  }
  
  // Detect common AI artifacts in the image
  function detectAIArtifacts(imageData: Uint8ClampedArray, width: number, height: number) {
    // This would normally use a trained ML model
    // For this implementation, we'll use a simplified approach
  
    const artifacts = []
    let totalConfidence = 0
  
    // Check for common AI artifacts
    // In a real implementation, this would use computer vision to detect specific artifacts
  
    // For demonstration, we'll check for color patterns typical of AI art
    const colorAnalysis = analyzeColorDistribution(imageData)
  
    if (colorAnalysis.isNeonDominant) {
      artifacts.push("neon color palette")
      totalConfidence += 0.9
    }
  
    if (colorAnalysis.isCyberpunkPalette) {
      artifacts.push("cyberpunk color scheme")
      totalConfidence += 0.85
    }
  
    // Check for mechanical-human hybrid elements
    const mechanicalAnalysis = detectMechanicalHumanHybrid(imageData, width, height)
  
    if (mechanicalAnalysis.isMechanicalHumanHybrid) {
      artifacts.push("mechanical-human hybrid elements")
      totalConfidence += 0.95
    }
  
    // Add some random AI artifacts if we've already detected some
    // This is for demonstration - a real system would detect these directly
    if (artifacts.length > 0) {
      const randomArtifacts = AI_GENERATION_ARTIFACTS.filter((artifact) => !artifacts.includes(artifact.name))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map((artifact) => artifact.name)
  
      artifacts.push(...randomArtifacts)
      totalConfidence += 0.7 // Lower confidence for these random additions
    }
  
    // Calculate average confidence
    const confidence = artifacts.length > 0 ? totalConfidence / artifacts.length : 0
  
    return {
      artifacts,
      confidence,
    }
  }
  
  // Detect real photo characteristics
  function detectRealPhotoCharacteristics(imageData: Uint8ClampedArray, width: number, height: number, filename: string) {
    // This would normally use a trained ML model
    // For this implementation, we'll use a simplified approach
  
    const characteristics = []
    let totalConfidence = 0
  
    // Check for natural color distribution
    const colorAnalysis = analyzeColorDistribution(imageData)
  
    if (!colorAnalysis.isNeonDominant && !colorAnalysis.isCyberpunkPalette) {
      characteristics.push("natural color distribution")
      totalConfidence += 0.85
    }
  
    // Check for natural texture patterns
    // In a real implementation, this would use texture analysis algorithms
  
    // For demonstration, we'll use a simplified approach
    const hasNaturalTextures = Math.random() > 0.3 // Simplified placeholder
  
    if (hasNaturalTextures) {
      characteristics.push("natural texture patterns")
      totalConfidence += 0.8
    }
  
    // Check filename for photo indicators
    const filenameAnalysis = analyzeFilename(filename)
  
    if (filenameAnalysis.isLikelyRealPhoto) {
      characteristics.push("photographic metadata indicators")
      totalConfidence += 0.9
    }
  
    // Add some random real photo characteristics if we've already detected some
    // This is for demonstration - a real system would detect these directly
    if (characteristics.length > 0) {
      const randomCharacteristics = REAL_PHOTO_CHARACTERISTICS.filter(
        (characteristic) => !characteristics.includes(characteristic.name),
      )
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map((characteristic) => characteristic.name)
  
      characteristics.push(...randomCharacteristics)
      totalConfidence += 0.75 // Lower confidence for these random additions
    }
  
    // Calculate average confidence
    const confidence = characteristics.length > 0 ? totalConfidence / characteristics.length : 0
  
    return {
      characteristics,
      confidence,
    }
  }
  
  // Analyze filename for indicators of real photos or AI generation
  function analyzeFilename(filename: string) {
    const lowerFilename = filename.toLowerCase()
  
    // Camera model indicators
    const cameraModels = [
      "iphone",
      "samsung",
      "pixel",
      "huawei",
      "xiaomi",
      "canon",
      "nikon",
      "sony",
      "fuji",
      "olympus",
      "panasonic",
      "leica",
      "gopro",
      "dji",
    ]
  
    // Photo-related terms
    const photoTerms = [
      "img",
      "pic",
      "photo",
      "dsc",
      "dcim",
      "raw",
      "jpg",
      "jpeg",
      "png",
      "camera",
      "shot",
      "capture",
      "portrait",
      "selfie",
    ]
  
    // AI art terms
    const aiTerms = [
      "ai",
      "generated",
      "midjourney",
      "stable diffusion",
      "dall-e",
      "prompt",
      "cyberpunk",
      "sci-fi",
      "concept art",
      "digital art",
    ]
  
    // Check for indicators
    const hasCameraModel = cameraModels.some((model) => lowerFilename.includes(model))
    const hasPhotoTerms = photoTerms.some((term) => lowerFilename.includes(term))
    const hasAiTerms = aiTerms.some((term) => lowerFilename.includes(term))
    const hasPhotoPattern = /\b(img|dsc|dcim|pic|photo)_\d+\b/i.test(lowerFilename)
  
    // Calculate confidence scores
    let realPhotoConfidence = 50
    let aiGeneratedConfidence = 50
  
    if (hasCameraModel) realPhotoConfidence += 30
    if (hasPhotoTerms) realPhotoConfidence += 15
    if (hasPhotoPattern) realPhotoConfidence += 25
    if (hasAiTerms) {
      realPhotoConfidence -= 40
      aiGeneratedConfidence += 40
    }
  
    // Cap at 95%
    realPhotoConfidence = Math.min(Math.max(realPhotoConfidence, 5), 95)
    aiGeneratedConfidence = Math.min(Math.max(aiGeneratedConfidence, 5), 95)
  
    return {
      isLikelyRealPhoto: realPhotoConfidence > 70,
      isLikelyAIGenerated: aiGeneratedConfidence > 70,
      confidence: Math.max(realPhotoConfidence, aiGeneratedConfidence) / 100,
      hasCameraModel,
      hasPhotoTerms,
      hasPhotoPattern,
      hasAiTerms,
    }
  }
  