/**
 * Advanced texture analysis module
 * This module provides specialized analysis of image textures
 * to distinguish between real photos and AI-generated images
 */

// Types for texture analysis results
export interface TextureAnalysisResult {
    hasArtificialPatterns: boolean
    confidence: number
    noiseProfile: NoiseProfile
    texturePatterns: TexturePatternResult
    colorDistribution: ColorDistributionResult
  }
  
  export interface NoiseProfile {
    noiseLevel: number
    noiseConsistency: number
    hasNaturalNoise: boolean
    hasArtificialNoise: boolean
    confidence: number
  }
  
  export interface TexturePatternResult {
    hasRepetitivePatterns: boolean
    patternRegularity: number
    hasUniformTextures: boolean
    confidence: number
  }
  
  export interface ColorDistributionResult {
    hasNaturalDistribution: boolean
    colorHistogram: number[]
    dominantColors: string[]
    colorVariety: number
    confidence: number
  }
  
  /**
   * Detects artificial patterns in an image
   * @param imageData Raw image data
   * @param width Image width
   * @param height Image height
   * @returns Analysis result for artificial patterns
   */
  export async function detectArtificialPatterns(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): Promise<{
    hasArtificialPatterns: boolean
    tooSmooth: boolean
    tooRegular: boolean
    confidence: number
  }> {
    try {
      // Analyze texture smoothness
      const smoothnessAnalysis = analyzeTextureSmoothnessPatterns(imageData, width, height)
  
      // Analyze texture regularity
      const regularityAnalysis = analyzeTextureRegularityPatterns(imageData, width, height)
  
      // Determine if artificial patterns are present
      const hasArtificialPatterns = smoothnessAnalysis.tooSmooth || regularityAnalysis.tooRegular
  
      // Calculate confidence
      const confidence = (smoothnessAnalysis.confidence + regularityAnalysis.confidence) / 2
  
      return {
        hasArtificialPatterns,
        tooSmooth: smoothnessAnalysis.tooSmooth,
        tooRegular: regularityAnalysis.tooRegular,
        confidence,
      }
    } catch (error) {
      console.error("Error detecting artificial patterns:", error)
  
      return {
        hasArtificialPatterns: false,
        tooSmooth: false,
        tooRegular: false,
        confidence: 0,
      }
    }
  }
  
  /**
   * Analyzes texture smoothness patterns
   */
  function analyzeTextureSmoothnessPatterns(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    tooSmooth: boolean
    smoothnessScore: number
    confidence: number
  } {
    let totalVariation = 0
    let totalPixels = 0
    let smoothRegions = 0
    let analyzedRegions = 0
  
    // Divide the image into regions and analyze each
    const regionSize = 32
    const regionsX = Math.floor(width / regionSize)
    const regionsY = Math.floor(height / regionSize)
  
    for (let ry = 0; ry < regionsY; ry++) {
      for (let rx = 0; rx < regionsX; rx++) {
        let regionVariation = 0
        let regionPixels = 0
  
        // Analyze pixels in this region
        for (let y = ry * regionSize; y < (ry + 1) * regionSize && y < height; y += 2) {
          for (let x = rx * regionSize; x < (rx + 1) * regionSize && x < width; x += 2) {
            const idx = (y * width + x) * 4
  
            if (idx < imageData.length - 4 && (y + 1) * width + x < width * height) {
              const r = imageData[idx]
              const g = imageData[idx + 1]
              const b = imageData[idx + 2]
  
              // Check neighboring pixels
              const rightIdx = idx + 4
              const bottomIdx = ((y + 1) * width + x) * 4
  
              if (rightIdx < imageData.length && bottomIdx < imageData.length) {
                const rightR = imageData[rightIdx]
                const rightG = imageData[rightIdx + 1]
                const rightB = imageData[rightIdx + 2]
  
                const bottomR = imageData[bottomIdx]
                const bottomG = imageData[bottomIdx + 1]
                const bottomB = imageData[bottomIdx + 2]
  
                // Calculate variation
                const horizontalVariation = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB)
                const verticalVariation = Math.abs(r - bottomR) + Math.abs(g - bottomG) + Math.abs(b - bottomB)
  
                regionVariation += horizontalVariation + verticalVariation
                regionPixels++
  
                totalVariation += horizontalVariation + verticalVariation
                totalPixels++
              }
            }
          }
        }
  
        // Calculate average variation for this region
        const avgRegionVariation = regionPixels > 0 ? regionVariation / regionPixels : 0
  
        // Count smooth regions
        if (avgRegionVariation < 15) {
          smoothRegions++
        }
  
        analyzedRegions++
      }
    }
  
    // Calculate overall smoothness metrics
    const avgVariation = totalPixels > 0 ? totalVariation / totalPixels : 0
    const smoothRegionRatio = analyzedRegions > 0 ? smoothRegions / analyzedRegions : 0
  
    // Determine if the image is too smooth
    // Real photos typically have more texture variation
    const tooSmooth = avgVariation < 20 || smoothRegionRatio > 0.7
  
    // Calculate smoothness score (0-1, higher means smoother)
    const smoothnessScore = Math.max(0, Math.min(1, 1 - avgVariation / 60))
  
    // Calculate confidence
    const confidence = 0.7 + Math.abs(smoothnessScore - 0.5) * 0.6
  
    return {
      tooSmooth,
      smoothnessScore,
      confidence,
    }
  }
  
  /**
   * Analyzes texture regularity patterns
   */
  function analyzeTextureRegularityPatterns(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    tooRegular: boolean
    regularityScore: number
    confidence: number
  } {
    // Simplified implementation
    // In a real implementation, this would use frequency domain analysis
  
    let regularPatternCount = 0
    let totalPatterns = 0
  
    // Divide the image into regions and analyze each
    const regionSize = 64
    const regionsX = Math.floor(width / regionSize)
    const regionsY = Math.floor(height / regionSize)
  
    for (let ry = 0; ry < regionsY - 1; ry++) {
      for (let rx = 0; rx < regionsX - 1; rx++) {
        // Compare this region with adjacent regions
        const similarToRight = compareRegions(
          imageData,
          width,
          height,
          rx * regionSize,
          ry * regionSize,
          regionSize,
          regionSize,
          (rx + 1) * regionSize,
          ry * regionSize,
          regionSize,
          regionSize,
        )
  
        const similarToBottom = compareRegions(
          imageData,
          width,
          height,
          rx * regionSize,
          ry * regionSize,
          regionSize,
          regionSize,
          rx * regionSize,
          (ry + 1) * regionSize,
          regionSize,
          regionSize,
        )
  
        // If similar to adjacent regions, might be a regular pattern
        if (similarToRight > 0.8 || similarToBottom > 0.8) {
          regularPatternCount++
        }
  
        totalPatterns++
      }
    }
  
    // Calculate regularity metrics
    const regularityRatio = totalPatterns > 0 ? regularPatternCount / totalPatterns : 0
  
    // Determine if the image has too regular patterns
    // Real photos typically have more irregular patterns
    const tooRegular = regularityRatio > 0.3
  
    // Calculate regularity score (0-1, higher means more regular)
    const regularityScore = regularityRatio
  
    // Calculate confidence
    const confidence = 0.7 + regularityScore * 0.3
  
    return {
      tooRegular,
      regularityScore,
      confidence,
    }
  }
  
  /**
   * Compares two regions for similarity
   */
  function compareRegions(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number,
  ): number {
    let matchingPixels = 0
    let totalPixels = 0
  
    // Sample pixels in both regions
    const sampleStep = 4
  
    for (let dy = 0; dy < h1 && dy < h2; dy += sampleStep) {
      for (let dx = 0; dx < w1 && dx < w2; dx += sampleStep) {
        const idx1 = ((y1 + dy) * width + (x1 + dx)) * 4
        const idx2 = ((y2 + dy) * width + (x2 + dx)) * 4
  
        if (idx1 < imageData.length && idx2 < imageData.length) {
          const r1 = imageData[idx1]
          const g1 = imageData[idx1 + 1]
          const b1 = imageData[idx1 + 2]
  
          const r2 = imageData[idx2]
          const g2 = imageData[idx2 + 1]
          const b2 = imageData[idx2 + 2]
  
          // Calculate color difference
          const colorDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
  
          // If colors are similar, count as matching
          if (colorDiff < 30) {
            matchingPixels++
          }
  
          totalPixels++
        }
      }
    }
  
    // Calculate similarity ratio
    return totalPixels > 0 ? matchingPixels / totalPixels : 0
  }
  
  /**
   * Analyzes color histogram of an image
   * @param imageData Raw image data
   * @returns Analysis result for color histogram
   */
  export async function analyzeColorHistogram(imageData: Uint8ClampedArray): Promise<{
    isUnnatural: boolean
    naturalScore: number
    confidence: number
    histogram?: number[]
    dominantColors?: string[]
  }> {
    try {
      // Calculate color histogram
      const histogram = calculateColorHistogram(imageData)
  
      // Analyze histogram for naturalness
      const histogramAnalysis = analyzeHistogramNaturalness(histogram)
  
      // Extract dominant colors
      const dominantColors = extractDominantColors(imageData)
  
      // Determine if color distribution is unnatural
      const isUnnatural = histogramAnalysis.isUnnatural || dominantColors.isUnnatural
  
      // Calculate natural score
      const naturalScore = (histogramAnalysis.naturalScore + dominantColors.naturalScore) / 2
  
      // Calculate confidence
      const confidence = (histogramAnalysis.confidence + dominantColors.confidence) / 2
  
      return {
        isUnnatural,
        naturalScore,
        confidence,
        histogram: histogram,
        dominantColors: dominantColors.colors,
      }
    } catch (error) {
      console.error("Error analyzing color histogram:", error)
  
      return {
        isUnnatural: false,
        naturalScore: 50,
        confidence: 0,
      }
    }
  }
  
  /**
   * Calculates color histogram
   */
  function calculateColorHistogram(imageData: Uint8ClampedArray): number[] {
    // Simplified histogram with 64 bins (4 bits per channel)
    const histogram = new Array(64).fill(0)
  
    // Sample pixels
    for (let i = 0; i < imageData.length; i += 16) {
      if (i + 2 < imageData.length) {
        const r = imageData[i] >> 6 // 2 bits for red
        const g = imageData[i + 1] >> 6 // 2 bits for green
        const b = imageData[i + 2] >> 6 // 2 bits for blue
  
        // Calculate bin index
        const binIndex = (r << 4) | (g << 2) | b
  
        // Increment bin count
        if (binIndex < histogram.length) {
          histogram[binIndex]++
        }
      }
    }
  
    // Normalize histogram
    const totalPixels = imageData.length / 4
    for (let i = 0; i < histogram.length; i++) {
      histogram[i] = histogram[i] / totalPixels
    }
  
    return histogram
  }
  
  /**
   * Analyzes histogram for naturalness
   */
  function analyzeHistogramNaturalness(histogram: number[]): {
    isUnnatural: boolean
    naturalScore: number
    confidence: number
  } {
    // Calculate histogram statistics
    let maxBin = 0
    let maxBinValue = 0
    let totalNonZeroBins = 0
    let entropy = 0
  
    for (let i = 0; i < histogram.length; i++) {
      if (histogram[i] > 0) {
        totalNonZeroBins++
        entropy -= histogram[i] * Math.log2(histogram[i])
  
        if (histogram[i] > maxBinValue) {
          maxBinValue = histogram[i]
          maxBin = i
        }
      }
    }
  
    // Calculate metrics
    const binUtilization = totalNonZeroBins / histogram.length
    const normalizedEntropy = entropy / Math.log2(histogram.length)
  
    // Determine if histogram is unnatural
    // Real photos typically have higher entropy and bin utilization
    const isUnnatural = normalizedEntropy < 0.5 || binUtilization < 0.3
  
    // Calculate natural score (0-100, higher means more natural)
    const naturalScore = (normalizedEntropy * 0.6 + binUtilization * 0.4) * 100
  
    // Calculate confidence
    const confidence = 0.7 + Math.abs(normalizedEntropy - 0.5) * 0.6
  
    return {
      isUnnatural,
      naturalScore,
      confidence,
    }
  }
  
  /**
   * Extracts dominant colors
   */
  function extractDominantColors(imageData: Uint8ClampedArray): {
    colors: string[]
    isUnnatural: boolean
    naturalScore: number
    confidence: number
  } {
    // Simplified color extraction
    const colorCounts: { [key: string]: number } = {}
    const totalPixels = imageData.length / 4
  
    // Sample pixels
    for (let i = 0; i < imageData.length; i += 16) {
      if (i + 2 < imageData.length) {
        const r = Math.floor(imageData[i] / 32) * 32
        const g = Math.floor(imageData[i + 1] / 32) * 32
        const b = Math.floor(imageData[i + 2] / 32) * 32
  
        const colorKey = `${r},${g},${b}`
  
        if (!colorCounts[colorKey]) {
          colorCounts[colorKey] = 0
        }
  
        colorCounts[colorKey]++
      }
    }
  
    // Sort colors by frequency
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => {
        const [r, g, b] = color.split(",").map(Number)
        return `rgb(${r},${g},${b})`
      })
  
    // Calculate metrics
    const topColorRatio = Object.values(colorCounts)[0] / totalPixels
    const colorVariety = Object.keys(colorCounts).length / ((256 * 256 * 256) / (32 * 32 * 32))
  
    // Determine if color distribution is unnatural
    // Real photos typically have more color variety and less dominant colors
    const isUnnatural = topColorRatio > 0.5 || colorVariety < 0.1
  
    // Calculate natural score (0-100, higher means more natural)
    const naturalScore = ((1 - topColorRatio) * 0.5 + colorVariety * 0.5) * 100
  
    // Calculate confidence
    const confidence = 0.7 + Math.abs(colorVariety - 0.5) * 0.6
  
    return {
      colors: sortedColors,
      isUnnatural,
      naturalScore,
      confidence,
    }
  }
  
  /**
   * Detects repetitive textures in an image
   * @param imageData Raw image data
   * @param width Image width
   * @param height Image height
   * @returns Analysis result for repetitive textures
   */
  export async function detectRepetitiveTextures(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): Promise<{
    hasRepetitiveTextures: boolean
    repetitiveScore: number
    confidence: number
  }> {
    try {
      // Analyze texture patterns
      const patternAnalysis = analyzeTexturePatterns(imageData, width, height)
  
      return {
        hasRepetitiveTextures: patternAnalysis.hasRepetitivePatterns,
        repetitiveScore: patternAnalysis.repetitiveScore,
        confidence: patternAnalysis.confidence,
      }
    } catch (error) {
      console.error("Error detecting repetitive textures:", error)
  
      return {
        hasRepetitiveTextures: false,
        repetitiveScore: 0,
        confidence: 0,
      }
    }
  }
  
  /**
   * Analyzes texture patterns
   */
  function analyzeTexturePatterns(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    hasRepetitivePatterns: boolean
    repetitiveScore: number
    confidence: number
  } {
    // Simplified implementation
    // In a real implementation, this would use autocorrelation or frequency analysis
  
    let repetitiveRegions = 0
    let totalRegions = 0
  
    // Divide the image into regions and analyze each
    const regionSize = 32
    const regionsX = Math.floor(width / regionSize)
    const regionsY = Math.floor(height / regionSize)
  
    for (let ry = 0; ry < regionsY - 1; ry++) {
      for (let rx = 0; rx < regionsX - 1; rx++) {
        // Check for repetitive patterns within this region
        const isRepetitive = checkRegionRepetitiveness(
          imageData,
          width,
          height,
          rx * regionSize,
          ry * regionSize,
          regionSize,
          regionSize,
        )
  
        if (isRepetitive) {
          repetitiveRegions++
        }
  
        totalRegions++
      }
    }
  
    // Calculate repetitive score
    const repetitiveScore = totalRegions > 0 ? repetitiveRegions / totalRegions : 0
  
    // Determine if the image has repetitive textures
    const hasRepetitivePatterns = repetitiveScore > 0.3
  
    // Calculate confidence
    const confidence = 0.7 + repetitiveScore * 0.3
  
    return {
      hasRepetitivePatterns,
      repetitiveScore,
      confidence,
    }
  }
  
  /**
   * Checks if a region has repetitive patterns
   */
  function checkRegionRepetitiveness(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): boolean {
    // Simplified implementation
    // Check for repeating patterns at different offsets
  
    const offsets = [
      { dx: 4, dy: 0 },
      { dx: 0, dy: 4 },
      { dx: 4, dy: 4 },
    ]
  
    for (const offset of offsets) {
      const similarity = compareWithOffset(imageData, width, height, x, y, w, h, offset.dx, offset.dy)
  
      if (similarity > 0.8) {
        return true
      }
    }
  
    return false
  }
  
  /**
   * Compares a region with itself at an offset
   */
  function compareWithOffset(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    w: number,
    h: number,
    offsetX: number,
    offsetY: number,
  ): number {
    let matchingPixels = 0
    let totalPixels = 0
  
    // Compare pixels with their offset counterparts
    for (let dy = 0; dy < h - offsetY; dy += 2) {
      for (let dx = 0; dx < w - offsetX; dx += 2) {
        const idx1 = ((y + dy) * width + (x + dx)) * 4
        const idx2 = ((y + dy + offsetY) * width + (x + dx + offsetX)) * 4
  
        if (idx1 < imageData.length && idx2 < imageData.length) {
          const r1 = imageData[idx1]
          const g1 = imageData[idx1 + 1]
          const b1 = imageData[idx1 + 2]
  
          const r2 = imageData[idx2]
          const g2 = imageData[idx2 + 1]
          const b2 = imageData[idx2 + 2]
  
          // Calculate color difference
          const colorDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
  
          // If colors are similar, count as matching
          if (colorDiff < 30) {
            matchingPixels++
          }
  
          totalPixels++
        }
      }
    }
  
    // Calculate similarity ratio
    return totalPixels > 0 ? matchingPixels / totalPixels : 0
  }
  
  /**
   * Analyzes noise levels in an image
   * @param imageData Raw image data
   * @param width Image width
   * @param height Image height
   * @returns Analysis result for noise levels
   */
  export async function analyzeNoiseLevels(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): Promise<{
    noiseLevel: number
    noiseInconsistency: number
    confidence: number
  }> {
    try {
      // Analyze noise
      const noiseAnalysis = analyzeImageNoise(imageData, width, height)
  
      return {
        noiseLevel: noiseAnalysis.noiseLevel,
        noiseInconsistency: noiseAnalysis.noiseInconsistency,
        confidence: noiseAnalysis.confidence,
      }
    } catch (error) {
      console.error("Error analyzing noise levels:", error)
  
      return {
        noiseLevel: 0,
        noiseInconsistency: 0,
        confidence: 0,
      }
    }
  }
  
  /**
   * Analyzes image noise
   */
  function analyzeImageNoise(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
  ): {
    noiseLevel: number
    noiseInconsistency: number
    confidence: number
  } {
    // Divide the image into regions and analyze noise in each
    const regionSize = 32
    const regionsX = Math.floor(width / regionSize)
    const regionsY = Math.floor(height / regionSize)
  
    const regionNoiseValues: number[] = []
  
    for (let ry = 0; ry < regionsY; ry++) {
      for (let rx = 0; rx < regionsX; rx++) {
        let noiseSum = 0
        let pixelCount = 0
  
        // Analyze pixels in this region
        for (let y = ry * regionSize; y < (ry + 1) * regionSize && y < height; y++) {
          for (let x = rx * regionSize; x < (rx + 1) * regionSize && x < width; x++) {
            const idx = (y * width + x) * 4
  
            if (idx < imageData.length - 4 && x < width - 1) {
              const r = imageData[idx]
              const g = imageData[idx + 1]
              const b = imageData[idx + 2]
  
              // Check neighboring pixel
              const rightIdx = idx + 4
  
              const rightR = imageData[rightIdx]
              const rightG = imageData[rightIdx + 1]
              const rightB = imageData[rightIdx + 2]
  
              // Calculate noise as local variation
              const noise = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB)
  
              noiseSum += noise
              pixelCount++
            }
          }
        }
  
        // Calculate average noise for this region
        const avgNoise = pixelCount > 0 ? noiseSum / pixelCount : 0
        regionNoiseValues.push(avgNoise)
      }
    }
  
    // Calculate overall noise level
    let totalNoise = 0
    for (const noise of regionNoiseValues) {
      totalNoise += noise
    }
  
    const avgNoiseLevel = regionNoiseValues.length > 0 ? totalNoise / regionNoiseValues.length : 0
  
    // Calculate noise inconsistency (standard deviation)
    let varianceSum = 0
    for (const noise of regionNoiseValues) {
      varianceSum += Math.pow(noise - avgNoiseLevel, 2)
    }
  
    const noiseVariance = regionNoiseValues.length > 0 ? varianceSum / regionNoiseValues.length : 0
    const noiseStdDev = Math.sqrt(noiseVariance)
  
    // Normalize noise level to 0-1 range
    const normalizedNoiseLevel = Math.min(avgNoiseLevel / 30, 1)
  
    // Calculate noise inconsistency (0-1 range)
    const noiseInconsistency = Math.min(noiseStdDev / 15, 1)
  
    // Calculate confidence
    const confidence = 0.7 + Math.abs(normalizedNoiseLevel - 0.5) * 0.6
  
    return {
      noiseLevel: normalizedNoiseLevel,
      noiseInconsistency,
      confidence,
    }
  }
  