/**
 * Specialized detection for portrait photos
 * This module provides enhanced detection for professional portrait photos
 */

// Portrait photo characteristics
const PORTRAIT_PHOTO_CHARACTERISTICS = {
    // Common portrait photo backgrounds
    backgrounds: {
      white: true,
      gray: true,
      lightGray: true,
      offWhite: true,
      gradient: true,
    },
  
    // Common portrait photo lighting
    lighting: {
      rembrandt: true,
      butterfly: true,
      loop: true,
      split: true,
      broad: true,
      short: true,
    },
  
    // Common portrait photo poses
    poses: {
      headshot: true,
      threeFourths: true,
      seated: true,
      standing: true,
      leaning: true,
      casual: true,
      formal: true,
    },
  }
  
  /**
   * Detects if an image is a portrait photo (studio portrait, professional headshot, etc.)
   * @param imageData The image data to analyze
   * @param width The width of the image
   * @param height The height of the image
   * @returns Analysis results including whether the image is a portrait photo
   */
  export function detectPortraitPhoto(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    isPortraitPhoto: boolean
    confidence: number
    hasStudioBackground: boolean
    hasProfessionalLighting: boolean
    hasFormalPose: boolean
    hasNeutralExpression: boolean
  } {
    // Check for solid background colors common in portrait photos
    let grayBackgroundPixels = 0
    let whiteBackgroundPixels = 0
    let totalBackgroundPixels = 0
    let professionalLightingScore = 0
    const formalPoseScore = 0
    const neutralExpressionScore = 0
    let skinTonePixels = 0
    let centerRegionSkinTonePixels = 0
    let totalCenterRegionPixels = 0
  
    // Define center region where face would typically be in portrait photos
    const centerX1 = Math.floor(width * 0.3)
    const centerX2 = Math.floor(width * 0.7)
    const centerY1 = Math.floor(height * 0.1)
    const centerY2 = Math.floor(height * 0.6)
  
    // Sample pixels to detect portrait photo characteristics
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const idx = (y * width + x) * 4
        if (idx < imageData.length) {
          const r = imageData[idx]
          const g = imageData[idx + 1]
          const b = imageData[idx + 2]
  
          // Check if pixel is in the background region (edges of the image)
          const isInBackgroundRegion = x < width * 0.1 || x > width * 0.9 || y < height * 0.1 || y > height * 0.9
  
          if (isInBackgroundRegion) {
            totalBackgroundPixels++
  
            // Check for gray background (very common in portrait photos)
            if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15 && r > 100 && r < 240) {
              grayBackgroundPixels++
            }
            // Check for white background
            else if (r > 220 && g > 220 && b > 220) {
              whiteBackgroundPixels++
            }
          }
  
          // Check for professional lighting (even lighting on face)
          if (x >= centerX1 && x <= centerX2 && y >= centerY1 && y <= centerY2) {
            totalCenterRegionPixels++
  
            // Check for skin tones
            if (r > 50 && g > 30 && b > 15 && r > g && g > b && r - g > 5 && g - b > 5 && r < 250 && g < 250 && b < 250) {
              skinTonePixels++
              centerRegionSkinTonePixels++
  
              // Check for even lighting (consistent brightness across face)
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
  
                  // Calculate brightness variation (lower variation suggests professional lighting)
                  const rightBrightness = (rightR + rightG + rightB) / 3
                  const bottomBrightness = (bottomR + bottomG + bottomB) / 3
                  const centerBrightness = (r + g + b) / 3
  
                  const horizontalVariation = Math.abs(centerBrightness - rightBrightness)
                  const verticalVariation = Math.abs(centerBrightness - bottomBrightness)
  
                  if (horizontalVariation < 20 && verticalVariation < 20) {
                    professionalLightingScore++
                  }
                }
              }
            }
          }
        }
      }
    }
  
    // Calculate percentages
    const grayBackgroundPercentage = (grayBackgroundPixels / totalBackgroundPixels) * 100
    const whiteBackgroundPercentage = (whiteBackgroundPixels / totalBackgroundPixels) * 100
    const centerRegionSkinTonePercentage = (centerRegionSkinTonePixels / totalCenterRegionPixels) * 100
    const professionalLightingPercentage = (professionalLightingScore / centerRegionSkinTonePixels) * 100
  
    // Determine if it has specific portrait photo characteristics
    const hasGrayBackground = grayBackgroundPercentage > 60
    const hasWhiteBackground = whiteBackgroundPercentage > 60
    const hasStudioBackground = hasGrayBackground || hasWhiteBackground
    const hasCenteredFace = centerRegionSkinTonePercentage > 10
    const hasProfessionalLighting = professionalLightingPercentage > 60
  
    // Determine if it's a portrait photo
    const isPortraitPhoto = hasStudioBackground && hasCenteredFace
  
    // Calculate confidence
    let confidence = 0
    if (isPortraitPhoto) {
      confidence = 70
      if (hasGrayBackground) confidence += 15
      if (hasWhiteBackground) confidence += 15
      if (hasProfessionalLighting) confidence += 15
      if (hasCenteredFace) confidence += 15
    }
  
    return {
      isPortraitPhoto,
      confidence: Math.min(confidence, 95),
      hasStudioBackground,
      hasProfessionalLighting,
      hasFormalPose: false, // Placeholder
      hasNeutralExpression: false, // Placeholder
    }
  }
  
  /**
   * Checks if a filename contains portrait photo indicators
   * @param fileName The name of the file to check
   * @returns True if the filename contains portrait photo indicators
   */
  export function checkForPortraitPhotoKeywords(fileName: string): boolean {
    const lowerCaseFileName = fileName.toLowerCase()
    return (
      lowerCaseFileName.includes("portrait") ||
      lowerCaseFileName.includes("headshot") ||
      lowerCaseFileName.includes("profile") ||
      lowerCaseFileName.includes("professional") ||
      lowerCaseFileName.includes("studio") ||
      lowerCaseFileName.includes("linkedin") ||
      lowerCaseFileName.includes("cv") ||
      lowerCaseFileName.includes("resume") ||
      lowerCaseFileName.includes("corporate") ||
      lowerCaseFileName.includes("business")
    )
  }
  