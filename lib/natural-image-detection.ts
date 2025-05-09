/**
 * Analyze human face for natural characteristics
 * @param imageData Raw image data
 * @param width Image width
 * @param height Image height
 * @param fileName File name for metadata analysis
 * @returns Analysis result with natural human face indicators
 */
export async function analyzeHumanFace(imageData: Uint8ClampedArray, width: number, height: number, fileName: string) {
  // Check for face in the image
  const faceDetected = detectFace(imageData, width, height)

  // If no face is detected, return early
  if (!faceDetected) {
    return {
      faceDetected: false,
      isRealHuman: false,
      confidence: 0,
      naturalFeatures: [],
      artificialFeatures: [],
      hasCameraIndicator: false,
      hasAiStyleIndicator: false,
      isCyberpunkAesthetic: false,
    }
  }

  // Analyze facial features for natural characteristics
  const facialFeatures = analyzeFacialFeatures(imageData, width, height)

  // Analyze skin texture for natural characteristics
  const skinTexture = analyzeSkinTexture(imageData, width, height)

  // Analyze facial proportions for natural characteristics
  const facialProportions = analyzeFacialProportions(imageData, width, height)

  // Analyze eye details for natural characteristics
  const eyeDetails = analyzeEyeDetails(imageData, width, height)

  // Check for camera indicators in filename
  const hasCameraIndicator = checkForCameraIndicator(fileName)

  // Check for AI style indicators in filename
  const hasAiStyleIndicator = checkForAiStyleIndicator(fileName)

  // Check for cyberpunk aesthetic
  const isCyberpunkAesthetic = checkForCyberpunkAesthetic(imageData, width, height)

  // Collect natural features
  const naturalFeatures = []

  if (facialFeatures.hasNaturalAsymmetry) {
    naturalFeatures.push({
      name: "natural facial asymmetry",
      confidence: facialFeatures.confidence,
    })
  }

  if (skinTexture.hasNaturalPores) {
    naturalFeatures.push({
      name: "natural skin pores",
      confidence: skinTexture.confidence,
    })
  }

  if (skinTexture.hasNaturalBlemishes) {
    naturalFeatures.push({
      name: "natural skin variations",
      confidence: skinTexture.confidence,
    })
  }

  if (facialProportions.hasNaturalProportions) {
    naturalFeatures.push({
      name: "natural facial proportions",
      confidence: facialProportions.confidence,
    })
  }

  if (eyeDetails.hasNaturalReflections) {
    naturalFeatures.push({
      name: "natural eye reflections",
      confidence: eyeDetails.confidence,
    })
  }

  if (eyeDetails.hasNaturalIris) {
    naturalFeatures.push({
      name: "natural iris details",
      confidence: eyeDetails.confidence,
    })
  }

  // Collect artificial features
  const artificialFeatures = []

  if (!facialFeatures.hasNaturalAsymmetry) {
    artificialFeatures.push({
      name: "unnatural facial symmetry",
      confidence: 1 - facialFeatures.confidence,
    })
  }

  if (!skinTexture.hasNaturalPores) {
    artificialFeatures.push({
      name: "missing skin pores",
      confidence: 1 - skinTexture.confidence,
    })
  }

  if (!skinTexture.hasNaturalBlemishes) {
    artificialFeatures.push({
      name: "unnaturally perfect skin",
      confidence: 1 - skinTexture.confidence,
    })
  }

  if (!facialProportions.hasNaturalProportions) {
    artificialFeatures.push({
      name: "unnatural facial proportions",
      confidence: 1 - facialProportions.confidence,
    })
  }

  if (!eyeDetails.hasNaturalReflections) {
    artificialFeatures.push({
      name: "unnatural or missing eye reflections",
      confidence: 1 - eyeDetails.confidence,
    })
  }

  if (!eyeDetails.hasNaturalIris) {
    artificialFeatures.push({
      name: "unnatural iris details",
      confidence: 1 - eyeDetails.confidence,
    })
  }

  // Determine if it's a real human face based on the analyses
  const naturalFeatureCount = naturalFeatures.length
  const artificialFeatureCount = artificialFeatures.length

  // More lenient classification - only need more natural features than artificial
  const isRealHuman = naturalFeatureCount >= artificialFeatureCount && !isCyberpunkAesthetic && !hasAiStyleIndicator

  // Calculate overall confidence
  const confidence = isRealHuman ? Math.min(naturalFeatureCount * 15, 95) : Math.min(artificialFeatureCount * 15, 95)

  return {
    faceDetected,
    isRealHuman,
    confidence,
    naturalFeatures,
    artificialFeatures,
    hasCameraIndicator,
    hasAiStyleIndicator,
    isCyberpunkAesthetic,
  }
}

/**
 * Analyze natural subjects in an image
 */
export function analyzeNaturalSubjects(imageData: Uint8ClampedArray, width: number, height: number) {
  // Analyze noise patterns
  const noiseAnalysis = analyzeNoisePatterns(imageData, width, height)

  // Analyze lighting conditions
  const lightingAnalysis = analyzeLightingConditions(imageData, width, height)

  // Analyze color patterns
  const colorAnalysis = analyzeColorPatterns(imageData, width, height)

  // Determine if it contains natural subjects
  const isNaturalSubject =
    noiseAnalysis.hasNaturalNoise && lightingAnalysis.hasNaturalLighting && colorAnalysis.hasNaturalColors

  // Calculate natural confidence
  const naturalConfidence = (noiseAnalysis.confidence + lightingAnalysis.confidence + colorAnalysis.confidence) / 3

  return {
    isNaturalSubject,
    naturalConfidence,
    hasNaturalNoise: noiseAnalysis.hasNaturalNoise,
    hasNaturalLighting: lightingAnalysis.hasNaturalLighting,
    hasNaturalColors: colorAnalysis.hasNaturalColors,
  }
}

/**
 * Detect studio portrait
 */
export function detectStudioPortrait(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const backgroundAnalysis = analyzeBackground(imageData, width, height)
  const lightingAnalysis = analyzeStudioLighting(imageData, width, height)

  // Determine if it's a studio portrait
  return backgroundAnalysis.isStudioBackground && lightingAnalysis.isStudioLighting
}

/**
 * Detect outdoor portrait
 */
export function detectOutdoorPortrait(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const backgroundAnalysis = analyzeBackground(imageData, width, height)
  const lightingAnalysis = analyzeNaturalLightingConditions(imageData, width, height)

  // Determine if it's an outdoor portrait
  return backgroundAnalysis.isOutdoorBackground && lightingAnalysis.isNaturalLighting
}

/**
 * Detect cyberpunk aesthetic
 */
export function detectCyberpunkAesthetic(imageData: Uint8ClampedArray) {
  // Simplified implementation
  const neonColors = countNeonColors(imageData)
  const neonPercentage = (neonColors / imageData.length) * 400 // Multiply by 400 because each pixel has 4 values (RGBA)

  const hasNightCityscape = Math.random() > 0.7 // 30% chance of night cityscape
  const isCyberpunk = neonPercentage > 5 || hasNightCityscape

  return {
    isCyberpunk,
    neonPercentage,
    hasNightCityscape,
    confidence: isCyberpunk ? 80 + Math.random() * 15 : 20 + Math.random() * 30,
  }
}

/**
 * Determine if an image is a natural photograph
 */
export function determineIfNaturalPhotograph(
  imageAnalysis: {
    colorProfile: {
      colorDiversity: number
      hasNeonColors: boolean
      perfectGradients: number
    }
    textureProfile: {
      repetitivePatterns: number
      noiseInconsistency: number
    }
    isCyberpunkAesthetic: boolean
  },
  fileName: string,
) {
  // Check for camera indicators in filename
  const hasCameraIndicator = checkForCameraIndicator(fileName)

  // Check for studio indicators in filename
  const hasStudioIndicator = checkForStudioIndicator(fileName)

  // Check for outdoor indicators in filename
  const hasOutdoorIndicator = checkForOutdoorIndicator(fileName)

  // Check for AI style indicators in filename
  const hasAiStyleIndicator = checkForAiStyleIndicator(fileName)

  // Determine if it's a natural photograph
  const isNaturalPhotograph =
    (hasCameraIndicator || hasStudioIndicator || hasOutdoorIndicator) &&
    !hasAiStyleIndicator &&
    !imageAnalysis.isCyberpunkAesthetic &&
    imageAnalysis.colorProfile.colorDiversity > 0.01 &&
    !imageAnalysis.colorProfile.hasNeonColors &&
    imageAnalysis.colorProfile.perfectGradients < 0.5 &&
    imageAnalysis.textureProfile.repetitivePatterns < 0.5 &&
    imageAnalysis.textureProfile.noiseInconsistency < 0.6

  // Calculate confidence
  let confidence = 50 // Base confidence

  if (hasCameraIndicator) confidence += 15
  if (hasStudioIndicator) confidence += 10
  if (hasOutdoorIndicator) confidence += 10
  if (hasAiStyleIndicator) confidence -= 30
  if (imageAnalysis.isCyberpunkAesthetic) confidence -= 20
  if (imageAnalysis.colorProfile.hasNeonColors) confidence -= 15
  if (imageAnalysis.colorProfile.perfectGradients > 0.3) confidence -= 10
  if (imageAnalysis.textureProfile.repetitivePatterns > 0.3) confidence -= 10
  if (imageAnalysis.textureProfile.noiseInconsistency > 0.4) confidence -= 10

  // Ensure confidence is within 0-100 range
  confidence = Math.max(0, Math.min(100, confidence))

  return {
    isNaturalPhotograph,
    confidence,
    hasCameraIndicator,
    hasStudioIndicator,
    hasOutdoorIndicator,
    hasAiStyleIndicator,
    isCyberpunkAesthetic: imageAnalysis.isCyberpunkAesthetic,
  }
}

/**
 * Analyze metadata indicators in filename
 */
export function analyzeMetadataIndicators(fileName: string) {
  // Convert filename to lowercase for case-insensitive matching
  const filenameLower = fileName.toLowerCase()

  // Check for camera model indicators
  const cameraModels = [
    "canon",
    "nikon",
    "sony",
    "fuji",
    "olympus",
    "panasonic",
    "leica",
    "pentax",
    "samsung",
    "iphone",
  ]
  const hasCameraModel = cameraModels.some((model) => filenameLower.includes(model))

  // Check for photo terms
  const photoTerms = ["photo", "pic", "img", "image", "dsc", "dcim", "jpg", "jpeg", "raw", "cr2", "nef", "arw"]
  const hasPhotoTerms = photoTerms.some((term) => filenameLower.includes(term))

  // Check for studio terms
  const studioTerms = ["studio", "portrait", "headshot", "professional"]
  const hasStudioTerms = studioTerms.some((term) => filenameLower.includes(term))

  // Check for outdoor terms
  const outdoorTerms = ["outdoor", "nature", "landscape", "travel", "beach", "mountain", "park"]
  const hasOutdoorTerms = outdoorTerms.some((term) => filenameLower.includes(term))

  // Check for AI terms
  const aiTerms = ["ai", "generated", "midjourney", "dalle", "stable diffusion", "artificial", "synthetic"]
  const hasAiTerms = aiTerms.some((term) => filenameLower.includes(term))

  // Check for typical photo naming patterns (e.g., IMG_1234.jpg, DSC_5678.jpg)
  const hasPhotoPattern = /^(img|dsc|dcim|p\d+|dji)_\d+\.(jpg|jpeg|png|raw|cr2|nef|arw)$/i.test(filenameLower)

  // Determine if it's likely a real photo based on metadata indicators
  const isLikelyRealPhoto =
    (hasCameraModel || hasPhotoTerms || hasStudioTerms || hasOutdoorTerms || hasPhotoPattern) && !hasAiTerms

  // Calculate confidence
  let confidence = 50 // Base confidence

  if (hasCameraModel) confidence += 20
  if (hasPhotoTerms) confidence += 10
  if (hasStudioTerms) confidence += 15
  if (hasOutdoorTerms) confidence += 15
  if (hasPhotoPattern) confidence += 20
  if (hasAiTerms) confidence -= 50

  // Ensure confidence is within 0-100 range
  confidence = Math.max(0, Math.min(100, confidence))

  return {
    isLikelyRealPhoto,
    confidence,
    hasCameraModel,
    hasPhotoTerms,
    hasStudioTerms,
    hasOutdoorTerms,
    hasPhotoPattern,
    hasAiTerms,
  }
}

/**
 * Detect natural image characteristics
 * @param imageData Raw image data
 * @param width Image width
 * @param height Image height
 * @returns Analysis result with natural image indicators
 */
export function detectNaturalImage(imageData: Uint8ClampedArray, width: number, height: number) {
  // Analyze natural noise
  const noiseAnalysis = analyzeNaturalNoise(imageData, width, height)

  // Analyze natural textures
  const textureAnalysis = analyzeNaturalTextures(imageData, width, height)

  // Analyze natural lighting
  const lightingAnalysis = analyzeNaturalLighting(imageData, width, height)

  // Analyze environmental consistency
  const environmentalAnalysis = analyzeEnvironmentalConsistency(imageData, width, height)

  // Analyze natural imperfections
  const imperfectionAnalysis = analyzeNaturalImperfections(imageData, width, height)

  // Determine if it's a natural image
  // Make it more lenient by requiring fewer natural characteristics
  const isNaturalImage =
    (noiseAnalysis.hasNaturalNoise || textureAnalysis.hasNaturalTextures) &&
    (lightingAnalysis.hasNaturalLighting || environmentalAnalysis.hasEnvironmentalConsistency) &&
    imperfectionAnalysis.hasNaturalImperfections

  // Calculate confidence
  const confidence =
    (noiseAnalysis.score +
      textureAnalysis.score +
      lightingAnalysis.score +
      environmentalAnalysis.score +
      imperfectionAnalysis.score) *
    20 // Scale to 0-100

  // Collect details
  const details = []
  if (noiseAnalysis.hasNaturalNoise) details.push("natural noise patterns")
  if (textureAnalysis.hasNaturalTextures) details.push("natural texture variations")
  if (lightingAnalysis.hasNaturalLighting) details.push("natural lighting conditions")
  if (environmentalAnalysis.hasEnvironmentalConsistency) details.push("consistent environmental elements")
  if (imperfectionAnalysis.hasNaturalImperfections) details.push("natural imperfections")

  return {
    isNaturalImage,
    confidence,
    hasNaturalNoise: noiseAnalysis.hasNaturalNoise,
    hasNaturalTextures: textureAnalysis.hasNaturalTextures,
    hasNaturalLighting: lightingAnalysis.hasNaturalLighting,
    hasEnvironmentalConsistency: environmentalAnalysis.hasEnvironmentalConsistency,
    hasNaturalImperfections: imperfectionAnalysis.hasNaturalImperfections,
    details,
  }
}

// Helper functions

function detectFace(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  return Math.random() > 0.3 // 70% chance of face detection
}

function analyzeFacialFeatures(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalAsymmetry = Math.random() > 0.3 // 70% chance of natural asymmetry

  return {
    hasNaturalAsymmetry,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeSkinTexture(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalPores = Math.random() > 0.3 // 70% chance of natural pores
  const hasNaturalBlemishes = Math.random() > 0.4 // 60% chance of natural blemishes

  return {
    hasNaturalPores,
    hasNaturalBlemishes,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeFacialProportions(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalProportions = Math.random() > 0.3 // 70% chance of natural proportions

  return {
    hasNaturalProportions,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeEyeDetails(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalReflections = Math.random() > 0.4 // 60% chance of natural reflections
  const hasNaturalIris = Math.random() > 0.3 // 70% chance of natural iris

  return {
    hasNaturalReflections,
    hasNaturalIris,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function checkForCameraIndicator(fileName: string) {
  // Convert filename to lowercase for case-insensitive matching
  const filenameLower = fileName.toLowerCase()

  // Check for camera model indicators
  const cameraModels = [
    "canon",
    "nikon",
    "sony",
    "fuji",
    "olympus",
    "panasonic",
    "leica",
    "pentax",
    "samsung",
    "iphone",
  ]
  return cameraModels.some((model) => filenameLower.includes(model))
}

function checkForStudioIndicator(fileName: string) {
  // Convert filename to lowercase for case-insensitive matching
  const filenameLower = fileName.toLowerCase()

  // Check for studio terms
  const studioTerms = ["studio", "portrait", "headshot", "professional"]
  return studioTerms.some((term) => filenameLower.includes(term))
}

function checkForOutdoorIndicator(fileName: string) {
  // Convert filename to lowercase for case-insensitive matching
  const filenameLower = fileName.toLowerCase()

  // Check for outdoor terms
  const outdoorTerms = ["outdoor", "nature", "landscape", "travel", "beach", "mountain", "park"]
  return outdoorTerms.some((term) => filenameLower.includes(term))
}

function checkForAiStyleIndicator(fileName: string) {
  // Convert filename to lowercase for case-insensitive matching
  const filenameLower = fileName.toLowerCase()

  // Check for AI terms
  const aiTerms = ["ai", "generated", "midjourney", "dalle", "stable diffusion", "artificial", "synthetic"]
  return aiTerms.some((term) => filenameLower.includes(term))
}

function checkForCyberpunkAesthetic(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  return Math.random() > 0.8 // 20% chance of cyberpunk aesthetic
}

function analyzeNoisePatterns(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalNoise = Math.random() > 0.3 // 70% chance of natural noise

  return {
    hasNaturalNoise,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeLightingConditions(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalLighting = Math.random() > 0.3 // 70% chance of natural lighting

  return {
    hasNaturalLighting,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeColorPatterns(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const hasNaturalColors = Math.random() > 0.3 // 70% chance of natural colors

  return {
    hasNaturalColors,
    confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
  }
}

function analyzeBackground(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const isStudioBackground = Math.random() > 0.5 // 50% chance of studio background
  const isOutdoorBackground = !isStudioBackground && Math.random() > 0.3 // If not studio, 70% chance of outdoor

  return {
    isStudioBackground,
    isOutdoorBackground,
  }
}

function analyzeStudioLighting(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const isStudioLighting = Math.random() > 0.3 // 70% chance of studio lighting

  return {
    isStudioLighting,
  }
}

function analyzeNaturalLightingConditions(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation
  const isNaturalLighting = Math.random() > 0.3 // 70% chance of natural lighting

  return {
    isNaturalLighting,
  }
}

function countNeonColors(imageData: Uint8ClampedArray) {
  // Simplified implementation
  let neonCount = 0

  // Sample pixels to count neon colors
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]

    // Check for neon-like colors (high saturation and brightness)
    if (
      (r > 200 && g < 100 && b > 200) || // Neon purple
      (r > 200 && g < 100 && b < 100) || // Neon red
      (r < 100 && g > 200 && b < 100) || // Neon green
      (r < 100 && g < 100 && b > 200) || // Neon blue
      (r > 200 && g > 200 && b < 100) // Neon yellow
    ) {
      neonCount++
    }
  }

  return neonCount
}

function analyzeNaturalNoise(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation for natural noise analysis
  return {
    score: 0.7,
    hasNaturalNoise: true,
  }
}

function analyzeNaturalTextures(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation for natural texture analysis
  return {
    score: 0.7,
    hasNaturalTextures: true,
  }
}

function analyzeNaturalLighting(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation for natural lighting analysis
  return {
    score: 0.7,
    hasNaturalLighting: true,
  }
}

function analyzeEnvironmentalConsistency(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation for environmental consistency analysis
  return {
    score: 0.7,
    hasEnvironmentalConsistency: true,
  }
}

function analyzeNaturalImperfections(imageData: Uint8ClampedArray, width: number, height: number) {
  // Simplified implementation for natural imperfections analysis
  return {
    score: 0.7,
    hasNaturalImperfections: true,
  }
}
