/**
 * Specialized detection for AI-generated images
 * This module provides enhanced detection for common AI generation artifacts
 */

// AI generation artifacts
const AI_GENERATION_ARTIFACTS = {
  // Common artifacts in AI-generated images
  perfectSymmetry: {
    description: "Unnatural perfect symmetry in faces or objects",
    weight: 0.8,
  },
  uncannyValley: {
    description: "Uncanny valley effect in human faces",
    weight: 0.9,
  },
  artificialTextures: {
    description: "Repetitive or too-perfect texture patterns",
    weight: 0.7,
  },
  impossibleLighting: {
    description: "Physically impossible lighting and shadows",
    weight: 0.8,
  },
  inconsistentReflections: {
    description: "Reflections that don't match the environment",
    weight: 0.7,
  },
  digitalArtifacts: {
    description: "Digital artifacts like blurring, warping, or smudging",
    weight: 0.9,
  },
  perfectGradients: {
    description: "Too-perfect color gradients",
    weight: 0.6,
  },
  impossiblePhysics: {
    description: "Objects or elements that defy physics",
    weight: 0.8,
  },
  inconsistentPerspective: {
    description: "Perspective errors or inconsistencies",
    weight: 0.7,
  },
  floatingElements: {
    description: "Elements that appear to float unnaturally",
    weight: 0.6,
  },
  sciFiElements: {
    description: "Science fiction elements like holograms, futuristic interfaces",
    weight: 0.8,
  },
  perfectSkin: {
    description: "Unnaturally perfect skin texture",
    weight: 0.7,
  },
  unnaturalEyes: {
    description: "Unnatural eye characteristics",
    weight: 0.8,
  },
  perfectHair: {
    description: "Too-perfect hair texture and strands",
    weight: 0.6,
  },
  digitalGlow: {
    description: "Unnatural digital glow or halo effects",
    weight: 0.7,
  },
  animeFeatures: {
    description: "Anime-style features like oversized eyes or unnatural hair colors",
    weight: 0.9,
  },
  fantasyElements: {
    description: "Fantasy elements like magical creatures or impossible landscapes",
    weight: 0.9,
  },
  unrealisticColors: {
    description: "Unrealistic or oversaturated color palettes",
    weight: 0.8,
  },
  perfectComposition: {
    description: "Too-perfect artistic composition",
    weight: 0.7,
  },
  animalHumanHybrids: {
    description: "Animal-human hybrid features like animal ears on humans",
    weight: 0.95,
  },
  unnaturalHairColors: {
    description: "Unnatural or multi-colored hair",
    weight: 0.9,
  },
}

/**
 * Detects common AI generation artifacts in images
 * @param imageData The image data to analyze
 * @param width The width of the image
 * @param height The height of the image
 * @returns Analysis results including whether the image is AI-generated
 */
export function detectAIGeneratedImage(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
): {
  isAIGenerated: boolean
  confidence: number
  hasPerfectSymmetry: boolean
  hasUncannyFeatures: boolean
  hasArtificialTextures: boolean
  hasImpossibleLighting: boolean
  hasImpossibleReflections: boolean
  hasDigitalArtifacts: boolean
  hasSciFiElements: boolean
  hasAnimeFeatures: boolean
  hasFantasyElements: boolean
  hasUnrealisticColors: boolean
  hasAnimalHumanHybrids: boolean
  detectedArtifacts: string[]
} {
  // Initialize counters and flags
  let symmetryScore = 0
  let uncannyScore = 0
  let artificialTextureScore = 0
  let impossibleLightingScore = 0
  let impossibleReflectionScore = 0
  let digitalArtifactScore = 0
  let sciFiElementScore = 0
  let animeFeatureScore = 0
  let fantasyElementScore = 0
  let unrealisticColorScore = 0
  let animalHumanHybridScore = 0
  let totalPixels = 0

  // Color histograms for analysis
  const colorHistogram = new Map<string, number>()
  const skinTonePixels = []
  const hairColorPixels = []

  // Sample pixels to detect AI generation artifacts
  for (let y = 0; y < height; y += 3) {
    // Increased sampling frequency
    for (let x = 0; x < width; x += 3) {
      const idx = (y * width + x) * 4
      if (idx < imageData.length) {
        const r = imageData[idx]
        const g = imageData[idx + 1]
        const b = imageData[idx + 2]
        totalPixels++

        // Add to color histogram (simplified by grouping similar colors)
        const colorKey = `${Math.floor(r / 10)},${Math.floor(g / 10)},${Math.floor(b / 10)}`
        colorHistogram.set(colorKey, (colorHistogram.get(colorKey) || 0) + 1)

        // Check for symmetry (AI-generated images often have unnatural symmetry)
        if (x < width / 2) {
          const mirrorX = width - x - 1
          const mirrorIdx = (y * width + mirrorX) * 4
          if (mirrorIdx < imageData.length) {
            const mirrorR = imageData[mirrorIdx]
            const mirrorG = imageData[mirrorIdx + 1]
            const mirrorB = imageData[mirrorIdx + 2]

            // Calculate difference between this pixel and its mirror
            const symmetryDiff = Math.abs(r - mirrorR) + Math.abs(g - mirrorG) + Math.abs(b - mirrorB)

            // Lower difference means higher symmetry
            if (symmetryDiff < 30) {
              symmetryScore++
            }
          }
        }

        // Check for artificial textures (too uniform or repetitive)
        if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
          const rightIdx = idx + 4
          const bottomIdx = idx + width * 4

          if (rightIdx < imageData.length && bottomIdx < imageData.length) {
            const rightR = imageData[rightIdx]
            const rightG = imageData[rightIdx + 1]
            const rightB = imageData[rightIdx + 2]

            const bottomR = imageData[bottomIdx]
            const bottomG = imageData[bottomIdx + 1]
            const bottomB = imageData[bottomIdx + 2]

            // Calculate texture variation
            const horizontalVariation = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB)
            const verticalVariation = Math.abs(r - bottomR) + Math.abs(g - bottomG) + Math.abs(b - bottomB)

            // Too little variation or too perfect patterns suggest artificial textures
            if (
              (horizontalVariation < 5 && verticalVariation < 5) ||
              Math.abs(horizontalVariation - verticalVariation) < 2
            ) {
              artificialTextureScore++
            }
          }
        }

        // Check for impossible lighting (unnatural brightness or color transitions)
        if (x > 10 && y > 10 && x < width - 10 && y < height - 10) {
          const farRightIdx = idx + 40 // 10 pixels to the right
          const farBottomIdx = idx + width * 40 // 10 pixels below

          if (farRightIdx < imageData.length && farBottomIdx < imageData.length) {
            const farRightR = imageData[farRightIdx]
            const farRightG = imageData[farRightIdx + 1]
            const farRightB = imageData[farRightIdx + 2]

            const farBottomR = imageData[farBottomIdx]
            const farBottomG = imageData[farBottomIdx + 1]
            const farBottomB = imageData[farBottomIdx + 2]

            // Calculate lighting transitions
            const horizontalLightingChange = Math.abs(r - farRightR) + Math.abs(g - farRightG) + Math.abs(b - farRightB)
            const verticalLightingChange =
              Math.abs(r - farBottomR) + Math.abs(g - farBottomG) + Math.abs(b - farBottomB)

            // Extremely sharp or unnatural lighting transitions
            if (horizontalLightingChange > 200 || verticalLightingChange > 200) {
              impossibleLightingScore++
            }
          }
        }

        // Check for digital artifacts (unnatural color patterns)
        const isNeonColor =
          (r > 200 && g < 100 && b > 200) || // Neon purple
          (r < 100 && g > 200 && b > 200) || // Neon cyan
          (r > 200 && g > 200 && b < 100) || // Neon yellow
          (r < 100 && g > 200 && b < 100) || // Neon green
          (r > 200 && g < 100 && b < 100) || // Neon red
          (r < 100 && g < 100 && b > 200) // Neon blue

        if (isNeonColor) {
          digitalArtifactScore++
        }

        // Check for sci-fi elements (futuristic colors and patterns)
        const isSciFiColor =
          (b > 180 && g > 180 && r < 100) || // Holographic blue
          (r > 180 && b > 180 && g < 100) || // Futuristic purple
          (g > 200 && b > 150 && r < 100) // Futuristic teal

        if (isSciFiColor) {
          sciFiElementScore++
        }

        // Check for anime features (bright eyes, unnatural hair colors)
        const isAnimeEyeColor =
          (r > 180 && g > 180 && b < 100) || // Bright yellow/gold eyes
          (r < 100 && g > 180 && b < 100) || // Bright green eyes
          (r < 100 && g < 100 && b > 180) || // Bright blue eyes
          (r > 180 && g < 100 && b > 180) || // Bright purple eyes
          (r > 180 && g < 100 && b < 100) // Bright red eyes

        const isAnimeHairColor =
          (r > 200 && g < 150 && b > 200) || // Purple hair
          (r < 150 && g < 150 && b > 200) || // Blue hair
          (r > 200 && g > 150 && b < 150) || // Orange/red hair
          (r < 150 && g > 200 && b < 150) || // Green hair
          (r > 200 && g > 200 && b < 150) || // Yellow/blonde hair
          (r > 200 && g < 150 && b < 150) // Red hair

        if (isAnimeEyeColor) {
          animeFeatureScore += 2 // Weight eye color more heavily
        }

        if (isAnimeHairColor) {
          animeFeatureScore++
          hairColorPixels.push([r, g, b])
        }

        // Check for fantasy elements
        const isFantasyColor =
          (r > 180 && g > 180 && b < 100 && g > r) || // Magical gold
          (r < 100 && g > 180 && b > 180) || // Magical cyan
          (r > 180 && g < 100 && b > 180) // Magical purple

        if (isFantasyColor) {
          fantasyElementScore++
        }

        // Check for unrealistic colors
        const isUnrealisticColor =
          (r > 240 && g > 240 && b < 100) || // Extremely bright yellow
          (r > 240 && g < 100 && b > 240) || // Extremely bright magenta
          (r < 100 && g > 240 && b > 240) || // Extremely bright cyan
          (r > 240 && g < 100 && b < 100) || // Extremely bright red
          (r < 100 && g > 240 && b < 100) || // Extremely bright green
          (r < 100 && g < 100 && b > 240) // Extremely bright blue

        if (isUnrealisticColor) {
          unrealisticColorScore++
        }

        // Check for uncanny valley features (especially in faces)
        // This is a simplified approach - in a real system, you'd use face detection
        const isUncannyColor =
          (r > 220 && g > 180 && b > 170 && g < 210 && b < 190) || // Unnatural skin tone
          (r > 240 && g > 240 && b > 240) || // Too bright highlights
          (r < 30 && g < 30 && b < 30 && (x % 20 == 0 || y % 20 == 0)) // Unnatural shadow patterns

        if (isUncannyColor) {
          uncannyScore++
        }

        // Collect potential skin tone pixels for further analysis
        const isSkinTone =
          (r > 180 && g > 140 && b > 120 && r > g && g > b) || // Light skin
          (r > 160 && g > 120 && b > 90 && r > g && g > b) || // Medium skin
          (r > 120 && g > 80 && b > 60 && r > g && g > b) // Dark skin

        if (isSkinTone) {
          skinTonePixels.push([r, g, b])
        }

        // Check for impossible reflections
        if (x > 5 && y > 5 && x < width - 5 && y < height - 5) {
          // Look for reflection-like patterns that don't match environment
          const topIdx = idx - width * 5 * 4
          const reflectionIdx = idx + width * 5 * 4

          if (topIdx >= 0 && reflectionIdx < imageData.length) {
            const topR = imageData[topIdx]
            const topG = imageData[topIdx + 1]
            const topB = imageData[topIdx + 2]

            const reflectionR = imageData[reflectionIdx]
            const reflectionG = imageData[reflectionIdx + 1]
            const reflectionB = imageData[reflectionIdx + 2]

            // Check if there's a reflection-like pattern that doesn't match environment
            const isReflectionLike =
              Math.abs(r - reflectionR) < 30 && Math.abs(g - reflectionG) < 30 && Math.abs(b - reflectionB) < 30

            const environmentDifferent =
              Math.abs(r - topR) > 100 || Math.abs(g - topG) > 100 || Math.abs(b - topB) > 100

            if (isReflectionLike && environmentDifferent) {
              impossibleReflectionScore++
            }
          }
        }
      }
    }
  }

  // Analyze color diversity and patterns
  const uniqueColors = colorHistogram.size
  const colorDiversity = uniqueColors / totalPixels

  // Analyze hair color diversity (multiple hair colors is a strong AI indicator)
  const hairColorDiversity = 0
  if (hairColorPixels.length > 0) {
    const hairColorHistogram = new Map<string, number>()
    for (const [r, g, b] of hairColorPixels) {
      const colorKey = `${Math.floor(r / 20)},${Math.floor(g / 20)},${Math.floor(b / 20)}`
      hairColorHistogram.set(colorKey, (hairColorHistogram.get(colorKey) || 0) + 1)
    }

    // Multiple distinct hair colors is a strong indicator of AI-generated anime/fantasy
    if (hairColorHistogram.size > 3) {
      animeFeatureScore += hairColorHistogram.size * 2
      unrealisticColorScore += hairColorHistogram.size
    }
  }

  // Detect animal-human hybrids by analyzing top portion of image for ear-like shapes
  // This is a simplified approach - in a real system, you'd use object detection
  let topRegionAnalysis = 0
  for (let y = 0; y < height * 0.3; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const idx = (y * width + x) * 4
      if (idx < imageData.length) {
        const r = imageData[idx]
        const g = imageData[idx + 1]
        const b = imageData[idx + 2]

        // Look for ear-like colors that differ from typical human skin/hair
        const isPotentialAnimalEar =
          (r > 200 && g > 150 && b < 150) || // Orange/fox-like
          (r > 200 && g > 200 && b > 200) || // White/cat-like
          (r < 100 && g < 100 && b < 100) // Black/dark animal ears

        if (isPotentialAnimalEar) {
          topRegionAnalysis++
        }
      }
    }
  }

  // If we have a significant number of potential animal ear pixels in the top region
  if (topRegionAnalysis > width * height * 0.3 * 0.05) {
    animalHumanHybridScore += 100
    fantasyElementScore += 50
  }

  // Calculate percentages
  const symmetryPercentage = (symmetryScore / (totalPixels / 2)) * 100
  const artificialTexturePercentage = (artificialTextureScore / totalPixels) * 100
  const impossibleLightingPercentage = (impossibleLightingScore / totalPixels) * 100
  const digitalArtifactPercentage = (digitalArtifactScore / totalPixels) * 100
  const sciFiElementPercentage = (sciFiElementScore / totalPixels) * 100
  const uncannyPercentage = (uncannyScore / totalPixels) * 100
  const impossibleReflectionPercentage = (impossibleReflectionScore / totalPixels) * 100
  const animeFeaturePercentage = (animeFeatureScore / totalPixels) * 100
  const fantasyElementPercentage = (fantasyElementScore / totalPixels) * 100
  const unrealisticColorPercentage = (unrealisticColorScore / totalPixels) * 100
  const animalHumanHybridPercentage = (animalHumanHybridScore / totalPixels) * 100

  // Determine if specific artifacts are present
  const hasPerfectSymmetry = symmetryPercentage > 50 // Increased from 40
  const hasUncannyFeatures = uncannyPercentage > 20 // Increased from 15
  const hasArtificialTextures = artificialTexturePercentage > 40 // Increased from 30
  const hasImpossibleLighting = impossibleLightingPercentage > 8 // Increased from 5
  const hasImpossibleReflections = impossibleReflectionPercentage > 12 // Increased from 8
  const hasDigitalArtifacts = digitalArtifactPercentage > 20 // Increased from 15
  const hasSciFiElements = sciFiElementPercentage > 15 // Increased from 10
  const hasAnimeFeatures = animeFeaturePercentage > 12 // Increased from 8
  const hasFantasyElements = fantasyElementPercentage > 12 // Increased from 8
  const hasUnrealisticColors = unrealisticColorPercentage > 15 // Increased from 10
  const hasAnimalHumanHybrids = animalHumanHybridPercentage > 8 // Increased from 5

  // Collect detected artifacts for reporting
  const detectedArtifacts = []
  if (hasPerfectSymmetry) detectedArtifacts.push("perfect symmetry")
  if (hasUncannyFeatures) detectedArtifacts.push("uncanny valley features")
  if (hasArtificialTextures) detectedArtifacts.push("artificial textures")
  if (hasImpossibleLighting) detectedArtifacts.push("impossible lighting")
  if (hasImpossibleReflections) detectedArtifacts.push("impossible reflections")
  if (hasDigitalArtifacts) detectedArtifacts.push("digital artifacts")
  if (hasSciFiElements) detectedArtifacts.push("sci-fi elements")
  if (hasAnimeFeatures) detectedArtifacts.push("anime-style features")
  if (hasFantasyElements) detectedArtifacts.push("fantasy elements")
  if (hasUnrealisticColors) detectedArtifacts.push("unrealistic colors")
  if (hasAnimalHumanHybrids) detectedArtifacts.push("animal-human hybrid features")

  // Count detected artifacts
  const detectedArtifactCount = detectedArtifacts.length

  // Determine if it's AI-generated based on multiple artifacts
  // Significantly improved detection logic with special focus on anime/fantasy elements
  const isAIGenerated =
    detectedArtifactCount >= 3 || // Increased from 2
    (hasPerfectSymmetry && (hasUncannyFeatures || hasArtificialTextures)) ||
    (hasDigitalArtifacts && hasSciFiElements) ||
    (hasUncannyFeatures && hasArtificialTextures) ||
    hasAnimeFeatures || // Strong indicator for anime-style images
    hasFantasyElements || // Strong indicator for fantasy images
    hasAnimalHumanHybrids || // Very strong indicator for animal-human hybrids
    (hasUnrealisticColors && hasDigitalArtifacts && hasSciFiElements) // Require more evidence

  // Calculate confidence
  let confidence = 0
  if (isAIGenerated) {
    confidence = 70 // Base confidence

    // Add confidence based on detected artifacts
    if (hasPerfectSymmetry) confidence += 10
    if (hasUncannyFeatures) confidence += 10
    if (hasArtificialTextures) confidence += 10
    if (hasImpossibleLighting) confidence += 10
    if (hasImpossibleReflections) confidence += 10
    if (hasDigitalArtifacts) confidence += 10
    if (hasSciFiElements) confidence += 10
    if (hasAnimeFeatures) confidence += 20 // Higher weight for anime features
    if (hasFantasyElements) confidence += 15 // Higher weight for fantasy elements
    if (hasUnrealisticColors) confidence += 15 // Higher weight for unrealistic colors
    if (hasAnimalHumanHybrids) confidence += 25 // Highest weight for animal-human hybrids

    // Cap at 98% (never be 100% certain)
    confidence = Math.min(confidence, 98)
  }

  return {
    isAIGenerated,
    confidence,
    hasPerfectSymmetry,
    hasUncannyFeatures,
    hasArtificialTextures,
    hasImpossibleLighting,
    hasImpossibleReflections,
    hasDigitalArtifacts,
    hasSciFiElements,
    hasAnimeFeatures,
    hasFantasyElements,
    hasUnrealisticColors,
    hasAnimalHumanHybrids,
    detectedArtifacts,
  }
}
