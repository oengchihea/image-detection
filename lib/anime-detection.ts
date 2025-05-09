/**
 * Specialized detection for anime and cartoon style images
 * This module provides enhanced detection for anime/cartoon style AI-generated images
 */

/**
 * Detects anime/cartoon style in images
 * @param imageData The image data to analyze
 * @param width The width of the image
 * @param height The height of the image
 * @returns Analysis results including whether the image has anime style
 */
export function detectAnimeStyleImage(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    isAnimeStyle: boolean
    confidence: number
    hasUnrealColors: boolean
    hasSharpLines: boolean
    hasUniformTextures: boolean
    hasAnimalEars: boolean
    hasRainbowHair: boolean
  } {
    // Initialize counters
    let unrealColorPixels = 0
    let brightColorPixels = 0
    let sharpEdgePixels = 0
    let uniformTexturePixels = 0
    let totalPixels = 0
    let purplePixels = 0
    let pinkPixels = 0
    let cyanPixels = 0
    let brightGreenPixels = 0
    let brightOrangePixels = 0
    let brightBluePixels = 0
    let brightRedPixels = 0
    let brightYellowPixels = 0
  
    // For edge detection
    const edgeMap: boolean[][] = Array(height)
      .fill(false)
      .map(() => Array(width).fill(false))
  
    // Sample every 5th pixel for better performance and accuracy
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const idx = (y * width + x) * 4
        if (idx < imageData.length) {
          const r = imageData[idx]
          const g = imageData[idx + 1]
          const b = imageData[idx + 2]
          totalPixels++
  
          // Skip blue background pixels (common in ID photos)
          const isBlueBackground = b > 120 && b > r * 1.5 && b > g * 1.2
          if (isBlueBackground) {
            continue
          }
  
          // Skip gray/white background pixels (common in portrait photos)
          const isGrayBackground =
            Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15 && r > 180 && g > 180 && b > 180
          if (isGrayBackground) {
            continue
          }
  
          // Check for unreal colors (highly saturated, unnatural hues)
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const chroma = max - min
          const saturation = max === 0 ? 0 : chroma / max
  
          // Detect bright, saturated colors common in anime
          if (saturation > 0.8 && max > 200) {
            // Increased thresholds to reduce false positives
            brightColorPixels++
  
            // Count specific bright colors
            if (r > 220 && g < 120 && b > 220) purplePixels++ // Bright purple
            if (r > 220 && g < 80 && b > 150) pinkPixels++ // Bright pink
            if (r < 120 && g > 220 && b > 220) cyanPixels++ // Bright cyan
            if (r < 120 && g > 220 && b < 120) brightGreenPixels++ // Bright green
            if (r > 220 && g > 150 && b < 80) brightOrangePixels++ // Bright orange
            if (r < 120 && g < 120 && b > 220) brightBluePixels++ // Bright blue
            if (r > 220 && g < 80 && b < 80) brightRedPixels++ // Bright red
            if (r > 220 && g > 220 && b < 80) brightYellowPixels++ // Bright yellow
          }
  
          // Check for unreal color combinations - STRICTER THRESHOLDS
          if (
            (r > 200 && g < 80 && b > 200) || // Purple
            (r > 200 && g < 80 && b < 80) || // Red
            (r < 80 && g > 200 && b < 80) || // Green
            (r < 80 && g < 80 && b > 200) || // Blue
            (r > 200 && g > 200 && b < 80) || // Yellow
            (r < 80 && g > 200 && b > 200) || // Cyan
            (r > 200 && g < 80 && b > 120) // Pink
          ) {
            unrealColorPixels++
          }
  
          // Check for sharp edges (high contrast edges)
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            const rightIdx = idx + 4
            const bottomIdx = idx + width * 4
            if (rightIdx < imageData.length && bottomIdx < imageData.length) {
              const rightR = imageData[rightIdx]
              const rightG = imageData[rightIdx + 1]
              const rightB = imageData[rightIdx + 2]
  
              const bottomR = imageData[bottomIdx]
              const bottomG = imageData[bottomIdx + 1]
              const bottomB = imageData[bottomIdx + 2]
  
              const horizontalDiff = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB)
              const verticalDiff = Math.abs(r - bottomR) + Math.abs(g - bottomG) + Math.abs(b - bottomB)
  
              if (horizontalDiff > 120 || verticalDiff > 120) {
                // Increased threshold
                sharpEdgePixels++
                edgeMap[y][x] = true
              }
            }
          }
  
          // Check for uniform textures (low variation in color)
          const colorVariation = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b)
          if (colorVariation < 20) {
            // Decreased threshold
            uniformTexturePixels++
          }
        }
      }
    }
  
    // Calculate percentages
    const unrealColorPercentage = (unrealColorPixels / totalPixels) * 100
    const brightColorPercentage = (brightColorPixels / totalPixels) * 100
    const sharpEdgePercentage = (sharpEdgePixels / totalPixels) * 100
    const uniformTexturePercentage = (uniformTexturePixels / totalPixels) * 100
  
    // Check for rainbow hair (multiple bright colors in upper half)
    const hasRainbowHair =
      (brightOrangePixels > totalPixels * 0.08 && brightBluePixels > totalPixels * 0.03) ||
      (brightRedPixels > totalPixels * 0.08 && brightBluePixels > totalPixels * 0.03) ||
      (brightOrangePixels > totalPixels * 0.08 && cyanPixels > totalPixels * 0.03) ||
      (purplePixels > totalPixels * 0.05 && brightGreenPixels > totalPixels * 0.05) ||
      (pinkPixels > totalPixels * 0.05 && cyanPixels > totalPixels * 0.05)
  
    // Check for animal ears (simplified)
    const hasAnimalEars =
      brightOrangePixels > totalPixels * 0.08 && sharpEdgePercentage > 8 && uniformTexturePercentage > 25
  
    // Determine if it has anime/cartoon style - STRICTER DETECTION
    const hasUnrealColors = unrealColorPercentage > 8 || brightColorPercentage > 15
    const hasSharpLines = sharpEdgePercentage > 8
    const hasUniformTextures = uniformTexturePercentage > 25
  
    // STRICTER ANIME DETECTION: Now requires at least THREE indicators or specific strong indicators
    const isAnimeStyle =
      (hasUnrealColors && hasSharpLines && hasUniformTextures) ||
      hasRainbowHair ||
      hasAnimalEars ||
      brightColorPercentage > 25 || // Very high bright color percentage is a strong indicator
      unrealColorPercentage > 20 // Very high unreal color percentage is a strong indicator
  
    // Calculate confidence
    let confidence = 0
    if (isAnimeStyle) {
      confidence = 70
      if (hasUnrealColors) confidence += 10
      if (hasSharpLines) confidence += 10
      if (hasUniformTextures) confidence += 10
      if (hasRainbowHair) confidence += 20
      if (hasAnimalEars) confidence += 20
  
      // Additional confidence for extreme color combinations
      if (brightColorPercentage > 25) confidence += 15
      if (purplePixels > totalPixels * 0.08) confidence += 10
      if (pinkPixels > totalPixels * 0.08) confidence += 10
      if (cyanPixels > totalPixels * 0.08) confidence += 10
    }
  
    return {
      isAnimeStyle,
      confidence: Math.min(confidence, 95),
      hasUnrealColors,
      hasSharpLines,
      hasUniformTextures,
      hasAnimalEars,
      hasRainbowHair,
    }
  }
  