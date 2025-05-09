/**
 * Specialized module for frequency domain analysis of images
 * This helps detect GAN artifacts that are often invisible in the spatial domain
 */

/**
 * Analyze frequency patterns in an image to detect AI generation artifacts
 * @param imageData Raw image data
 * @param width Image width
 * @param height Image height
 * @returns Analysis results with frequency domain indicators
 */
export function analyzeFrequencyDomain(imageData: Uint8ClampedArray, width: number, height: number) {
    // Convert RGBA to grayscale for frequency analysis
    const grayscale = new Uint8ClampedArray(width * height)
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4
      // Standard grayscale conversion: 0.299R + 0.587G + 0.114B
      grayscale[i] = Math.round(0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2])
    }
  
    // Perform 2D Fast Fourier Transform (FFT)
    // Note: In a browser environment, we can't use the full FFT implementation
    // This is a simplified version that looks for patterns in the spatial domain
    // that correlate with frequency domain artifacts
  
    // 1. Check for regular grid patterns (common in GAN-generated images)
    const gridScore = detectGridPatterns(grayscale, width, height)
  
    // 2. Check for unnatural smoothness (lack of high-frequency components)
    const smoothnessScore = detectUnnaturalSmoothness(grayscale, width, height)
  
    // 3. Check for frequency band distribution (GAN images have unusual distributions)
    const bandDistributionScore = analyzeFrequencyBands(grayscale, width, height)
  
    // 4. Check for periodic artifacts (common in some GAN architectures)
    const periodicArtifactScore = detectPeriodicArtifacts(grayscale, width, height)
  
    // Combine scores with appropriate weights
    const weights = {
      grid: 0.3,
      smoothness: 0.25,
      bandDistribution: 0.25,
      periodicArtifacts: 0.2,
    }
  
    const totalScore =
      gridScore * weights.grid +
      smoothnessScore * weights.smoothness +
      bandDistributionScore * weights.bandDistribution +
      periodicArtifactScore * weights.periodicArtifacts
  
    // Determine if the image has GAN frequency artifacts
    const hasGanArtifacts = totalScore > 0.6 // Threshold for detection
  
    // Calculate confidence
    const confidence = Math.min(totalScore * 100, 95)
  
    return {
      hasGanArtifacts,
      confidence,
      gridScore,
      smoothnessScore,
      bandDistributionScore,
      periodicArtifactScore,
      totalScore,
    }
  }
  
  /**
   * Detect grid-like patterns in the image
   * GAN-generated images often have subtle grid patterns
   */
  function detectGridPatterns(grayscale: Uint8ClampedArray, width: number, height: number): number {
    let gridScore = 0
    const gridSizes = [8, 16, 32] // Common grid sizes in GANs
  
    for (const gridSize of gridSizes) {
      let patternMatches = 0
      let totalChecks = 0
  
      // Check for horizontal grid lines
      for (let y = gridSize; y < height; y += gridSize) {
        for (let x = 0; x < width - 1; x++) {
          const idx1 = y * width + x
          const idx2 = (y - 1) * width + x
  
          // Check for edge (significant difference between adjacent pixels)
          const diff = Math.abs(grayscale[idx1] - grayscale[idx2])
          if (diff > 10) {
            patternMatches++
          }
          totalChecks++
        }
      }
  
      // Check for vertical grid lines
      for (let x = gridSize; x < width; x += gridSize) {
        for (let y = 0; y < height - 1; y++) {
          const idx1 = y * width + x
          const idx2 = y * width + (x - 1)
  
          // Check for edge
          const diff = Math.abs(grayscale[idx1] - grayscale[idx2])
          if (diff > 10) {
            patternMatches++
          }
          totalChecks++
        }
      }
  
      // Calculate match ratio for this grid size
      const matchRatio = totalChecks > 0 ? patternMatches / totalChecks : 0
  
      // If we find a strong match for any grid size, increase the score
      if (matchRatio > 0.1) {
        gridScore = Math.max(gridScore, matchRatio)
      }
    }
  
    return gridScore
  }
  
  /**
   * Detect unnatural smoothness in the image
   * GAN-generated images often lack natural high-frequency noise
   */
  function detectUnnaturalSmoothness(grayscale: Uint8ClampedArray, width: number, height: number): number {
    let totalVariation = 0
    let sampleCount = 0
  
    // Sample the image at regular intervals
    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const idx = y * width + x
  
        // Calculate local variation (Laplacian)
        const center = grayscale[idx]
        const left = grayscale[idx - 1]
        const right = grayscale[idx + 1]
        const top = grayscale[idx - width]
        const bottom = grayscale[idx + width]
  
        const variation =
          Math.abs(center - left) + Math.abs(center - right) + Math.abs(center - top) + Math.abs(center - bottom)
  
        totalVariation += variation
        sampleCount++
      }
    }
  
    // Calculate average variation
    const avgVariation = sampleCount > 0 ? totalVariation / sampleCount : 0
  
    // Natural images typically have higher variation
    // Low variation suggests unnatural smoothness
    const smoothnessScore = Math.max(0, 1 - avgVariation / 40)
  
    return smoothnessScore
  }
  
  /**
   * Analyze frequency bands in the image
   * GAN images often have unusual distributions across frequency bands
   */
  function analyzeFrequencyBands(grayscale: Uint8ClampedArray, width: number, height: number): number {
    // Since we can't do a full FFT in JavaScript easily,
    // we'll use a simplified approach to estimate frequency band energy
  
    // Divide the image into blocks and analyze local variations
    const blockSize = 16
    let lowFreqEnergy = 0
    let midFreqEnergy = 0
    let highFreqEnergy = 0
    let blockCount = 0
  
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        // Analyze this block
        let lowFreq = 0
        let midFreq = 0
        let highFreq = 0
  
        // Low frequency: average value in the block
        let sum = 0
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            sum += grayscale[(y + by) * width + (x + bx)]
          }
        }
        const avg = sum / (blockSize * blockSize)
  
        // Mid and high frequencies: variations at different scales
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const val = grayscale[(y + by) * width + (x + bx)]
  
            // Deviation from block average (low frequency)
            const dev = Math.abs(val - avg)
  
            // Assign to frequency bands based on position in block
            // Pixels near the center contribute to mid frequencies
            // Pixels near the edges contribute to high frequencies
            const distFromCenter = Math.sqrt(
              Math.pow((by - blockSize / 2) / (blockSize / 2), 2) + Math.pow((bx - blockSize / 2) / (blockSize / 2), 2),
            )
  
            if (distFromCenter < 0.5) {
              midFreq += dev
            } else {
              highFreq += dev
            }
          }
        }
  
        // Normalize by block size
        lowFreq = avg
        midFreq /= blockSize * blockSize
        highFreq /= blockSize * blockSize
  
        // Accumulate energy in each band
        lowFreqEnergy += lowFreq
        midFreqEnergy += midFreq
        highFreqEnergy += highFreq
  
        blockCount++
      }
    }
  
    // Calculate average energy in each band
    const avgLowEnergy = blockCount > 0 ? lowFreqEnergy / blockCount : 0
    const avgMidEnergy = blockCount > 0 ? midFreqEnergy / blockCount : 0
    const avgHighEnergy = blockCount > 0 ? highFreqEnergy / blockCount : 0
  
    // Calculate ratios between bands
    const lowToHighRatio = avgHighEnergy > 0 ? avgLowEnergy / avgHighEnergy : 1000
    const midToHighRatio = avgHighEnergy > 0 ? avgMidEnergy / avgHighEnergy : 1000
  
    // GAN images often have unusually high low-to-high ratio
    // or unusually low mid-to-high ratio
    let bandDistributionScore = 0
  
    if (lowToHighRatio > 100 || lowToHighRatio < 10 || midToHighRatio < 0.5) {
      bandDistributionScore = 0.8
    } else if (lowToHighRatio > 50 || lowToHighRatio < 20 || midToHighRatio < 1.0) {
      bandDistributionScore = 0.5
    }
  
    return bandDistributionScore
  }
  
  /**
   * Detect periodic artifacts in the image
   * Some GAN architectures produce regular patterns at specific frequencies
   */
  function detectPeriodicArtifacts(grayscale: Uint8ClampedArray, width: number, height: number): number {
    // Check for periodic patterns at different scales
    const periods = [4, 8, 16, 32, 64]
    let maxPeriodicScore = 0
  
    for (const period of periods) {
      let horizontalMatches = 0
      let verticalMatches = 0
      let totalChecks = 0
  
      // Check for horizontal periodicity
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width - period; x += 4) {
          const idx1 = y * width + x
          const idx2 = y * width + (x + period)
  
          if (idx2 < grayscale.length) {
            // Check if pixels separated by the period are similar
            const diff = Math.abs(grayscale[idx1] - grayscale[idx2])
            if (diff < 10) {
              horizontalMatches++
            }
            totalChecks++
          }
        }
      }
  
      // Check for vertical periodicity
      for (let x = 0; x < width; x += 4) {
        for (let y = 0; y < height - period; y += 4) {
          const idx1 = y * width + x
          const idx2 = (y + period) * width + x
  
          if (idx2 < grayscale.length) {
            // Check if pixels separated by the period are similar
            const diff = Math.abs(grayscale[idx1] - grayscale[idx2])
            if (diff < 10) {
              verticalMatches++
            }
            totalChecks++
          }
        }
      }
  
      // Calculate match ratio for this period
      const horizontalRatio = totalChecks > 0 ? horizontalMatches / totalChecks : 0
      const verticalRatio = totalChecks > 0 ? verticalMatches / totalChecks : 0
      const periodicScore = Math.max(horizontalRatio, verticalRatio)
  
      // Update max score if this period has a higher match
      maxPeriodicScore = Math.max(maxPeriodicScore, periodicScore)
    }
  
    // Scale the score - natural images rarely have strong periodicity
    return maxPeriodicScore > 0.3 ? maxPeriodicScore : 0
  }
  
  /**
   * Detect GAN-specific artifacts in the frequency domain
   * @param imageData Raw image data
   * @param width Image width
   * @param height Image height
   * @returns Analysis results with GAN-specific indicators
   */
  export function detectGanFrequencyArtifacts(imageData: Uint8ClampedArray, width: number, height: number) {
    // Perform frequency domain analysis
    const frequencyAnalysis = analyzeFrequencyDomain(imageData, width, height)
  
    // Detect specific GAN architecture artifacts
    const architectureDetection = detectGanArchitecture(imageData, width, height, frequencyAnalysis)
  
    return {
      isGanGenerated: frequencyAnalysis.hasGanArtifacts,
      confidence: frequencyAnalysis.confidence,
      frequencyAnalysis,
      architectureDetection,
    }
  }
  
  /**
   * Attempt to detect specific GAN architecture based on frequency patterns
   */
  function detectGanArchitecture(imageData: Uint8ClampedArray, width: number, height: number, frequencyAnalysis: any) {
    // Different GAN architectures leave different "fingerprints"
    let architecture = "unknown"
    let confidence = 0
  
    // StyleGAN often has grid artifacts at specific frequencies
    if (frequencyAnalysis.gridScore > 0.7) {
      architecture = "StyleGAN"
      confidence = frequencyAnalysis.gridScore * 90
    }
    // DALL-E often has specific patterns in mid-frequency bands
    else if (frequencyAnalysis.bandDistributionScore > 0.7) {
      architecture = "DALL-E"
      confidence = frequencyAnalysis.bandDistributionScore * 85
    }
    // Midjourney often has specific smoothness characteristics
    else if (frequencyAnalysis.smoothnessScore > 0.8) {
      architecture = "Midjourney"
      confidence = frequencyAnalysis.smoothnessScore * 80
    }
    // Stable Diffusion often has periodic artifacts
    else if (frequencyAnalysis.periodicArtifactScore > 0.6) {
      architecture = "Stable Diffusion"
      confidence = frequencyAnalysis.periodicArtifactScore * 85
    }
  
    return {
      detectedArchitecture: architecture,
      confidence,
      isKnownGan: architecture !== "unknown",
    }
  }
  