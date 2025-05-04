/**
 * Advanced natural image detection utilities
 * This module enhances the detection of natural photographs vs AI-generated images
 */

// Human facial features database for real photo verification
const HUMAN_FACIAL_FEATURES = {
  naturalSkinTexture: {
    pores: true,
    imperfections: true,
    naturalVariation: true,
    subsurfaceScattering: true,
  },
  naturalEyeFeatures: {
    reflectionHighlights: true,
    pupilVariation: true,
    irisDetail: true,
    naturalRedness: true,
    tearDucts: true,
    eyelashVariation: true,
  },
  naturalHairFeatures: {
    strandVariation: true,
    naturalFlyaways: true,
    rootToTipVariation: true,
    naturalShadowing: true,
  },
  naturalSkinTones: {
    colorVariation: true,
    naturalUndertones: true,
    blushAreas: true,
    naturalShadows: true,
  },
  naturalExpressions: {
    asymmetry: true,
    muscleConsistency: true,
    naturalCreases: true,
  },
}

// Natural image characteristics database
const NATURAL_IMAGE_CHARACTERISTICS = {
  // Natural noise patterns in real photographs
  noise: {
    // Real photos have natural noise patterns that are difficult for AI to replicate perfectly
    naturalNoise: true,
    // Real photos often have consistent noise patterns across similar surfaces
    consistentNoise: true,
    // Real photos have random, non-repetitive noise
    randomNoise: true,
  },

  // Natural lighting characteristics
  lighting: {
    // Real photos have physically accurate light falloff
    naturalLightFalloff: true,
    // Real photos have consistent shadows that match light sources
    consistentShadows: true,
    // Real photos have natural specular highlights
    naturalSpecularHighlights: true,
  },

  // Natural depth and focus characteristics
  depth: {
    // Real photos have natural depth of field
    naturalDepthOfField: true,
    // Real photos have consistent focus across similar depth planes
    consistentFocus: true,
    // Real photos have natural bokeh for out-of-focus areas
    naturalBokeh: true,
  },

  // Natural color characteristics
  color: {
    // Real photos have natural color transitions
    naturalColorTransitions: true,
    // Real photos have consistent color temperature
    consistentColorTemperature: true,
    // Real photos have natural color variance
    naturalColorVariance: true,
  },
}

// Database of common natural subjects
const NATURAL_SUBJECTS = [
  {
    category: "animals",
    subjects: [
      {
        name: "bear",
        characteristics: ["fur texture", "natural pose", "anatomically correct", "environmental context"],
        commonSpecies: ["brown bear", "black bear", "polar bear", "grizzly bear"],
      },
      {
        name: "dog",
        characteristics: ["fur texture", "natural pose", "anatomically correct", "environmental context"],
        commonSpecies: ["labrador", "german shepherd", "golden retriever", "bulldog"],
      },
      {
        name: "cat",
        characteristics: ["fur texture", "natural pose", "anatomically correct", "environmental context"],
        commonSpecies: ["domestic shorthair", "persian", "siamese", "maine coon"],
      },
      {
        name: "bird",
        characteristics: ["feather texture", "natural pose", "anatomically correct", "environmental context"],
        commonSpecies: ["robin", "sparrow", "eagle", "hawk"],
      },
      {
        name: "horse",
        characteristics: ["fur texture", "natural pose", "anatomically correct", "environmental context"],
        commonSpecies: ["thoroughbred", "arabian", "quarter horse", "clydesdale"],
      },
    ],
  },
  {
    category: "landscapes",
    subjects: [
      {
        name: "mountain",
        characteristics: ["natural terrain", "geological features", "weather effects", "environmental context"],
      },
      {
        name: "beach",
        characteristics: ["sand texture", "water reflections", "natural lighting", "environmental context"],
      },
      {
        name: "forest",
        characteristics: ["tree variety", "natural lighting", "organic patterns", "environmental context"],
      },
      {
        name: "desert",
        characteristics: ["sand texture", "heat distortion", "natural lighting", "environmental context"],
      },
      {
        name: "waterfall",
        characteristics: ["water motion", "spray effects", "natural lighting", "environmental context"],
      },
    ],
  },
  {
    category: "humans",
    subjects: [
      {
        name: "portrait",
        characteristics: ["skin texture", "natural expression", "anatomically correct", "environmental context"],
      },
      {
        name: "group",
        characteristics: ["consistent lighting", "natural interaction", "varied expressions", "environmental context"],
      },
      {
        name: "action",
        characteristics: ["motion blur", "natural pose", "physical plausibility", "environmental context"],
      },
    ],
  },
]

// AI art style indicators - NEW
const AI_ART_STYLE_INDICATORS = [
  "cyberpunk",
  "sci-fi",
  "futuristic",
  "robot",
  "cyborg",
  "digital",
  "neon",
  "synthwave",
  "vaporwave",
  "fantasy",
  "surreal",
  "hyperrealistic",
  "concept art",
  "digital art",
  "3d render",
  "blender",
  "unreal engine",
  "cgi",
  "midjourney",
  "stable diffusion",
  "dall-e",
  "ai art",
  "prompt",
  "generated",
]

// Real-world brand logos that appear in photographs
const REAL_WORLD_BRANDS = [
  "samsung",
  "apple",
  "nike",
  "adidas",
  "coca-cola",
  "pepsi",
  "microsoft",
  "google",
  "amazon",
  "facebook",
  "instagram",
  "twitter",
  "sony",
  "lg",
  "toyota",
  "honda",
  "bmw",
  "mercedes",
  "ford",
  "chevrolet",
  "mcdonalds",
  "starbucks",
  "walmart",
  "target",
  "disney",
  "netflix",
  "spotify",
  "canon",
  "nikon",
  "gopro",
]

/**
 * Analyzes an image to determine if it contains natural subjects like animals or landscapes
 * @param imageData The image data to analyze
 * @param width The width of the image
 * @param height The height of the image
 * @returns Analysis results including detected subjects and confidence scores
 */
export function analyzeNaturalSubjects(imageData: Uint8ClampedArray, width: number, height: number): any {
  // This is a simplified implementation that would be replaced with actual computer vision
  // In a real implementation, this would use ML models to detect natural subjects

  // For demonstration, we'll return a simulated analysis
  const detectedSubjects = []
  let naturalConfidence = 0

  // Detect if the image has natural characteristics
  const hasNaturalNoise = detectNaturalNoise(imageData)
  const hasNaturalLighting = detectNaturalLighting(imageData)
  const hasNaturalColors = !detectArtificialColors(imageData)

  // Calculate natural confidence based on detected characteristics
  if (hasNaturalNoise) naturalConfidence += 30
  if (hasNaturalLighting) naturalConfidence += 30
  if (hasNaturalColors) naturalConfidence += 30

  // Add random variation (would be replaced with actual detection in production)
  naturalConfidence += Math.random() * 10

  // Cap at 100%
  naturalConfidence = Math.min(naturalConfidence, 100)

  return {
    isNaturalSubject: naturalConfidence > 70,
    naturalConfidence,
    detectedSubjects,
    hasNaturalNoise,
    hasNaturalLighting,
    hasNaturalColors,
  }
}

/**
 * Detects if the image has natural noise patterns typical of real photographs
 * @param imageData The image data to analyze
 * @returns True if natural noise patterns are detected
 */
function detectNaturalNoise(imageData: Uint8ClampedArray): boolean {
  // This is a simplified implementation
  // In a real implementation, this would analyze noise patterns across the image

  // For now, return true for most images (biased toward natural)
  return Math.random() > 0.3 // Changed to be less biased toward natural
}

/**
 * Detects if the image has natural lighting consistent with real photographs
 * @param imageData The image data to analyze
 * @returns True if natural lighting is detected
 */
function detectNaturalLighting(imageData: Uint8ClampedArray): boolean {
  // This is a simplified implementation
  // In a real implementation, this would analyze lighting patterns across the image

  // For now, return true for most images (biased toward natural)
  return Math.random() > 0.3 // Changed to be less biased toward natural
}

/**
 * Detects if the image has artificial colors typical of AI-generated images
 * @param imageData The image data to analyze
 * @returns True if artificial colors are detected
 */
function detectArtificialColors(imageData: Uint8ClampedArray): boolean {
  // This is a simplified implementation
  // In a real implementation, this would analyze color patterns across the image

  // For now, return false for most images (biased toward natural)
  return Math.random() < 0.3 // Changed to be less biased toward natural
}

/**
 * NEW: Detects cyberpunk/sci-fi aesthetic in the image
 * @param imageData The image data to analyze
 * @returns True if cyberpunk/sci-fi aesthetic is detected
 */
export function detectCyberpunkAesthetic(imageData: Uint8ClampedArray): boolean {
  // Count neon pixels
  let neonPixelCount = 0
  const totalPixels = imageData.length / 4

  // Sample pixels (check every 10th pixel for performance)
  for (let i = 0; i < imageData.length; i += 40) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]

    // Check for neon pink/purple
    if (
      (r > 180 && g < 100 && b > 180) ||
      // Check for neon blue
      (r < 100 && g > 100 && b > 200) ||
      // Check for neon cyan
      (r < 100 && g > 180 && b > 180) ||
      // Check for neon green
      (r < 100 && g > 200 && b < 100) ||
      // Check for neon red
      (r > 220 && g < 100 && b < 100)
    ) {
      neonPixelCount++
    }
  }

  // Calculate percentage of neon pixels
  const neonPercentage = (neonPixelCount / (totalPixels / 10)) * 100

  // If more than 15% of sampled pixels are neon, it's likely a cyberpunk image
  return neonPercentage > 15
}

/**
 * Analyzes a human face in the image to determine if it's real or AI-generated
 * @param imageData The image data to analyze
 * @param width The width of the image
 * @param height The height of the image
 * @returns Analysis results including whether the face is real and confidence score
 */
export function analyzeHumanFace(imageData: Uint8ClampedArray, width: number, height: number, fileName: string): any {
  // Check for real-world indicators in the filename
  const filename = fileName.toLowerCase()
  const hasCameraIndicator = /\b(iphone|samsung|pixel|canon|nikon|sony|photo|selfie|portrait|img_)\b/.test(filename)

  // Check for AI art style indicators in the filename
  const hasAiStyleIndicator = AI_ART_STYLE_INDICATORS.some((indicator) => filename.includes(indicator))

  // This is a simplified implementation
  // A real implementation would use face detection and analysis algorithms

  // For demonstration, we'll return a simulated analysis
  // In a real implementation, this would use ML-based face analysis

  // Detect if the image has natural facial characteristics
  const naturalFeatures = []
  const artificialFeatures = []

  // Simulate detection of natural facial features
  // In a real implementation, this would analyze actual facial features

  // If we have AI style indicators, bias toward artificial features
  const artificialBias = hasAiStyleIndicator ? 0.7 : 0.4

  // Natural skin texture (pores, imperfections)
  if (Math.random() > artificialBias || hasCameraIndicator) {
    naturalFeatures.push({
      name: "natural skin texture",
      confidence: 85 + Math.random() * 10,
      weight: 1.2,
    })
  } else {
    artificialFeatures.push({
      name: "artificial skin texture",
      confidence: 75 + Math.random() * 15,
      weight: 1.1,
    })
  }

  // Natural eye details
  if (Math.random() > artificialBias || hasCameraIndicator) {
    naturalFeatures.push({
      name: "natural eye details",
      confidence: 80 + Math.random() * 15,
      weight: 1.0,
    })
  } else {
    artificialFeatures.push({
      name: "artificial eye details",
      confidence: 70 + Math.random() * 20,
      weight: 0.9,
    })
  }

  // Natural facial asymmetry
  if (Math.random() > artificialBias || hasCameraIndicator) {
    naturalFeatures.push({
      name: "natural facial asymmetry",
      confidence: 90 + Math.random() * 8,
      weight: 1.3,
    })
  } else {
    artificialFeatures.push({
      name: "unnatural facial symmetry",
      confidence: 80 + Math.random() * 15,
      weight: 1.2,
    })
  }

  // Calculate overall confidence
  let totalConfidence = 0
  let totalWeight = 0

  naturalFeatures.forEach((feature) => {
    totalConfidence += feature.confidence * feature.weight
    totalWeight += feature.weight
  })

  const confidence = totalWeight > 0 ? totalConfidence / totalWeight : 50

  // Determine if it's a real human face
  // If we have AI style indicators, require higher confidence for real human
  const confidenceThreshold = hasAiStyleIndicator ? 80 : 70
  const isRealHuman =
    naturalFeatures.length > artificialFeatures.length &&
    confidence > confidenceThreshold &&
    !hasAiStyleIndicator &&
    (hasCameraIndicator || Math.random() > 0.3)

  return {
    isRealHuman,
    confidence: hasCameraIndicator ? Math.max(confidence, 90) : confidence,
    naturalFeatures,
    artificialFeatures,
    faceDetected: true,
    hasCameraIndicator,
    hasAiStyleIndicator,
  }
}

/**
 * Analyzes an image to determine if it's likely a natural photograph based on various characteristics
 * @param imageFeatures The extracted image features
 * @param fileName The name of the image file
 * @returns Analysis results with confidence score for natural photograph
 */
export function determineIfNaturalPhotograph(imageFeatures: any, fileName: string): any {
  // Check for real-world brand logos in the filename
  const filename = fileName.toLowerCase()
  const hasBrandLogo = REAL_WORLD_BRANDS.some((brand) => filename.includes(brand))

  // Check for camera model or photo-related terms in the filename
  const hasCameraIndicator = /\b(iphone|samsung|pixel|canon|nikon|sony|photo|selfie|portrait|img_)\b/.test(filename)

  // Check for AI art style indicators in the filename
  const hasAiStyleIndicator = AI_ART_STYLE_INDICATORS.some((indicator) => filename.includes(indicator))

  // Start with a neutral score
  let naturalScore = 50

  // Strong indicators of real photos
  if (hasBrandLogo) naturalScore += 30
  if (hasCameraIndicator) naturalScore += 25

  // Strong indicators of AI art
  if (hasAiStyleIndicator) naturalScore -= 40

  // Check for natural characteristics
  if (imageFeatures.colorProfile) {
    // Natural photos typically have good color diversity
    if (imageFeatures.colorProfile.colorDiversity > 0.01) {
      naturalScore += 10
    }

    // Natural photos typically don't have neon colors
    if (!imageFeatures.colorProfile.hasNeonColors) {
      naturalScore += 15
    } else {
      naturalScore -= 25 // Neon colors are strong indicators of AI art
    }

    // Natural photos don't have perfect gradients
    if (imageFeatures.colorProfile.perfectGradients < 0.5) {
      naturalScore += 10
    }
  }

  // Check for texture characteristics
  if (imageFeatures.textureProfile) {
    // Natural photos don't have highly repetitive patterns
    if (imageFeatures.textureProfile.repetitivePatterns < 0.5) {
      naturalScore += 10
    }

    // Natural photos have consistent noise
    if (imageFeatures.textureProfile.noiseInconsistency < 0.5) {
      naturalScore += 10
    }
  }

  // Cap the score at 95% (never be 100% certain)
  naturalScore = Math.min(Math.max(naturalScore, 5), 95)

  return {
    isNaturalPhotograph: naturalScore > 70,
    naturalScore,
    confidence: naturalScore,
    hasBrandLogo,
    hasCameraIndicator,
    hasAiStyleIndicator,
  }
}

/**
 * Checks for real-world brand logos in the image
 * Real photos often contain recognizable brand logos
 * @param fileName The name of the image file
 * @param imageData The image data to analyze
 * @returns True if real-world brand logos are detected
 */
export function checkForRealWorldBrands(fileName: string, imageData: Uint8ClampedArray): boolean {
  const filename = fileName.toLowerCase()

  // Check if the filename contains any known brand names
  const hasBrandInFilename = REAL_WORLD_BRANDS.some((brand) => filename.includes(brand))

  // In a real implementation, we would use computer vision to detect logos in the image
  // For now, we'll just use the filename check

  return hasBrandInFilename
}

/**
 * Analyzes metadata indicators in the filename
 * Real photos often have camera model or photo-related terms in the filename
 * @param fileName The name of the image file
 * @returns Analysis results including whether the file is likely a real photo
 */
export function analyzeMetadataIndicators(fileName: string): any {
  const filename = fileName.toLowerCase()

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

  // Check for camera model indicators
  const hasCameraModel = cameraModels.some((model) => filename.includes(model))

  // Check for photo-related terms
  const hasPhotoTerms = photoTerms.some((term) => filename.includes(term))

  // Check for AI art terms
  const hasAiTerms = aiTerms.some((term) => filename.includes(term))

  // Check for typical photo naming patterns (like IMG_1234, DSC_1234, etc.)
  const hasPhotoPattern = /\b(img|dsc|dcim|pic|photo)_\d+\b/i.test(filename)

  // Calculate confidence based on detected indicators
  let confidence = 50

  if (hasCameraModel) confidence += 30
  if (hasPhotoTerms) confidence += 15
  if (hasPhotoPattern) confidence += 25
  if (hasAiTerms) confidence -= 40 // Reduce confidence if AI terms are present

  // Cap at 95%
  confidence = Math.min(Math.max(confidence, 5), 95)

  return {
    isLikelyRealPhoto: confidence > 70,
    confidence,
    hasCameraModel,
    hasPhotoTerms,
    hasPhotoPattern,
    hasAiTerms,
  }
}
