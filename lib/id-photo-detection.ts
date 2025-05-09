/**
 * Specialized detection for ID photos and passport photos
 * This module provides enhanced detection for official ID photos
 */

// ID photo characteristics
const ID_PHOTO_CHARACTERISTICS = {
    // Common ID photo backgrounds
    backgrounds: {
      blue: true,
      white: true,
      gray: true,
      red: true,
      beige: true,
    },
  
    // Common ID photo requirements
    requirements: {
      centeredFace: true,
      neutralExpression: true,
      formalAttire: true,
      noSmiling: true,
      noGlasses: true,
      noHeadwear: true,
      standardLighting: true,
    },
  
    // Common ID photo dimensions
    dimensions: {
      passport: { width: 35, height: 45 }, // mm
      visa: { width: 35, height: 45 }, // mm
      drivingLicense: { width: 35, height: 45 }, // mm
      idCard: { width: 35, height: 45 }, // mm
    },
  }
  
  /**
   * Detects if an image is an official ID photo or passport photo
   * @param imageData The image data to analyze
   * @param width The width of the image
   * @param height The height of the image
   * @returns Analysis results including whether the image is an ID photo
   */
  export function detectIDPhoto(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    isIDPhoto: boolean
    confidence: number
    hasBlueBackground: boolean
    hasWhiteBackground: boolean
    hasFormalAttire: boolean
    hasCenteredFace: boolean
    hasNeutralExpression: boolean
  } {
    // Check for solid background colors common in ID photos
    let blueBackgroundPixels = 0
    let whiteBackgroundPixels = 0
    let grayBackgroundPixels = 0
    let redBackgroundPixels = 0
    let beigeBackgroundPixels = 0
    let totalBackgroundPixels = 0
    let formalAttirePixels = 0
    let skinTonePixels = 0
    let centerRegionSkinTonePixels = 0
    let totalCenterRegionPixels = 0
    let neutralExpressionScore = 0
  
    // Define center region where face would typically be in ID photos
    const centerX1 = Math.floor(width * 0.3)
    const centerX2 = Math.floor(width * 0.7)
    const centerY1 = Math.floor(height * 0.1)
    const centerY2 = Math.floor(height * 0.6)
  
    // Sample pixels to detect ID photo characteristics
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
  
            // Check for blue background (very common in ID photos)
            if (b > 120 && b > r * 1.5 && b > g * 1.2) {
              blueBackgroundPixels++
            }
            // Check for white background
            else if (r > 220 && g > 220 && b > 220) {
              whiteBackgroundPixels++
            }
            // Check for gray background
            else if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15 && r > 80 && r < 200) {
              grayBackgroundPixels++
            }
            // Check for red background
            else if (r > 180 && r > g * 1.5 && r > b * 1.5) {
              redBackgroundPixels++
            }
            // Check for beige background
            else if (r > 180 && g > 160 && b > 140 && r > g && g > b) {
              beigeBackgroundPixels++
            }
          }
  
          // Check for formal attire (dark colors in lower part of image)
          if (y > height * 0.6 && y < height * 0.9) {
            // Check for dark colors (black, navy, dark gray) common in formal attire
            if (
              (r < 60 && g < 60 && b < 60) || // Black
              (r < 60 && g < 60 && b < 100) || // Navy
              (r < 100 && g < 100 && b < 100 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20)
            ) {
              // Dark gray
              formalAttirePixels++
            }
          }
  
          // Check for skin tones
          if (r > 50 && g > 30 && b > 15 && r > g && g > b && r - g > 5 && g - b > 5 && r < 250 && g < 250 && b < 250) {
            skinTonePixels++
  
            // Check if skin tone is in center region (face)
            if (x >= centerX1 && x <= centerX2 && y >= centerY1 && y <= centerY2) {
              centerRegionSkinTonePixels++
              totalCenterRegionPixels++
  
              // Check for neutral expression (limited color variation in face region)
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
  
                  // Calculate color variation (lower variation suggests neutral expression)
                  const horizontalVariation = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB)
                  const verticalVariation = Math.abs(r - bottomR) + Math.abs(g - bottomG) + Math.abs(b - bottomB)
  
                  if (horizontalVariation < 30 && verticalVariation < 30) {
                    neutralExpressionScore++
                  }
                }
              }
            }
          } else if (x >= centerX1 && x <= centerX2 && y >= centerY1 && y <= centerY2) {
            totalCenterRegionPixels++
          }
        }
      }
    }
  
    // Calculate percentages
    const blueBackgroundPercentage = (blueBackgroundPixels / totalBackgroundPixels) * 100
    const whiteBackgroundPercentage = (whiteBackgroundPixels / totalBackgroundPixels) * 100
    const grayBackgroundPercentage = (grayBackgroundPixels / totalBackgroundPixels) * 100
    const redBackgroundPercentage = (redBackgroundPixels / totalBackgroundPixels) * 100
    const beigeBackgroundPercentage = (beigeBackgroundPixels / totalBackgroundPixels) * 100
  
    const formalAttirePercentage = (formalAttirePixels / ((width * height * 0.3) / 25)) * 100 // Approximate pixel count in lower region
    const centerRegionSkinTonePercentage = (centerRegionSkinTonePixels / totalCenterRegionPixels) * 100
    const neutralExpressionPercentage = (neutralExpressionScore / centerRegionSkinTonePixels) * 100
  
    // Determine if it has specific ID photo characteristics
    const hasBlueBackground = blueBackgroundPercentage > 60
    const hasWhiteBackground = whiteBackgroundPercentage > 60
    const hasGrayBackground = grayBackgroundPercentage > 60
    const hasRedBackground = redBackgroundPercentage > 60
    const hasBeigeBackground = beigeBackgroundPercentage > 60
  
    const hasFormalAttire = formalAttirePercentage > 40
    const hasCenteredFace = centerRegionSkinTonePercentage > 10
    const hasNeutralExpression = neutralExpressionPercentage > 60
  
    // Determine if it's an ID photo
    const hasStandardBackground =
      hasBlueBackground || hasWhiteBackground || hasGrayBackground || hasRedBackground || hasBeigeBackground
    const isIDPhoto = hasStandardBackground && hasCenteredFace
  
    // Calculate confidence
    let confidence = 0
    if (isIDPhoto) {
      confidence = 70
      if (hasBlueBackground) confidence += 20 // Blue backgrounds are very common in ID photos
      if (hasWhiteBackground) confidence += 15
      if (hasGrayBackground) confidence += 15
      if (hasRedBackground) confidence += 15
      if (hasBeigeBackground) confidence += 15
      if (hasFormalAttire) confidence += 15
      if (hasCenteredFace) confidence += 15
      if (hasNeutralExpression) confidence += 10
    }
  
    return {
      isIDPhoto,
      confidence: Math.min(confidence, 95),
      hasBlueBackground,
      hasWhiteBackground,
      hasFormalAttire,
      hasCenteredFace,
      hasNeutralExpression,
    }
  }
  
  /**
   * Checks if a filename contains ID photo indicators
   * @param fileName The name of the file to check
   * @returns True if the filename contains ID photo indicators
   */
  export function checkForIDPhotoKeywords(fileName: string): boolean {
    const lowerCaseFileName = fileName.toLowerCase()
    return (
      lowerCaseFileName.includes("id") ||
      lowerCaseFileName.includes("passport") ||
      lowerCaseFileName.includes("visa") ||
      lowerCaseFileName.includes("license") ||
      lowerCaseFileName.includes("identification") ||
      lowerCaseFileName.includes("official") ||
      lowerCaseFileName.includes("document") ||
      lowerCaseFileName.includes("photo") ||
      lowerCaseFileName.includes("portrait") ||
      lowerCaseFileName.includes("formal")
    )
  }
      