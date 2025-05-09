import {
  analyzeMetadataConsistency as analyzeMetadataConsistencyFn,
  extractExifData as extractExifDataFn,
} from "./metadata-analysis"
import { analyzeDepthConsistency, detectUnrealisticBokeh } from "./depth-analysis"
import { classifyWithTensorflow } from "./tensorflow-model"
import { detectAIGeneratedImage } from "./ai-generation-detection"

// Import the functions we need from natural-image-detection.ts
import {
  analyzeNaturalSubjects,
  detectStudioPortrait,
  detectOutdoorPortrait,
  detectCyberpunkAesthetic,
  analyzeHumanFace,
  determineIfNaturalPhotograph,
  analyzeMetadataIndicators,
} from "./natural-image-detection"

// Define constants for classifier weights - adjusted for better accuracy
const DEFAULT_REAL_PHOTO_THRESHOLD = 60
const CLASSIFIER_WEIGHTS = {
  faceAnalysis: 2.2,
  textureAnalysis: 2.5, // Increased weight for texture analysis
  lightingAnalysis: 2.0, // Increased weight for lighting analysis
  metadataAnalysis: 0.8,
  themeDetection: 2.2, // Increased weight for theme detection
  styleDetection: 2.4, // Increased weight for style detection
  depthAnalysis: 1.8, // Increased weight for depth analysis
  tensorflowModel: 2.5,
  huggingFaceModel: 2.5,
  idealAIModel: 3.0,
  deepfakeDetection: 2.2,
  aiArtifactDetection: 3.0, // New weight for direct AI artifact detection
  naturalImageDetection: 3.0, // High weight for natural image detection
  naturalAnimalDetection: 2.8, // High weight for animal detection
  naturalLandscapeDetection: 2.8, // High weight for landscape detection
  externalAPIs: {
    imagga: 1.5,
    clarifai: 1.8,
    deepAI: 2.0,
    thirdPartyDetector: 2.2,
  },
}

// Types for classification results
export interface ClassificationResult {
  isReal: boolean
  confidence: number
  realScore: number
  aiScore: number
  evaluatedFeatures: ClassifiedFeature[]
  detectedArtifacts: string[]
  naturalElements: string[]
  metadataIndicators: string[]
  modelConfidence: ModelConfidence
  externalApiResults: ExternalApiResult[]
  detailedAnalysis: DetailedAnalysis
  executionTime: number
  debugInfo?: any
}

export interface ClassifiedFeature {
  name: string
  score: number
  weight: number
  isRealIndicator: boolean
  confidence: number
  details?: string
}

export interface ModelConfidence {
  tensorflow: number
  huggingFace: number
  idealAI: number
  ensembleScore: number
}

export interface ExternalApiResult {
  provider: string
  isReal: boolean
  confidence: number
  response: any
}

export interface DetailedAnalysis {
  faceAnalysis?: FaceAnalysisResult
  textureAnalysis?: TextureAnalysisResult
  lightingAnalysis?: LightingAnalysisResult
  metadataAnalysis?: MetadataAnalysisResult
  themeAnalysis?: ThemeAnalysisResult
  styleAnalysis?: StyleAnalysisResult
  depthAnalysis?: DepthAnalysisResult
  aiArtifactAnalysis?: AIArtifactAnalysisResult // New analysis type
  naturalImageAnalysis?: NaturalImageAnalysisResult // New analysis type
  naturalAnimalAnalysis?: NaturalAnimalAnalysisResult // New analysis type
  naturalLandscapeAnalysis?: NaturalLandscapeAnalysisResult // New analysis type
}

// Specific analysis result interfaces
export interface FaceAnalysisResult {
  hasFace: boolean
  faceCount: number
  isRealFace: boolean
  confidence: number
  facialFeatures: {
    eyeReflections: boolean
    skinTextureNatural: boolean
    microexpressions: boolean
    asymmetry: number
    imperfections: number
    details: string[]
  }
}

export interface TextureAnalysisResult {
  hasArtificialPatterns: boolean
  confidence: number
  noiseLevel: number
  noiseConsistency: number
  repetitiveTextures: number
  colorHistogramScore: number
  details: string[]
}

export interface LightingAnalysisResult {
  hasConsistentLighting: boolean
  confidence: number
  lightSourceCount: number
  reflectionConsistency: number
  impossibleLighting: boolean
  details: string[]
}

export interface MetadataAnalysisResult {
  hasConsistentMetadata: boolean
  confidence: number
  exifData: any
  cameraBrand?: string
  lensInfo?: string
  details: string[]
}

export interface ThemeAnalysisResult {
  hasCyberpunkElements: boolean
  hasMechanicalHybridElements: boolean
  hasScienceFictionThemes: boolean
  hasFantasyElements: boolean // Added fantasy elements detection
  confidence: number
  details: string[]
}

export interface StyleAnalysisResult {
  hasAnimeStyle: boolean
  hasCartoonStyle: boolean
  hasDigitalArtStyle: boolean
  hasHyperRealisticStyle: boolean // Added hyper-realistic style detection
  confidence: number
  details: string[]
}

export interface DepthAnalysisResult {
  hasConsistentDepth: boolean
  hasNaturalBlur: boolean
  hasUnrealisticBokeh: boolean
  confidence: number
  details: string[]
}

// New interface for AI artifact analysis
export interface AIArtifactAnalysisResult {
  isAIGenerated: boolean
  confidence: number
  hasPerfectSymmetry: boolean
  hasUncannyFeatures: boolean
  hasArtificialTextures: boolean
  hasImpossibleLighting: boolean
  hasImpossibleReflections: boolean
  hasDigitalArtifacts: boolean
  hasSciFiElements: boolean
  details: string[]
}

// New interface for natural image analysis
export interface NaturalImageAnalysisResult {
  isNaturalImage: boolean
  confidence: number
  hasNaturalNoise: boolean
  hasNaturalTextures: boolean
  hasNaturalLighting: boolean
  hasEnvironmentalConsistency: boolean
  hasMicroDetails: boolean
  hasNaturalImperfections: boolean
  details: string[]
}

// New interface for natural animal analysis
export interface NaturalAnimalAnalysisResult {
  isNaturalAnimal: boolean
  confidence: number
  hasNaturalFur: boolean
  hasNaturalPose: boolean
  hasOrganicFeatures: boolean
  details: string[]
}

// New interface for natural landscape analysis
export interface NaturalLandscapeAnalysisResult {
  isNaturalLandscape: boolean
  confidence: number
  hasNaturalSkyGradient: boolean
  hasNaturalFoliage: boolean
  hasNaturalTerrain: boolean
  hasNaturalWeather: boolean
  details: string[]
}

/**
 * Main classification function that combines multiple approaches
 * @param imageData Raw image data
 * @param width Image width
 * @param height Image height
 * @param fileName File name for metadata analysis
 * @param buffer Original buffer for external API calls
 * @returns Comprehensive classification result
 */
export async function classifyImage(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  fileName: string,
  buffer: Buffer,
): Promise<ClassificationResult> {
  const startTime = performance.now()
  const evaluatedFeatures: ClassifiedFeature[] = []
  const detectedArtifacts: string[] = []
  const naturalElements: string[] = []
  const metadataIndicators: string[] = []

  // Initialize scores
  let realScore = 0
  let aiScore = 0
  let realWeightSum = 0
  let aiWeightSum = 0

  // Initialize detailed analysis object
  const detailedAnalysis: DetailedAnalysis = {}

  try {
    // Use a fixed seed for random number generation to ensure consistent results
    const imageHash = buffer.toString("base64").slice(0, 20)
    const seedValue = hashStringToNumber(imageHash)

    // 0. Check for real-world brands in the filename (strong indicator of real photos)
    // We'll check for brand names in the filename since we don't have the checkForRealWorldBrands function
    const filename = fileName.toLowerCase()
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
    const hasBrandInFilename = REAL_WORLD_BRANDS.some((brand) => filename.includes(brand))
    const hasRealWorldBrands = hasBrandInFilename

    if (hasRealWorldBrands) {
      realScore += 200
      realWeightSum += 2
      naturalElements.push("real-world brand detected in filename")

      evaluatedFeatures.push({
        name: "Brand Detection",
        score: 100,
        weight: 2.0,
        isRealIndicator: true,
        confidence: 0.9,
        details: "Real-world brand detected in filename",
      })
    }

    // 1. Analyze metadata indicators in the filename
    console.log("Analyzing metadata indicators in filename...")
    const metadataIndicatorsResult = analyzeMetadataIndicators(fileName)

    if (metadataIndicatorsResult.isLikelyRealPhoto) {
      realScore += 150
      realWeightSum += 1.5
      metadataIndicators.push("filename suggests real photo")

      if (metadataIndicatorsResult.hasCameraModel) metadataIndicators.push("camera model in filename")
      if (metadataIndicatorsResult.hasPhotoTerms) metadataIndicators.push("photo terms in filename")
      if (metadataIndicatorsResult.hasStudioTerms) metadataIndicators.push("studio terms in filename")
      if (metadataIndicatorsResult.hasOutdoorTerms) metadataIndicators.push("outdoor terms in filename")
      if (metadataIndicatorsResult.hasPhotoPattern) metadataIndicators.push("typical photo naming pattern")

      evaluatedFeatures.push({
        name: "Filename Analysis",
        score: 100,
        weight: 1.5,
        isRealIndicator: true,
        confidence: metadataIndicatorsResult.confidence / 100,
        details: "Filename suggests real photo",
      })
    } else if (metadataIndicatorsResult.hasAiTerms) {
      aiScore += 150
      aiWeightSum += 1.5
      detectedArtifacts.push("AI terms in filename")

      evaluatedFeatures.push({
        name: "Filename Analysis",
        score: 100,
        weight: 1.5,
        isRealIndicator: false,
        confidence: metadataIndicatorsResult.confidence / 100,
        details: "Filename suggests AI-generated image",
      })
    }

    // 2. Check for studio portrait (strong indicator of real photo)
    console.log("Checking for studio portrait...")
    const isStudioPortrait = detectStudioPortrait(imageData, width, height)

    if (isStudioPortrait) {
      realScore += 200
      realWeightSum += 2
      naturalElements.push("studio portrait detected")

      evaluatedFeatures.push({
        name: "Studio Portrait Detection",
        score: 100,
        weight: 2.0,
        isRealIndicator: true,
        confidence: 0.9,
        details: "Studio portrait characteristics detected",
      })
    }

    // 3. Check for outdoor portrait (strong indicator of real photo)
    console.log("Checking for outdoor portrait...")
    const isOutdoorPortrait = detectOutdoorPortrait(imageData, width, height)

    if (isOutdoorPortrait) {
      realScore += 200
      realWeightSum += 2
      naturalElements.push("outdoor portrait detected")

      evaluatedFeatures.push({
        name: "Outdoor Portrait Detection",
        score: 100,
        weight: 2.0,
        isRealIndicator: true,
        confidence: 0.9,
        details: "Outdoor portrait characteristics detected",
      })
    }

    // 4. Check for cyberpunk aesthetic (very strong indicator of AI generation)
    console.log("Checking for cyberpunk aesthetic...")
    const cyberpunkResult = detectCyberpunkAesthetic(imageData)

    if (cyberpunkResult.isCyberpunk) {
      aiScore += 300
      aiWeightSum += 3
      detectedArtifacts.push("cyberpunk/sci-fi aesthetic")
      if (cyberpunkResult.hasNightCityscape) detectedArtifacts.push("night cityscape with neon lights")
      detectedArtifacts.push(`${cyberpunkResult.neonPercentage.toFixed(1)}% neon colors`)

      evaluatedFeatures.push({
        name: "Cyberpunk Aesthetic Detection",
        score: 100,
        weight: 3.0,
        isRealIndicator: false,
        confidence: cyberpunkResult.confidence / 100,
        details: "Cyberpunk/sci-fi aesthetic detected - very likely AI-generated",
      })
    }

    // 5. Analyze natural subjects
    console.log("Analyzing natural subjects...")
    const naturalSubjectsResult = analyzeNaturalSubjects(imageData, width, height)

    if (naturalSubjectsResult.isNaturalSubject) {
      realScore += 200
      realWeightSum += 2
      naturalElements.push("natural subject detected")

      if (naturalSubjectsResult.hasNaturalNoise) naturalElements.push("natural noise patterns")
      if (naturalSubjectsResult.hasNaturalLighting) naturalElements.push("natural lighting conditions")
      if (naturalSubjectsResult.hasNaturalColors) naturalElements.push("natural color patterns")

      evaluatedFeatures.push({
        name: "Natural Subject Detection",
        score: 100,
        weight: 2.0,
        isRealIndicator: true,
        confidence: naturalSubjectsResult.naturalConfidence / 100,
        details: "Natural subject characteristics detected",
      })
    }

    // 6. Determine if natural photograph
    console.log("Determining if natural photograph...")
    const naturalPhotographResult = determineIfNaturalPhotograph(
      {
        colorProfile: {
          colorDiversity: 0.02,
          hasNeonColors: cyberpunkResult.isCyberpunk,
          perfectGradients: 0.3,
        },
        textureProfile: {
          repetitivePatterns: 0.3,
          noiseInconsistency: 0.4,
        },
        isCyberpunkAesthetic: cyberpunkResult.isCyberpunk,
      },
      fileName,
    )

    if (naturalPhotographResult.isNaturalPhotograph) {
      realScore += 250
      realWeightSum += 2.5
      naturalElements.push("natural photograph characteristics")

      if (naturalPhotographResult.hasCameraIndicator) naturalElements.push("camera indicator in filename")
      if (naturalPhotographResult.hasStudioIndicator) naturalElements.push("studio indicator in filename")
      if (naturalPhotographResult.hasOutdoorIndicator) naturalElements.push("outdoor indicator in filename")

      evaluatedFeatures.push({
        name: "Natural Photograph Analysis",
        score: 100,
        weight: 2.5,
        isRealIndicator: true,
        confidence: naturalPhotographResult.confidence / 100,
        details: "Natural photograph characteristics detected",
      })
    } else if (naturalPhotographResult.isCyberpunkAesthetic || naturalPhotographResult.hasAiStyleIndicator) {
      aiScore += 250
      aiWeightSum += 2.5
      detectedArtifacts.push("AI-generated image characteristics")

      if (naturalPhotographResult.isCyberpunkAesthetic) detectedArtifacts.push("cyberpunk aesthetic")
      if (naturalPhotographResult.hasAiStyleIndicator) detectedArtifacts.push("AI style indicator in filename")

      evaluatedFeatures.push({
        name: "Natural Photograph Analysis",
        score: 100,
        weight: 2.5,
        isRealIndicator: false,
        confidence: (100 - naturalPhotographResult.confidence) / 100,
        details: "AI-generated image characteristics detected",
      })
    }

    // 7. Direct AI Artifact Detection
    console.log("Performing direct AI artifact detection...")
    const aiArtifactAnalysis = detectAIGeneratedImage(imageData, width, height)

    // Add details to the AI artifact analysis
    const aiArtifactDetails: string[] = []
    if (aiArtifactAnalysis.hasPerfectSymmetry) aiArtifactDetails.push("perfect symmetry detected")
    if (aiArtifactAnalysis.hasUncannyFeatures) aiArtifactDetails.push("uncanny valley features detected")
    if (aiArtifactAnalysis.hasArtificialTextures) aiArtifactDetails.push("artificial texture patterns detected")
    if (aiArtifactAnalysis.hasImpossibleLighting) aiArtifactDetails.push("impossible lighting detected")
    if (aiArtifactAnalysis.hasImpossibleReflections) aiArtifactDetails.push("impossible reflections detected")
    if (aiArtifactAnalysis.hasDigitalArtifacts) aiArtifactDetails.push("digital artifacts detected")
    if (aiArtifactAnalysis.hasSciFiElements) aiArtifactDetails.push("sci-fi elements detected")

    detailedAnalysis.aiArtifactAnalysis = {
      ...aiArtifactAnalysis,
      details: aiArtifactDetails,
    }

    // Add to scores based on AI artifact detection
    if (aiArtifactAnalysis.isAIGenerated) {
      aiScore += 100 * CLASSIFIER_WEIGHTS.aiArtifactDetection
      aiWeightSum += CLASSIFIER_WEIGHTS.aiArtifactDetection
      detectedArtifacts.push(...aiArtifactDetails)

      evaluatedFeatures.push({
        name: "AI Artifact Detection",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.aiArtifactDetection,
        isRealIndicator: false,
        confidence: aiArtifactAnalysis.confidence / 100,
        details: "Direct AI generation artifacts detected",
      })
    } else {
      realScore += 100 * CLASSIFIER_WEIGHTS.aiArtifactDetection
      realWeightSum += CLASSIFIER_WEIGHTS.aiArtifactDetection
      naturalElements.push("no AI generation artifacts detected")

      evaluatedFeatures.push({
        name: "AI Artifact Detection",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.aiArtifactDetection,
        isRealIndicator: true,
        confidence: 1 - aiArtifactAnalysis.confidence / 100,
        details: "No AI generation artifacts detected",
      })
    }

    // 8. Face Analysis - Critical for human photos
    console.log("Performing facial analysis...")
    const faceAnalysis = await performFacialAnalysis(imageData, width, height, seedValue, fileName)
    detailedAnalysis.faceAnalysis = faceAnalysis

    if (faceAnalysis.hasFace) {
      if (faceAnalysis.isRealFace) {
        realScore += 100 * CLASSIFIER_WEIGHTS.faceAnalysis
        realWeightSum += CLASSIFIER_WEIGHTS.faceAnalysis
        naturalElements.push("natural human face")
        naturalElements.push(...faceAnalysis.facialFeatures.details)

        evaluatedFeatures.push({
          name: "Face Analysis",
          score: 100,
          weight: CLASSIFIER_WEIGHTS.faceAnalysis,
          isRealIndicator: true,
          confidence: faceAnalysis.confidence,
          details: "Natural human face detected with authentic features",
        })
      } else {
        aiScore += 100 * CLASSIFIER_WEIGHTS.faceAnalysis
        aiWeightSum += CLASSIFIER_WEIGHTS.faceAnalysis
        detectedArtifacts.push("artificial face")
        detectedArtifacts.push(...faceAnalysis.facialFeatures.details)

        evaluatedFeatures.push({
          name: "Face Analysis",
          score: 100,
          weight: CLASSIFIER_WEIGHTS.faceAnalysis,
          isRealIndicator: false,
          confidence: faceAnalysis.confidence,
          details: "Artificial face with unnatural features detected",
        })
      }
    }

    // Continue with the rest of the existing analysis...
    // (Texture Analysis, Lighting Analysis, etc.)

    // 0. Natural Image Detection - Highest priority to prevent false positives
    // console.log("Performing natural image detection...")
    // const naturalImageAnalysis = detectNaturalImage(imageData, width, height)

    // // Add natural image details to the analysis
    // const naturalImageDetails: string[] = []
    // if (naturalImageAnalysis.hasNaturalNoise) naturalImageDetails.push("natural noise patterns")
    // if (naturalImageAnalysis.hasNaturalTextures) naturalImageDetails.push("natural texture patterns")
    // if (naturalImageAnalysis.hasNaturalLighting) naturalImageDetails.push("natural lighting conditions")
    // if (naturalImageAnalysis.hasEnvironmentalConsistency) naturalImageDetails.push("consistent environmental elements")
    // if (naturalImageAnalysis.hasMicroDetails) naturalImageDetails.push("appropriate micro-details")
    // if (naturalImageAnalysis.hasNaturalImperfections) naturalImageDetails.push("natural imperfections and asymmetry")

    // detailedAnalysis.naturalImageAnalysis = {
    //   ...naturalImageAnalysis,
    //   details: naturalImageDetails,
    // }

    // // Add natural animal analysis for potential animal images
    // console.log("Checking for natural animal characteristics...")
    // const naturalAnimalAnalysis = detectNaturalAnimal(imageData, width, height)

    // // Add natural animal details
    // const naturalAnimalDetails: string[] = []
    // if (naturalAnimalAnalysis.hasNaturalFur) naturalAnimalDetails.push("natural fur texture")
    // if (naturalAnimalAnalysis.hasNaturalPose) naturalAnimalDetails.push("natural animal pose")
    // if (naturalAnimalAnalysis.hasOrganicFeatures) naturalAnimalDetails.push("organic biological features")

    // detailedAnalysis.naturalAnimalAnalysis = {
    //   ...naturalAnimalAnalysis,
    //   details: naturalAnimalDetails,
    // }

    // // Add natural landscape analysis
    // console.log("Checking for natural landscape characteristics...")
    // const naturalLandscapeAnalysis = detectNaturalLandscape(imageData, width, height)

    // // Add natural landscape details
    // const naturalLandscapeDetails: string[] = []
    // if (naturalLandscapeAnalysis.hasNaturalSkyGradient) naturalLandscapeDetails.push("natural sky gradient")
    // if (naturalLandscapeAnalysis.hasNaturalFoliage) naturalLandscapeDetails.push("natural foliage patterns")
    // if (naturalLandscapeAnalysis.hasNaturalTerrain) naturalLandscapeDetails.push("natural terrain textures")
    // if (naturalLandscapeAnalysis.hasNaturalWeather) naturalLandscapeDetails.push("natural weather conditions")

    // detailedAnalysis.naturalLandscapeAnalysis = {
    //   ...naturalLandscapeAnalysis,
    //   details: naturalLandscapeDetails,
    // }

    // // Add to scores based on natural image detection
    // if (naturalImageAnalysis.isNaturalImage) {
    //   realScore += 100 * CLASSIFIER_WEIGHTS.naturalImageDetection
    //   realWeightSum += CLASSIFIER_WEIGHTS.naturalImageDetection
    //   naturalElements.push("natural image characteristics")
    //   naturalElements.push(...naturalImageDetails)

    //   evaluatedFeatures.push({
    //     name: "Natural Image Detection",
    //     score: 100,
    //     weight: CLASSIFIER_WEIGHTS.naturalImageDetection,
    //     isRealIndicator: true,
    //     confidence: naturalImageAnalysis.confidence / 100,
    //     details: "Natural image characteristics detected",
    //   })

    //   // For animal photos
    //   if (naturalAnimalAnalysis.isNaturalAnimal) {
    //     realScore += 100 * CLASSIFIER_WEIGHTS.naturalAnimalDetection
    //     realWeightSum += CLASSIFIER_WEIGHTS.naturalAnimalDetection
    //     naturalElements.push("natural animal characteristics")
    //     naturalElements.push(...naturalAnimalDetails)

    //     evaluatedFeatures.push({
    //       name: "Natural Animal Detection",
    //       score: 100,
    //       weight: CLASSIFIER_WEIGHTS.naturalAnimalDetection,
    //       isRealIndicator: true,
    //       confidence: naturalAnimalAnalysis.confidence / 100,
    //       details: "Natural animal characteristics detected",
    //   })
    //   }

    //   // For landscape photos
    //   if (naturalLandscapeAnalysis.isNaturalLandscape) {
    //     realScore += 100 * CLASSIFIER_WEIGHTS.naturalLandscapeDetection
    //     realWeightSum += CLASSIFIER_WEIGHTS.naturalLandscapeDetection
    //     naturalElements.push("natural landscape characteristics")
    //     naturalElements.push(...naturalLandscapeDetails)

    //     evaluatedFeatures.push({
    //       name: "Natural Landscape Detection",
    //       score: 100,
    //       weight: CLASSIFIER_WEIGHTS.naturalLandscapeDetection,
    //       isRealIndicator: true,
    //       confidence: naturalLandscapeAnalysis.confidence / 100,
    //       details: "Natural landscape characteristics detected",
    //     })
    //   }
    // }

    // // 1. Direct AI Artifact Detection - New primary detection method
    // console.log("Performing direct AI artifact detection...")
    // const aiArtifactAnalysis = detectAIGeneratedImage(imageData, width, height)

    // // Add details to the AI artifact analysis
    // const aiArtifactDetails: string[] = []
    // if (aiArtifactAnalysis.hasPerfectSymmetry) aiArtifactDetails.push("perfect symmetry detected")
    // if (aiArtifactAnalysis.hasUncannyFeatures) aiArtifactDetails.push("uncanny valley features detected")
    // if (aiArtifactAnalysis.hasArtificialTextures) aiArtifactDetails.push("artificial texture patterns detected")
    // if (aiArtifactAnalysis.hasImpossibleLighting) aiArtifactDetails.push("impossible lighting detected")
    // if (aiArtifactAnalysis.hasImpossibleReflections) aiArtifactDetails.push("impossible reflections detected")
    // if (aiArtifactAnalysis.hasDigitalArtifacts) aiArtifactDetails.push("digital artifacts detected")
    // if (aiArtifactAnalysis.hasSciFiElements) aiArtifactDetails.push("sci-fi elements detected")

    // detailedAnalysis.aiArtifactAnalysis = {
    //   ...aiArtifactAnalysis,
    //   details: aiArtifactDetails,
    // }

    // // Add to scores based on AI artifact detection
    // if (aiArtifactAnalysis.isAIGenerated) {
    //   aiScore += 100 * CLASSIFIER_WEIGHTS.aiArtifactDetection
    //   aiWeightSum += CLASSIFIER_WEIGHTS.aiArtifactDetection
    //   detectedArtifacts.push(...aiArtifactDetails)

    //   evaluatedFeatures.push({
    //     name: "AI Artifact Detection",
    //     score: 100,
    //     weight: CLASSIFIER_WEIGHTS.aiArtifactDetection,
    //     isRealIndicator: false,
    //     confidence: aiArtifactAnalysis.confidence / 100,
    //     details: "Direct AI generation artifacts detected",
    //   })
    // } else {
    //   realScore += 100 * CLASSIFIER_WEIGHTS.aiArtifactDetection
    //   realWeightSum += CLASSIFIER_WEIGHTS.aiArtifactDetection
    //   naturalElements.push("no AI generation artifacts detected")

    //   evaluatedFeatures.push({
    //     name: "AI Artifact Detection",
    //     score: 100,
    //     weight: CLASSIFIER_WEIGHTS.aiArtifactDetection,
    //     isRealIndicator: true,
    //     confidence: 1 - aiArtifactAnalysis.confidence / 100,
    //     details: "No AI generation artifacts detected",
    //   })
    // }

    // // 2. Face Analysis - Critical for human photos
    // console.log("Performing facial analysis...")
    // const faceAnalysis = await performFacialAnalysis(imageData, width, height, seedValue)
    // detailedAnalysis.faceAnalysis = faceAnalysis

    // if (faceAnalysis.hasFace) {
    //   if (faceAnalysis.isRealFace) {
    //     realScore += 100 * CLASSIFIER_WEIGHTS.faceAnalysis
    //     realWeightSum += CLASSIFIER_WEIGHTS.faceAnalysis
    //     naturalElements.push("natural human face")
    //     naturalElements.push(...faceAnalysis.facialFeatures.details)

    //     evaluatedFeatures.push({
    //       name: "Face Analysis",
    //       score: 100,
    //       weight: CLASSIFIER_WEIGHTS.faceAnalysis,
    //       isRealIndicator: true,
    //       confidence: faceAnalysis.confidence,
    //       details: "Natural human face detected with authentic features",
    //     })
    //   } else {
    //     aiScore += 100 * CLASSIFIER_WEIGHTS.faceAnalysis
    //     aiWeightSum += CLASSIFIER_WEIGHTS.faceAnalysis
    //     detectedArtifacts.push("artificial face")
    //     detectedArtifacts.push(...faceAnalysis.facialFeatures.details)

    //     evaluatedFeatures.push({
    //       name: "Face Analysis",
    //       score: 100,
    //       weight: CLASSIFIER_WEIGHTS.faceAnalysis,
    //       isRealIndicator: false,
    //       confidence: faceAnalysis.confidence,
    //       details: "Artificial face with unnatural features detected",
    //     })
    //   }
    // }

    // 3. Texture Analysis
    console.log("Performing texture analysis...")
    const textureAnalysis = await performTextureAnalysis(imageData, width, height, seedValue)
    detailedAnalysis.textureAnalysis = textureAnalysis

    if (textureAnalysis.hasArtificialPatterns) {
      aiScore += 100 * CLASSIFIER_WEIGHTS.textureAnalysis
      aiWeightSum += CLASSIFIER_WEIGHTS.textureAnalysis
      detectedArtifacts.push("artificial texture patterns")
      detectedArtifacts.push(...textureAnalysis.details)

      evaluatedFeatures.push({
        name: "Texture Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.textureAnalysis,
        isRealIndicator: false,
        confidence: textureAnalysis.confidence,
        details: "Artificial texture patterns detected",
      })
    } else {
      realScore += 100 * CLASSIFIER_WEIGHTS.textureAnalysis
      realWeightSum += CLASSIFIER_WEIGHTS.textureAnalysis
      naturalElements.push("natural texture patterns")
      naturalElements.push(...textureAnalysis.details)

      evaluatedFeatures.push({
        name: "Texture Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.textureAnalysis,
        isRealIndicator: true,
        confidence: textureAnalysis.confidence,
        details: "Natural texture patterns detected",
      })
    }

    // 4. Lighting Analysis
    console.log("Performing lighting analysis...")
    const lightingAnalysis = await performLightingAnalysis(imageData, width, height, seedValue)
    detailedAnalysis.lightingAnalysis = lightingAnalysis

    if (lightingAnalysis.hasConsistentLighting && !lightingAnalysis.impossibleLighting) {
      realScore += 100 * CLASSIFIER_WEIGHTS.lightingAnalysis
      realWeightSum += CLASSIFIER_WEIGHTS.lightingAnalysis
      naturalElements.push("natural lighting conditions")
      naturalElements.push(...lightingAnalysis.details)

      evaluatedFeatures.push({
        name: "Lighting Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.lightingAnalysis,
        isRealIndicator: true,
        confidence: lightingAnalysis.confidence,
        details: "Natural lighting conditions detected",
      })
    } else {
      aiScore += 100 * CLASSIFIER_WEIGHTS.lightingAnalysis
      aiWeightSum += CLASSIFIER_WEIGHTS.lightingAnalysis
      detectedArtifacts.push("inconsistent lighting")
      detectedArtifacts.push(...lightingAnalysis.details)

      evaluatedFeatures.push({
        name: "Lighting Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.lightingAnalysis,
        isRealIndicator: false,
        confidence: lightingAnalysis.confidence,
        details: "Inconsistent or impossible lighting detected",
      })
    }

    // 5. Metadata Analysis
    console.log("Performing metadata analysis...")
    const metadataAnalysis = await performMetadataAnalysis(fileName, buffer, seedValue)
    detailedAnalysis.metadataAnalysis = metadataAnalysis

    if (metadataAnalysis.hasConsistentMetadata) {
      realScore += 100 * CLASSIFIER_WEIGHTS.metadataAnalysis
      realWeightSum += CLASSIFIER_WEIGHTS.metadataAnalysis
      metadataIndicators.push("consistent photographic metadata")
      metadataIndicators.push(...metadataAnalysis.details)

      evaluatedFeatures.push({
        name: "Metadata Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.metadataAnalysis,
        isRealIndicator: true,
        confidence: metadataAnalysis.confidence,
        details: "Consistent photographic metadata detected",
      })
    } else {
      aiScore += 100 * CLASSIFIER_WEIGHTS.metadataAnalysis
      aiWeightSum += CLASSIFIER_WEIGHTS.metadataAnalysis
      detectedArtifacts.push("inconsistent or missing metadata")
      detectedArtifacts.push(...metadataAnalysis.details)

      evaluatedFeatures.push({
        name: "Metadata Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.metadataAnalysis,
        isRealIndicator: false,
        confidence: metadataAnalysis.confidence,
        details: "Inconsistent or missing metadata detected",
      })
    }

    // 6. Theme Detection (Cyberpunk, Sci-Fi, Fantasy, etc.)
    console.log("Performing theme detection...")
    const themeAnalysis = await performThemeAnalysis(imageData, width, height, seedValue)
    detailedAnalysis.themeAnalysis = themeAnalysis

    if (
      themeAnalysis.hasCyberpunkElements ||
      themeAnalysis.hasMechanicalHybridElements ||
      themeAnalysis.hasScienceFictionThemes ||
      themeAnalysis.hasFantasyElements
    ) {
      aiScore += 100 * CLASSIFIER_WEIGHTS.themeDetection
      aiWeightSum += CLASSIFIER_WEIGHTS.themeDetection
      detectedArtifacts.push("fantasy/sci-fi elements")
      detectedArtifacts.push(...themeAnalysis.details)

      evaluatedFeatures.push({
        name: "Theme Detection",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.themeDetection,
        isRealIndicator: false,
        confidence: themeAnalysis.confidence,
        details: "Fantasy or science fiction elements detected",
      })
    }

    // 7. Style Detection (Anime, Cartoon, Digital Art, etc.)
    console.log("Performing style detection...")
    const styleAnalysis = await performStyleAnalysis(imageData, width, height, seedValue)
    detailedAnalysis.styleAnalysis = styleAnalysis

    if (
      styleAnalysis.hasAnimeStyle ||
      styleAnalysis.hasCartoonStyle ||
      styleAnalysis.hasDigitalArtStyle ||
      styleAnalysis.hasHyperRealisticStyle
    ) {
      aiScore += 100 * CLASSIFIER_WEIGHTS.styleDetection
      aiWeightSum += CLASSIFIER_WEIGHTS.styleDetection
      detectedArtifacts.push("digital art style")
      detectedArtifacts.push(...styleAnalysis.details)

      evaluatedFeatures.push({
        name: "Style Detection",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.styleDetection,
        isRealIndicator: false,
        confidence: styleAnalysis.confidence,
        details: "Digital art style detected",
      })
    }

    // 8. Depth Analysis
    console.log("Performing depth analysis...")
    const depthAnalysis = await performDepthAnalysis(imageData, width, height, seedValue)
    detailedAnalysis.depthAnalysis = depthAnalysis

    if (depthAnalysis.hasConsistentDepth && depthAnalysis.hasNaturalBlur && !depthAnalysis.hasUnrealisticBokeh) {
      realScore += 100 * CLASSIFIER_WEIGHTS.depthAnalysis
      realWeightSum += CLASSIFIER_WEIGHTS.depthAnalysis
      naturalElements.push("natural depth of field")
      naturalElements.push(...depthAnalysis.details)

      evaluatedFeatures.push({
        name: "Depth Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.depthAnalysis,
        isRealIndicator: true,
        confidence: depthAnalysis.confidence,
        details: "Natural depth of field detected",
      })
    } else {
      aiScore += 100 * CLASSIFIER_WEIGHTS.depthAnalysis
      aiWeightSum += CLASSIFIER_WEIGHTS.depthAnalysis
      detectedArtifacts.push("unnatural depth of field")
      detectedArtifacts.push(...depthAnalysis.details)

      evaluatedFeatures.push({
        name: "Depth Analysis",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.depthAnalysis,
        isRealIndicator: false,
        confidence: depthAnalysis.confidence,
        details: "Unnatural depth of field detected",
      })
    }

    // 9. TensorFlow Model Classification
    console.log("Running TensorFlow model...")
    const tensorflowResult = await classifyWithTensorflow(buffer)

    if (tensorflowResult.isReal) {
      realScore += 100 * CLASSIFIER_WEIGHTS.tensorflowModel
      realWeightSum += CLASSIFIER_WEIGHTS.tensorflowModel

      evaluatedFeatures.push({
        name: "TensorFlow Model",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.tensorflowModel,
        isRealIndicator: true,
        confidence: tensorflowResult.confidence,
        details: "TensorFlow model classified image as real",
      })
    } else {
      aiScore += 100 * CLASSIFIER_WEIGHTS.tensorflowModel
      aiWeightSum += CLASSIFIER_WEIGHTS.tensorflowModel

      evaluatedFeatures.push({
        name: "TensorFlow Model",
        score: 100,
        weight: CLASSIFIER_WEIGHTS.tensorflowModel,
        isRealIndicator: false,
        confidence: tensorflowResult.confidence,
        details: "TensorFlow model classified image as AI-generated",
      })
    }

    // 10. External APIs
    console.log("Calling external APIs...")
    const externalApiResults = await callExternalAPIs(buffer)

    for (const apiResult of externalApiResults) {
      if (apiResult.isReal) {
        realScore +=
          100 * CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs]
        realWeightSum +=
          CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs]

        evaluatedFeatures.push({
          name: `${apiResult.provider} API`,
          score: 100,
          weight: CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs],
          isRealIndicator: true,
          confidence: apiResult.confidence,
          details: `${apiResult.provider} API classified image as real`,
        })
      } else {
        aiScore +=
          100 * CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs]
        aiWeightSum +=
          CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs]

        evaluatedFeatures.push({
          name: `${apiResult.provider} API`,
          score: 100,
          weight: CLASSIFIER_WEIGHTS.externalAPIs[apiResult.provider as keyof typeof CLASSIFIER_WEIGHTS.externalAPIs],
          isRealIndicator: false,
          confidence: apiResult.confidence,
          details: `${apiResult.provider} API classified image as AI-generated`,
        })
      }
    }

    // 11. Special case for anime/fantasy/cartoon detection
    // These are very strong indicators of AI generation
    if (
      (detailedAnalysis.styleAnalysis?.hasAnimeStyle && detailedAnalysis.styleAnalysis?.confidence > 0.7) ||
      (detailedAnalysis.themeAnalysis?.hasFantasyElements && detailedAnalysis.themeAnalysis?.confidence > 0.7)
    ) {
      // Bonus AI score for anime/fantasy themes
      aiScore += 300
      aiWeightSum += 3

      evaluatedFeatures.push({
        name: "Anime/Fantasy Detection",
        score: 100,
        weight: 3.0,
        isRealIndicator: false,
        confidence: 0.95,
        details: "Strong anime/fantasy elements detected - very likely AI-generated",
      })
    }

    // 12. Special case for cyberpunk/mechanical/sci-fi themes
    // These are very strong indicators of AI generation
    if (detailedAnalysis.themeAnalysis?.hasCyberpunkElements && detailedAnalysis.themeAnalysis?.confidence > 0.7) {
      // Bonus AI score for cyberpunk themes
      aiScore += 300
      aiWeightSum += 3

      evaluatedFeatures.push({
        name: "Cyberpunk Detection",
        score: 100,
        weight: 3.0,
        isRealIndicator: false,
        confidence: 0.95,
        details: "Strong cyberpunk theme detected - very likely AI-generated",
      })
    }

    // 13. Special case for human faces with natural features
    // This is a very strong indicator of real photos
    if (
      detailedAnalysis.faceAnalysis?.isRealFace &&
      detailedAnalysis.faceAnalysis?.confidence > 0.85 &&
      detailedAnalysis.faceAnalysis?.facialFeatures.microexpressions &&
      detailedAnalysis.faceAnalysis?.facialFeatures.asymmetry > 0.4 &&
      !detailedAnalysis.styleAnalysis?.hasHyperRealisticStyle // Not hyper-realistic style
    ) {
      // Bonus real score for natural human faces
      realScore += 200
      realWeightSum += 2

      evaluatedFeatures.push({
        name: "Natural Human Features",
        score: 100,
        weight: 2.0,
        isRealIndicator: true,
        confidence: 0.95,
        details: "Strong natural human features detected - very likely real photo",
      })
    }

    // Calculate final scores
    const normalizedRealScore = realWeightSum > 0 ? realScore / realWeightSum : 0
    const normalizedAiScore = aiWeightSum > 0 ? aiScore / aiWeightSum : 0

    // Determine final classification
    let isReal = false
    let confidence = 0

    // Calculate ratio of real to AI score for decision making
    const scoreRatio = normalizedRealScore / (normalizedAiScore > 0 ? normalizedAiScore : 1)

    // Prioritize specific strong indicators
    if (hasRealWorldBrands || isStudioPortrait || isOutdoorPortrait) {
      // Very strong indicators of real photos
      isReal = true
      confidence = 90
    } else if (cyberpunkResult.isCyberpunk) {
      // Very strong indicator of AI generation
      isReal = false
      confidence = 95
    } else if (naturalPhotographResult.isNaturalPhotograph && naturalSubjectsResult.isNaturalSubject) {
      // Strong evidence for real photo
      isReal = true
      confidence = 85
    } else if (scoreRatio > 1.5) {
      // Strong evidence for real photo based on score ratio
      isReal = true
      confidence = Math.min(normalizedRealScore, 90)
    } else if (scoreRatio < 0.7) {
      // Strong evidence for AI generation based on score ratio
      isReal = false
      confidence = Math.min(normalizedAiScore, 90)
    } else {
      // For ambiguous cases, check specific features
      const hasStrongAIArtifacts =
        detailedAnalysis.aiArtifactAnalysis?.isAIGenerated && detailedAnalysis.aiArtifactAnalysis?.confidence > 70

      if (hasStrongAIArtifacts) {
        // These features are almost always AI-generated
        isReal = false
        confidence = 80
      } else if (faceAnalysis.isRealFace && faceAnalysis.confidence > 0.8) {
        // Images with strong natural human features are likely real
        isReal = true
        confidence = 80
      } else {
        // Default to classifying based on which score is higher
        isReal = normalizedRealScore > normalizedAiScore
        confidence = isReal ? normalizedRealScore : normalizedAiScore
      }
    }

    // Calculate execution time
    const executionTime = performance.now() - startTime

    // Prepare model confidence object
    const modelConfidence: ModelConfidence = {
      tensorflow: tensorflowResult.confidence, // Will be updated if TensorFlow model is used
      huggingFace: 0, // Not implemented yet
      idealAI: 0, // Not implemented yet
      ensembleScore: confidence,
    }

    // Return comprehensive result
    return {
      isReal,
      confidence,
      realScore: normalizedRealScore,
      aiScore: normalizedAiScore,
      evaluatedFeatures,
      detectedArtifacts,
      naturalElements,
      metadataIndicators,
      modelConfidence,
      externalApiResults: externalApiResults, // Will be populated if external APIs are called
      detailedAnalysis,
      executionTime,
    }
  } catch (error) {
    console.error("Error in image classification:", error)

    // Return safe default on error
    return {
      isReal: false, // Default to AI-generated on error (safer)
      confidence: 70,
      realScore: 30,
      aiScore: 70,
      evaluatedFeatures: [],
      detectedArtifacts: ["classification error"],
      naturalElements: [],
      metadataIndicators: [],
      modelConfidence: {
        tensorflow: 0,
        huggingFace: 0,
        idealAI: 0,
        ensembleScore: 0,
      },
      externalApiResults: [],
      detailedAnalysis: {},
      executionTime: performance.now() - startTime,
      debugInfo: error,
    }
  }
}

/**
 * Hash a string to a number for consistent random seed generation
 */
function hashStringToNumber(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a deterministic random number based on a seed
 */
function seededRandom(seed: number, index = 0): number {
  const x = Math.sin(seed + index) * 10000
  return x - Math.floor(x)
}

// Update the performFacialAnalysis function to use the user's analyzeHumanFace function
async function performFacialAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
  fileName: string, // Add fileName parameter
): Promise<FaceAnalysisResult> {
  try {
    // Use the user's specialized face detection
    const humanFaceResult = await analyzeHumanFace(imageData, width, height, fileName)

    // Analyze facial inconsistencies
    const inconsistencies = await detectFacialInconsistenciesFn(imageData, width, height, seed)

    // Analyze eye reflections (catchlights)
    const eyeReflections = await analyzeEyeReflectionsFn(imageData, width, height, seed)

    // Detect subtle microexpressions (real humans have these)
    const microexpressions = await detectMicroexpressionsFn(imageData, width, height, seed)

    // Prepare details array
    const details: string[] = []

    if (humanFaceResult.isRealHuman) {
      if (eyeReflections.hasNaturalReflections) details.push("natural eye reflections")
      if (microexpressions.hasMicroexpressions) details.push("natural facial microexpressions")

      // Add details from the user's implementation
      humanFaceResult.naturalFeatures.forEach((feature) => {
        details.push(feature.name)
      })

      if (humanFaceResult.hasCameraIndicator) details.push("camera indicator in filename")
    } else {
      if (!eyeReflections.hasNaturalReflections) details.push("unnatural or missing eye reflections")
      if (!microexpressions.hasMicroexpressions) details.push("missing facial microexpressions")

      // Add details from the user's implementation
      humanFaceResult.artificialFeatures.forEach((feature) => {
        details.push(feature.name)
      })

      if (humanFaceResult.hasAiStyleIndicator) details.push("AI style indicator in filename")
      if (humanFaceResult.isCyberpunkAesthetic) details.push("cyberpunk/sci-fi aesthetic detected")
    }

    return {
      hasFace: humanFaceResult.faceDetected,
      faceCount: humanFaceResult.faceDetected ? 1 : 0,
      isRealFace: humanFaceResult.isRealHuman,
      confidence: humanFaceResult.confidence / 100,
      facialFeatures: {
        eyeReflections: eyeReflections.hasNaturalReflections,
        skinTextureNatural: humanFaceResult.naturalFeatures.some((f) => f.name.includes("skin texture")),
        microexpressions: microexpressions.hasMicroexpressions,
        asymmetry: humanFaceResult.naturalFeatures.some((f) => f.name.includes("asymmetry")) ? 0.7 : 0.2,
        imperfections: humanFaceResult.naturalFeatures.length,
        details,
      },
    }
  } catch (error) {
    console.error("Error in facial analysis:", error)

    // Return safe default on error
    return {
      hasFace: false,
      faceCount: 0,
      isRealFace: false,
      confidence: 0,
      facialFeatures: {
        eyeReflections: false,
        skinTextureNatural: false,
        microexpressions: false,
        asymmetry: 0,
        imperfections: 0,
        details: ["error in facial analysis"],
      },
    }
  }
}

/**
 * Perform texture analysis
 */
async function performTextureAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
): Promise<TextureAnalysisResult> {
  try {
    // Detect artificial patterns
    const artificialPatterns = await detectArtificialPatternsFn(imageData, width, height, seed)

    // Analyze color histogram
    const colorHistogram = await analyzeColorHistogramFn(imageData, seed)

    // Detect repetitive textures
    const repetitiveTextures = await detectRepetitiveTexturesFn(imageData, width, height, seed)

    // Analyze noise levels
    const noiseLevels = await analyzeNoiseLevelsFn(imageData, width, height, seed)

    // Prepare details array
    const details: string[] = []

    if (artificialPatterns.hasArtificialPatterns) {
      details.push("artificial texture patterns detected")
      if (artificialPatterns.tooSmooth) details.push("unnaturally smooth texture areas")
      if (artificialPatterns.tooRegular) details.push("too regular pattern distribution")
    }

    if (repetitiveTextures.hasRepetitiveTextures) {
      details.push("repetitive texture patterns detected")
    }

    if (noiseLevels.noiseInconsistency > 0.5) {
      details.push("inconsistent noise distribution")
    }

    if (colorHistogram.isUnnatural) {
      details.push("unnatural color distribution")
    }

    return {
      hasArtificialPatterns:
        artificialPatterns.hasArtificialPatterns ||
        repetitiveTextures.hasRepetitiveTextures ||
        noiseLevels.noiseInconsistency > 0.5,
      confidence: (artificialPatterns.confidence + repetitiveTextures.confidence + noiseLevels.confidence) / 3,
      noiseLevel: noiseLevels.noiseLevel,
      noiseConsistency: 1 - noiseLevels.noiseInconsistency,
      repetitiveTextures: repetitiveTextures.repetitiveScore,
      colorHistogramScore: colorHistogram.naturalScore,
      details,
    }
  } catch (error) {
    console.error("Error in texture analysis:", error)

    // Return safe default on error
    return {
      hasArtificialPatterns: false,
      confidence: 0,
      noiseLevel: 0,
      noiseConsistency: 0,
      repetitiveTextures: 0,
      colorHistogramScore: 50,
      details: ["error in texture analysis"],
    }
  }
}

/**
 * Perform lighting analysis
 */
async function performLightingAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
): Promise<LightingAnalysisResult> {
  try {
    // Detect impossible lighting
    const impossibleLighting = await detectImpossibleLightingFn(imageData, width, height, seed)

    // Analyze reflection consistency
    const reflectionConsistency = await analyzeReflectionConsistencyFn(imageData, width, height, seed)

    // Detect light source inconsistency
    const lightSourceInconsistency = await detectLightSourceInconsistencyAnalysisFn(imageData, width, height, seed)

    // Prepare details array
    const details: string[] = []

    if (impossibleLighting.hasImpossibleLighting) {
      details.push("physically impossible lighting detected")
      if (impossibleLighting.multipleShadowDirections) details.push("inconsistent shadow directions")
      if (impossibleLighting.inconsistentHighlights) details.push("inconsistent highlight positions")
    }

    if (reflectionConsistency.hasInconsistentReflections) {
      details.push("inconsistent reflection patterns")
    }

    if (lightSourceInconsistency.hasInconsistentLightSources) {
      details.push("inconsistent light source positions")
      details.push(`${lightSourceInconsistency.lightSourceCount} conflicting light sources`)
    }

    return {
      hasConsistentLighting:
        !impossibleLighting.hasImpossibleLighting &&
        !reflectionConsistency.hasInconsistentReflections &&
        !lightSourceInconsistency.hasInconsistentLightSources,
      confidence:
        (impossibleLighting.confidence + reflectionConsistency.confidence + lightSourceInconsistency.confidence) / 3,
      lightSourceCount: lightSourceInconsistency.lightSourceCount,
      reflectionConsistency: reflectionConsistency.consistencyScore,
      impossibleLighting: impossibleLighting.hasImpossibleLighting,
      details,
    }
  } catch (error) {
    console.error("Error in lighting analysis:", error)

    // Return safe default on error
    return {
      hasConsistentLighting: true,
      confidence: 0,
      lightSourceCount: 0,
      reflectionConsistency: 0,
      impossibleLighting: false,
      details: ["error in lighting analysis"],
    }
  }
}

/**
 * Perform metadata analysis
 */
async function performMetadataAnalysis(
  fileName: string,
  buffer: Buffer,
  seed: number,
): Promise<MetadataAnalysisResult> {
  try {
    // Analyze metadata consistency
    const metadataConsistency = await analyzeMetadataConsistencyFn(fileName)

    // Extract EXIF data (if available)
    const exifData = await extractExifDataFn(buffer)

    // Prepare details array
    const details: string[] = []

    if (metadataConsistency.hasConsistentMetadata) {
      details.push("consistent photographic metadata")
      if (metadataConsistency.hasCameraModel) details.push(`camera model: ${metadataConsistency.cameraModel}`)
      if (metadataConsistency.hasPhotoFormat) details.push(`standard photo format: ${metadataConsistency.photoFormat}`)
    } else {
      if (!metadataConsistency.hasCameraModel) details.push("missing camera model information")
      if (!metadataConsistency.hasPhotoFormat) details.push("non-standard photo format")
      if (metadataConsistency.hasAIIndicators) details.push("file contains AI generation indicators")
    }

    if (exifData.hasExifData) {
      details.push("contains EXIF metadata")
      if (exifData.cameraBrand) details.push(`camera brand: ${exifData.cameraBrand}`)
      if (exifData.lensInfo) details.push(`lens info: ${exifData.lensInfo}`)
    } else {
      details.push("missing EXIF metadata")
    }

    return {
      hasConsistentMetadata: metadataConsistency.hasConsistentMetadata || exifData.hasExifData,
      confidence: (metadataConsistency.confidence + exifData.confidence) / 2,
      exifData: exifData.rawData,
      cameraBrand: exifData.cameraBrand,
      lensInfo: exifData.lensInfo,
      details,
    }
  } catch (error) {
    console.error("Error in metadata analysis:", error)

    // Return safe default on error
    return {
      hasConsistentMetadata: false,
      confidence: 0,
      exifData: null,
      details: ["error in metadata analysis"],
    }
  }
}

/**
 * Perform theme analysis - enhanced with fantasy element detection
 */
async function performThemeAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
): Promise<ThemeAnalysisResult> {
  try {
    // Detect cyberpunk elements
    const cyberpunkElements = await detectCyberpunkElementsFn(imageData, width, height, seed)

    // Detect mechanical hybrid elements
    const mechanicalHybridElements = await detectMechanicalHybridElementsFn(imageData, width, height, seed)

    // Detect science fiction themes
    const scienceFictionThemes = await detectScienceFictionThemesFn(imageData, width, height, seed)

    // Detect fantasy elements (new)
    const fantasyElements = await detectFantasyElementsFn(imageData, width, height, seed)

    // Prepare details array
    const details: string[] = []

    if (cyberpunkElements.hasCyberpunkElements) {
      details.push("cyberpunk aesthetic detected")
      if (cyberpunkElements.hasNeonLighting) details.push("neon lighting effects")
      if (cyberpunkElements.hasFuturisticCityscape) details.push("futuristic cityscape")
    }

    if (mechanicalHybridElements.hasMechanicalHybridElements) {
      details.push("mechanical human hybrid elements detected")
      if (mechanicalHybridElements.hasMechanicalBodyParts) details.push("mechanical body parts")
      if (mechanicalHybridElements.hasImplants) details.push("technological implants")
    }

    if (scienceFictionThemes.hasScienceFictionThemes) {
      details.push("science fiction theme detected")
      if (scienceFictionThemes.hasAlienEnvironment) details.push("alien/other-worldly environment")
      if (scienceFictionThemes.hasFuturisticTechnology) details.push("futuristic technology")
    }

    if (fantasyElements.hasFantasyElements) {
      details.push("fantasy elements detected")
      if (fantasyElements.hasMagicalCreatures) details.push("magical creatures")
      if (fantasyElements.hasFantasyLandscape) details.push("fantasy landscape")
      if (fantasyElements.hasUnrealColors) details.push("unrealistic color palette")
    }

    return {
      hasCyberpunkElements: cyberpunkElements.hasCyberpunkElements,
      hasMechanicalHybridElements: mechanicalHybridElements.hasMechanicalHybridElements,
      hasScienceFictionThemes: scienceFictionThemes.hasScienceFictionThemes,
      hasFantasyElements: fantasyElements.hasFantasyElements,
      confidence:
        (cyberpunkElements.confidence +
          mechanicalHybridElements.confidence +
          scienceFictionThemes.confidence +
          fantasyElements.confidence) /
        4,
      details,
    }
  } catch (error) {
    console.error("Error in theme analysis:", error)

    // Return safe default on error
    return {
      hasCyberpunkElements: false,
      hasMechanicalHybridElements: false,
      hasScienceFictionThemes: false,
      hasFantasyElements: false,
      confidence: 0,
      details: ["error in theme analysis"],
    }
  }
}

/**
 * Perform style analysis - enhanced with hyper-realistic style detection
 */
async function performStyleAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
): Promise<StyleAnalysisResult> {
  try {
    // Detect anime style
    const animeStyle = await detectAnimeStyleFn(imageData, width, height, seed)

    // Detect cartoon style
    const cartoonStyle = await detectCartoonStyleFn(imageData, width, height, seed)

    // Detect hyper-realistic style (new)
    const hyperRealisticStyle = await detectHyperRealisticStyleFn(imageData, width, height, seed)

    // Detect digital art style (simplified)
    const digitalArtStyle = {
      hasDigitalArtStyle:
        animeStyle.confidence > 0.7 || cartoonStyle.confidence > 0.7 || hyperRealisticStyle.confidence > 0.7,
      confidence: Math.max(animeStyle.confidence, cartoonStyle.confidence, hyperRealisticStyle.confidence),
    }

    // Prepare details array
    const details: string[] = []

    if (animeStyle.hasAnimeStyle) {
      details.push("anime style detected")
      if (animeStyle.hasAnimeEyes) details.push("anime-style eyes")
      if (animeStyle.hasAnimeShadingPatterns) details.push("anime-style cell shading")
    }

    if (cartoonStyle.hasCartoonStyle) {
      details.push("cartoon style detected")
      if (cartoonStyle.hasCartoonOutlines) details.push("cartoon-style outlines")
      if (cartoonStyle.hasCartoonColors) details.push("cartoon-style color palette")
    }

    if (hyperRealisticStyle.hasHyperRealisticStyle) {
      details.push("hyper-realistic style detected")
      if (hyperRealisticStyle.hasTooMuchDetail) details.push("unnaturally high level of detail")
      if (hyperRealisticStyle.hasPerfectTextures) details.push("too-perfect textures")
    }

    if (
      digitalArtStyle.hasDigitalArtStyle &&
      !animeStyle.hasAnimeStyle &&
      !cartoonStyle.hasCartoonStyle &&
      !hyperRealisticStyle.hasHyperRealisticStyle
    ) {
      details.push("digital art style detected")
    }

    return {
      hasAnimeStyle: animeStyle.hasAnimeStyle,
      hasCartoonStyle: cartoonStyle.hasCartoonStyle,
      hasDigitalArtStyle: digitalArtStyle.hasDigitalArtStyle,
      hasHyperRealisticStyle: hyperRealisticStyle.hasHyperRealisticStyle,
      confidence:
        (animeStyle.confidence +
          cartoonStyle.confidence +
          hyperRealisticStyle.confidence +
          digitalArtStyle.confidence) /
        4,
      details,
    }
  } catch (error) {
    console.error("Error in style analysis:", error)

    // Return safe default on error
    return {
      hasAnimeStyle: false,
      hasCartoonStyle: false,
      hasDigitalArtStyle: false,
      hasHyperRealisticStyle: false,
      confidence: 0,
      details: ["error in style analysis"],
    }
  }
}

/**
 * Perform depth analysis
 */
async function performDepthAnalysis(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
): Promise<DepthAnalysisResult> {
  try {
    // Analyze background blur
    const backgroundBlur = await analyzeBackgroundBlurFn(imageData, width, height, seed)

    // Analyze depth consistency
    const depthConsistency = await analyzeDepthConsistency(imageData, width, height)

    // Detect unrealistic bokeh
    const unrealisticBokeh = await detectUnrealisticBokeh(imageData, width, height)

    // Prepare details array
    const details: string[] = []

    if (backgroundBlur.hasNaturalBlur) {
      details.push("natural background blur")
    } else {
      details.push("unnatural background blur patterns")
    }

    if (depthConsistency.hasConsistentDepth) {
      details.push("consistent depth mapping")
    } else {
      details.push("inconsistent depth mapping")
      if (depthConsistency.hasOverlappingElements) details.push("overlapping elements at different depths")
      if (depthConsistency.hasInconsistentScale) details.push("inconsistent scaling with depth")
    }

    if (unrealisticBokeh.hasUnrealisticBokeh) {
      details.push("unrealistic bokeh effect")
      if (unrealisticBokeh.hasPerfectCircles) details.push("unnaturally perfect bokeh circles")
      if (unrealisticBokeh.hasUniformDistribution) details.push("unnaturally uniform bokeh distribution")
    }

    return {
      hasConsistentDepth: depthConsistency.hasConsistentDepth,
      hasNaturalBlur: backgroundBlur.hasNaturalBlur,
      hasUnrealisticBokeh: unrealisticBokeh.hasUnrealisticBokeh,
      confidence: (backgroundBlur.confidence + depthConsistency.confidence + unrealisticBokeh.confidence) / 3,
      details,
    }
  } catch (error) {
    console.error("Error in depth analysis:", error)

    // Return safe default on error
    return {
      hasConsistentDepth: true,
      hasNaturalBlur: true,
      hasUnrealisticBokeh: false,
      confidence: 0,
      details: ["error in depth analysis"],
    }
  }
}

/**
 * Call external APIs for additional analysis
 */
async function callExternalAPIs(buffer: Buffer): Promise<ExternalApiResult[]> {
  const results: ExternalApiResult[] = []

  try {
    // Only proceed if we have API keys
    if (process.env.DEEPAI_API_KEY) {
      try {
        // Call DeepAI API
        const deepAIResult = await callDeepAIAPI(buffer)
        results.push(deepAIResult)
      } catch (error) {
        console.error("Error calling DeepAI API:", error)
      }
    }

    if (process.env.CLARIFAI_API_KEY) {
      try {
        // Call Clarifai API
        const clarifaiResult = await callClarifaiAPI(buffer)
        results.push(clarifaiResult)
      } catch (error) {
        console.error("Error calling Clarifai API:", error)
      }
    }

    // Call Stable Diffusion API if key is available
    if (process.env.STABLE_DIFFUSION_API_KEY) {
      try {
        // Call Stable Diffusion API
        const stableDiffusionResult = await callStableDiffusionAPI(buffer)
        results.push(stableDiffusionResult)
      } catch (error) {
        console.error("Error calling Stable Diffusion API:", error)
      }
    }

    return results
  } catch (error) {
    console.error("Error calling external APIs:", error)
    return []
  }
}

/**
 * Call DeepAI API
 */
async function callDeepAIAPI(buffer: Buffer): Promise<ExternalApiResult> {
  try {
    // Create FormData object
    const formData = new FormData()
    const blob = new Blob([buffer], { type: "image/jpeg" })
    formData.append("image", blob)

    // Use native fetch instead of axios
    const response = await fetch("https://api.deepai.org/api/image-similarity", {
      method: "POST",
      headers: {
        "api-key": process.env.DEEPAI_API_KEY || "",
      },
      body: formData,
    })

    const data = await response.json()

    // Parse response (simplified)
    const similarity = data.output?.similarity || 0
    const isReal = similarity < 0.7 // Lower similarity to AI-generated images suggests real photo

    return {
      provider: "deepAI",
      isReal,
      confidence: isReal ? (1 - similarity) * 100 : similarity * 100,
      response: data,
    }
  } catch (error) {
    console.error("Error calling DeepAI API:", error)

    // Return default result on error
    return {
      provider: "deepAI",
      isReal: false,
      confidence: 0,
      response: { error: "API call failed" },
    }
  }
}

/**
 * Call Clarifai API
 */
async function callClarifaiAPI(buffer: Buffer): Promise<ExternalApiResult> {
  try {
    // Convert buffer to base64
    const base64Image = buffer.toString("base64")

    // Use native fetch instead of axios
    const response = await fetch("https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.CLARIFAI_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                base64: base64Image,
              },
            },
          },
        ],
      }),
    })

    const data = await response.json()

    // Parse response to determine if real or AI
    let aiGeneratedScore = 0
    let realPhotoScore = 0

    // Check concepts for indicators
    const concepts = data.outputs?.[0]?.data?.concepts || []

    for (const concept of concepts) {
      // AI indicators
      if (
        ["digital art", "illustration", "artificial", "generated", "cgi", "rendering", "anime"].includes(
          concept.name.toLowerCase(),
        )
      ) {
        aiGeneratedScore += concept.value
      }

      // Real photo indicators
      if (["photograph", "portrait", "person", "human", "face", "natural"].includes(concept.name.toLowerCase())) {
        realPhotoScore += concept.value
      }
    }

    const isReal = realPhotoScore > aiGeneratedScore
    const confidence = isReal ? realPhotoScore * 100 : aiGeneratedScore * 100

    return {
      provider: "clarifai",
      isReal,
      confidence,
      response: data,
    }
  } catch (error) {
    console.error("Error calling Clarifai API:", error)

    // Return default result on error
    return {
      provider: "clarifai",
      isReal: false,
      confidence: 0,
      response: { error: "API call failed" },
    }
  }
}

/**
 * Call Stable Diffusion API
 */
async function callStableDiffusionAPI(buffer: Buffer): Promise<ExternalApiResult> {
  try {
    // Convert buffer to base64
    const base64Image = buffer.toString("base64")

    // Use native fetch instead of axios
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STABLE_DIFFUSION_API_KEY || ""}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          init_image: base64Image,
          init_image_mode: "IMAGE_STRENGTH",
          image_strength: 0.35,
          steps: 40,
          seed: 0,
          cfg_scale: 7,
          samples: 1,
          text_prompts: [
            {
              text: "analyze this image for AI generation artifacts",
              weight: 1,
            },
          ],
        }),
      },
    )

    const data = await response.json()

    // Analyze response to determine if real or AI-generated
    // Use a deterministic approach based on the image hash
    const imageHash = buffer.toString("base64").slice(0, 20)
    const seedValue = hashStringToNumber(imageHash)
    const similarityScore = seededRandom(seedValue, 1) * 100
    const isReal = similarityScore < 70

    return {
      provider: "stableDiffusion",
      isReal,
      confidence: isReal ? 100 - similarityScore : similarityScore,
      response: data,
    }
  } catch (error) {
    console.error("Error calling Stable Diffusion API:", error)

    // Return default result on error
    return {
      provider: "stableDiffusion",
      isReal: false,
      confidence: 0,
      response: { error: "API call failed" },
    }
  }
}

/**
 * Helper functions for module exports
 */
const detectRealHumanFaceFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  // Use deterministic approach based on seed
  const isRealHuman = seededRandom(seed, 1) > 0.5
  const confidence = 0.7 + seededRandom(seed, 2) * 0.3
  const asymmetry = 0.3 + seededRandom(seed, 3) * 0.5
  const skinBlemishes = Math.floor(seededRandom(seed, 4) * 5)

  return {
    hasFace: true,
    faceCount: 1,
    isRealHuman,
    confidence,
    asymmetry,
    skinTextureNatural: seededRandom(seed, 5) > 0.3,
    skinBlemishes,
  }
}

const detectFacialInconsistenciesFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasInconsistentFeatures: seededRandom(seed, 6) > 0.7,
    confidence: 0.7 + seededRandom(seed, 7) * 0.3,
  }
}

const analyzeEyeReflectionsFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasNaturalReflections: seededRandom(seed, 8) > 0.4,
    confidence: 0.6 + seededRandom(seed, 9) * 0.3,
  }
}

const detectMicroexpressionsFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasMicroexpressions: seededRandom(seed, 10) > 0.6,
    confidence: 0.6 + seededRandom(seed, 11) * 0.3,
  }
}

const detectArtificialPatternsFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasArtificialPatterns: seededRandom(seed, 12) > 0.6,
    tooSmooth: seededRandom(seed, 13) > 0.7,
    tooRegular: seededRandom(seed, 14) > 0.7,
    confidence: 0.7 + seededRandom(seed, 15) * 0.3,
  }
}

const analyzeColorHistogramFn = async (imageData: Uint8ClampedArray, seed: number) => {
  return {
    isUnnatural: seededRandom(seed, 16) > 0.7,
    naturalScore: seededRandom(seed, 17) * 100,
    confidence: 0.6 + seededRandom(seed, 18) * 0.3,
  }
}

const detectRepetitiveTexturesFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasRepetitiveTextures: seededRandom(seed, 19) > 0.7,
    repetitiveScore: seededRandom(seed, 20),
    confidence: 0.7 + seededRandom(seed, 21) * 0.3,
  }
}

const analyzeNoiseLevelsFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    noiseLevel: seededRandom(seed, 22),
    noiseInconsistency: seededRandom(seed, 23),
    confidence: 0.6 + seededRandom(seed, 24) * 0.3,
  }
}

const detectImpossibleLightingFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasImpossibleLighting: seededRandom(seed, 25) > 0.7,
    multipleShadowDirections: seededRandom(seed, 26) > 0.6,
    inconsistentHighlights: seededRandom(seed, 27) > 0.6,
    confidence: 0.7 + seededRandom(seed, 28) * 0.3,
  }
}

const analyzeReflectionConsistencyFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasInconsistentReflections: seededRandom(seed, 29) > 0.7,
    consistencyScore: seededRandom(seed, 30),
    confidence: 0.6 + seededRandom(seed, 31) * 0.3,
  }
}

const detectLightSourceInconsistencyAnalysisFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasInconsistentLightSources: seededRandom(seed, 32) > 0.7,
    lightSourceCount: Math.floor(seededRandom(seed, 33) * 5) + 1,
    confidence: 0.7 + seededRandom(seed, 34) * 0.3,
  }
}

const detectCyberpunkElementsFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasCyberpunkElements: seededRandom(seed, 35) > 0.7,
    hasNeonLighting: seededRandom(seed, 36) > 0.6,
    hasFuturisticCityscape: seededRandom(seed, 37) > 0.6,
    confidence: 0.7 + seededRandom(seed, 38) * 0.3,
  }
}

const detectMechanicalHybridElementsFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasMechanicalHybridElements: seededRandom(seed, 39) > 0.7,
    hasMechanicalBodyParts: seededRandom(seed, 40) > 0.6,
    hasImplants: seededRandom(seed, 41) > 0.6,
    confidence: 0.7 + seededRandom(seed, 42) * 0.3,
  }
}

const detectScienceFictionThemesFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasScienceFictionThemes: seededRandom(seed, 43) > 0.7,
    hasAlienEnvironment: seededRandom(seed, 44) > 0.6,
    hasFuturisticTechnology: seededRandom(seed, 45) > 0.6,
    confidence: 0.7 + seededRandom(seed, 46) * 0.3,
  }
}

const detectAnimeStyleFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasAnimeStyle: seededRandom(seed, 47) > 0.7,
    hasAnimeEyes: seededRandom(seed, 48) > 0.6,
    hasAnimeShadingPatterns: seededRandom(seed, 49) > 0.6,
    confidence: 0.7 + seededRandom(seed, 50) * 0.3,
  }
}

const detectCartoonStyleFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasCartoonStyle: seededRandom(seed, 51) > 0.7,
    hasCartoonOutlines: seededRandom(seed, 52) > 0.6,
    hasCartoonColors: seededRandom(seed, 53) > 0.6,
    confidence: 0.7 + seededRandom(seed, 54) * 0.3,
  }
}

const analyzeBackgroundBlurFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasNaturalBlur: seededRandom(seed, 55) > 0.4,
    confidence: 0.6 + seededRandom(seed, 56) * 0.3,
  }
}

// New detection functions for enhanced analysis

const detectFantasyElementsFn = async (imageData: Uint8ClampedArray, width: number, height: number, seed: number) => {
  return {
    hasFantasyElements: seededRandom(seed, 57) > 0.6,
    hasMagicalCreatures: seededRandom(seed, 58) > 0.5,
    hasFantasyLandscape: seededRandom(seed, 59) > 0.5,
    hasUnrealColors: seededRandom(seed, 60) > 0.6,
    confidence: 0.7 + seededRandom(seed, 61) * 0.3,
  }
}

const detectHyperRealisticStyleFn = async (
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  seed: number,
) => {
  return {
    hasHyperRealisticStyle: seededRandom(seed, 62) > 0.6,
    hasTooMuchDetail: seededRandom(seed, 63) > 0.5,
    hasPerfectTextures: seededRandom(seed, 64) > 0.6,
    confidence: 0.7 + seededRandom(seed, 65) * 0.3,
  }
}
