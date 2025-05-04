// AI Detection Models and Training Data
// This file contains specialized models and training data for AI image detection

// Common AI generation artifacts
export const AI_GENERATION_ARTIFACTS = [
    {
      name: "cyberpunk aesthetic",
      description: "Neon-colored futuristic scenes with technological elements",
      confidence: 0.95,
      examples: ["neon city", "digital human", "tech implants", "glowing circuits"],
    },
    {
      name: "perfect symmetry",
      description: "Unnaturally perfect symmetry in faces or objects",
      confidence: 0.92,
      examples: ["symmetrical face", "perfect reflection", "identical twins"],
    },
    {
      name: "digital glow",
      description: "Unrealistic glowing elements or rim lighting",
      confidence: 0.9,
      examples: ["glowing eyes", "neon outline", "backlit silhouette"],
    },
    {
      name: "unnatural fingers",
      description: "Distorted or incorrect finger anatomy",
      confidence: 0.97,
      examples: ["extra fingers", "missing joints", "webbed fingers"],
    },
    {
      name: "floating objects",
      description: "Objects that defy physics or have incorrect shadows",
      confidence: 0.88,
      examples: ["hovering items", "incorrect shadows", "impossible physics"],
    },
    {
      name: "mechanical-human hybrid",
      description: "Unnatural combination of mechanical and human elements",
      confidence: 0.96,
      examples: ["cyborg", "robot parts", "mechanical implants", "digital skin"],
    },
    {
      name: "impossible anatomy",
      description: "Human or animal anatomy that's physically impossible",
      confidence: 0.94,
      examples: ["extra limbs", "distorted proportions", "impossible joints"],
    },
    {
      name: "unnatural textures",
      description: "Skin, fabric, or surfaces with AI-typical texture patterns",
      confidence: 0.89,
      examples: ["plastic-like skin", "uniform texture", "repeating patterns"],
    },
    {
      name: "inconsistent lighting",
      description: "Light sources that don't match across the image",
      confidence: 0.87,
      examples: ["multiple shadows", "impossible reflections", "contradictory lighting"],
    },
    {
      name: "digital artifacts",
      description: "Unnatural blending, smudging or pixel patterns",
      confidence: 0.91,
      examples: ["blurry edges", "smudged details", "unnatural transitions"],
    },
  ]
  
  // Color profiles that strongly indicate AI generation
  export const AI_COLOR_PROFILES = [
    {
      name: "cyberpunk neon",
      colors: [
        { r: [180, 255], g: [0, 100], b: [180, 255] }, // Neon purple
        { r: [0, 100], g: [180, 255], b: [180, 255] }, // Neon cyan
        { r: [255, 255], g: [50, 150], b: [0, 100] }, // Neon orange
        { r: [0, 100], g: [200, 255], b: [0, 100] }, // Neon green
      ],
      threshold: 0.12, // If more than 12% of pixels match these colors, it's likely AI
      confidence: 0.94,
    },
    {
      name: "digital glow",
      colors: [
        { r: [200, 255], g: [200, 255], b: [200, 255] }, // Bright white glow
        { r: [180, 255], g: [180, 255], b: [0, 100] }, // Yellow glow
        { r: [180, 255], g: [0, 100], b: [0, 100] }, // Red glow
      ],
      threshold: 0.08,
      confidence: 0.88,
    },
    {
      name: "unnatural contrast",
      description: "Extreme contrast between dark and bright areas",
      threshold: 0.15,
      confidence: 0.85,
    },
  ]
  
  // Real-world photo characteristics
  export const REAL_PHOTO_CHARACTERISTICS = [
    {
      name: "natural skin texture",
      description: "Realistic pores, imperfections, and skin details",
      confidence: 0.92,
      examples: ["visible pores", "skin imperfections", "natural skin tone variation"],
    },
    {
      name: "natural lighting",
      description: "Consistent, physically accurate lighting and shadows",
      confidence: 0.9,
      examples: ["consistent shadows", "natural highlights", "realistic ambient occlusion"],
    },
    {
      name: "authentic environment",
      description: "Real-world settings with natural details and imperfections",
      confidence: 0.88,
      examples: ["room clutter", "natural wear", "realistic backgrounds"],
    },
    {
      name: "natural facial asymmetry",
      description: "Subtle asymmetry in facial features that all real humans have",
      confidence: 0.94,
      examples: ["asymmetric smile", "uneven eyes", "natural facial proportions"],
    },
    {
      name: "realistic depth of field",
      description: "Natural focus falloff consistent with camera optics",
      confidence: 0.89,
      examples: ["natural bokeh", "consistent focus plane", "optical blur"],
    },
    {
      name: "natural motion blur",
      description: "Realistic motion blur consistent with camera settings",
      confidence: 0.87,
      examples: ["movement blur", "camera shake", "action shots"],
    },
    {
      name: "authentic clothing",
      description: "Natural fabric folds, wrinkles and wear patterns",
      confidence: 0.91,
      examples: ["fabric wrinkles", "natural folds", "clothing wear"],
    },
    {
      name: "real-world brands",
      description: "Accurate representation of brand logos and products",
      confidence: 0.95,
      examples: ["brand logos", "product labels", "store signage"],
    },
    {
      name: "natural color variation",
      description: "Subtle variations in color consistent with real photography",
      confidence: 0.88,
      examples: ["skin tone variation", "natural color gradients", "realistic shadows"],
    },
  ]
  
  // Training data for common AI model artifacts
  export const AI_MODEL_ARTIFACTS = {
    midjourney: [
      "perfect symmetry",
      "hyperdetailed",
      "dramatic lighting",
      "cinematic composition",
      "digital glow effects",
    ],
    "stable-diffusion": [
      "unnatural finger joints",
      "text distortion",
      "inconsistent styles",
      "floating objects",
      "face distortions",
    ],
    "dall-e": [
      "simplified features",
      "cartoon-like elements",
      "inconsistent lighting",
      "unnatural shadows",
      "texture repetition",
    ],
  }
  
  // Enhanced detection for specific image types
  export const SPECIALIZED_DETECTORS = {
    cyberpunk: {
      description: "Specialized detector for cyberpunk/sci-fi AI art",
      indicators: [
        "neon color palette",
        "digital glow effects",
        "mechanical-human hybrid",
        "futuristic cityscape",
        "technological implants",
        "holographic elements",
      ],
      confidence_threshold: 0.75,
      min_indicators: 2,
    },
    portrait: {
      description: "Specialized detector for human portraits",
      indicators: [
        "unnatural skin texture",
        "perfect facial symmetry",
        "uncanny eyes",
        "hair rendering artifacts",
        "unnatural teeth",
        "ear distortions",
      ],
      confidence_threshold: 0.8,
      min_indicators: 3,
    },
    landscape: {
      description: "Specialized detector for landscape images",
      indicators: [
        "impossible geology",
        "repeating elements",
        "inconsistent scale",
        "unnatural water reflections",
        "physically impossible lighting",
      ],
      confidence_threshold: 0.78,
      min_indicators: 2,
    },
  }
  
  // Image analysis utilities
  export const analyzeColorDistribution = (imageData: Uint8ClampedArray) => {
    // Count pixels in each color range
    const colorRanges = {
      red: 0,
      green: 0,
      blue: 0,
      cyan: 0,
      magenta: 0,
      yellow: 0,
      white: 0,
      black: 0,
      gray: 0,
      neon: 0,
    }
  
    const totalPixels = imageData.length / 4
  
    // Sample every 4th pixel for performance
    for (let i = 0; i < imageData.length; i += 16) {
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
  
      // Check for neon colors (high saturation, high brightness)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
  
      if (saturation > 0.8 && max > 200) {
        colorRanges.neon++
        continue
      }
  
      // Check other color ranges
      if (r > 200 && g < 100 && b < 100) colorRanges.red++
      else if (r < 100 && g > 200 && b < 100) colorRanges.green++
      else if (r < 100 && g < 100 && b > 200) colorRanges.blue++
      else if (r < 100 && g > 180 && b > 180) colorRanges.cyan++
      else if (r > 180 && g < 100 && b > 180) colorRanges.magenta++
      else if (r > 180 && g > 180 && b < 100) colorRanges.yellow++
      else if (r > 200 && g > 200 && b > 200) colorRanges.white++
      else if (r < 50 && g < 50 && b < 50) colorRanges.black++
      else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30) colorRanges.gray++
    }
  
    // Convert to percentages
    const sampledPixels = totalPixels / 4
    Object.keys(colorRanges).forEach((key) => {
      colorRanges[key as keyof typeof colorRanges] = (colorRanges[key as keyof typeof colorRanges] / sampledPixels) * 100
    })
  
    // Calculate neon ratio - important for cyberpunk detection
    const neonRatio = colorRanges.neon / 100
  
    return {
      colorRanges,
      neonRatio,
      isNeonDominant: colorRanges.neon > 15, // If more than 15% of pixels are neon
      isCyberpunkPalette: colorRanges.neon + colorRanges.magenta + colorRanges.cyan > 25, // Cyberpunk color palette
    }
  }
  
  // Detect mechanical-human hybrid elements (common in AI art)
  export const detectMechanicalHumanHybrid = (imageData: Uint8ClampedArray, width: number, height: number) => {
    // This would normally use a trained ML model
    // For this implementation, we'll use a simplified approach based on color patterns
  
    const colorAnalysis = analyzeColorDistribution(imageData)
  
    // Check for patterns typical of mechanical-human hybrids in AI art
    const hasMechanicalElements = colorAnalysis.isNeonDominant && colorAnalysis.isCyberpunkPalette
  
    // Check for sharp transitions between skin tones and mechanical elements
    const hasSharpTransitions = detectSharpColorTransitions(imageData, width, height)
  
    return {
      hasMechanicalElements,
      hasSharpTransitions,
      confidence:
        hasMechanicalElements && hasSharpTransitions
          ? 0.92
          : hasMechanicalElements
            ? 0.75
            : hasSharpTransitions
              ? 0.65
              : 0.2,
      isMechanicalHumanHybrid: hasMechanicalElements && hasSharpTransitions,
    }
  }
  
  // Detect sharp color transitions (common in AI-generated mechanical elements)
  export const detectSharpColorTransitions = (imageData: Uint8ClampedArray, width: number, height: number) => {
    let sharpTransitionCount = 0
    const sampleSize = Math.min(1000, (width * height) / 10)
  
    // Sample random pixels
    for (let i = 0; i < sampleSize; i++) {
      const x = Math.floor(Math.random() * (width - 2)) + 1
      const y = Math.floor(Math.random() * (height - 2)) + 1
  
      const centerIdx = (y * width + x) * 4
      const rightIdx = (y * width + (x + 1)) * 4
      const bottomIdx = ((y + 1) * width + x) * 4
  
      // Calculate color difference with neighbors
      const rDiffH = Math.abs(imageData[centerIdx] - imageData[rightIdx])
      const gDiffH = Math.abs(imageData[centerIdx + 1] - imageData[rightIdx + 1])
      const bDiffH = Math.abs(imageData[centerIdx + 2] - imageData[rightIdx + 2])
  
      const rDiffV = Math.abs(imageData[centerIdx] - imageData[bottomIdx])
      const gDiffV = Math.abs(imageData[centerIdx + 1] - imageData[bottomIdx + 1])
      const bDiffV = Math.abs(imageData[centerIdx + 2] - imageData[bottomIdx + 2])
  
      // Calculate total color difference
      const totalDiffH = rDiffH + gDiffH + bDiffH
      const totalDiffV = rDiffV + gDiffV + bDiffV
  
      // If there's a sharp transition in either direction
      if (totalDiffH > 200 || totalDiffV > 200) {
        sharpTransitionCount++
      }
    }
  
    // Calculate percentage of sharp transitions
    const sharpTransitionPercentage = (sharpTransitionCount / sampleSize) * 100
  
    return sharpTransitionPercentage > 25
  }
  
  // Specialized detector for cyberpunk images
  export const detectCyberpunkImage = (imageData: Uint8ClampedArray, width: number, height: number) => {
    const colorAnalysis = analyzeColorDistribution(imageData)
    const mechanicalAnalysis = detectMechanicalHumanHybrid(imageData, width, height)
  
    // Cyberpunk indicators
    const indicators = []
  
    if (colorAnalysis.isNeonDominant) indicators.push("neon color palette")
    if (colorAnalysis.isCyberpunkPalette) indicators.push("cyberpunk color scheme")
    if (mechanicalAnalysis.hasMechanicalElements) indicators.push("mechanical-human hybrid elements")
    if (mechanicalAnalysis.hasSharpTransitions) indicators.push("sharp transitions typical of digital art")
  
    // Calculate confidence based on number of indicators
    const confidence = Math.min(0.6 + indicators.length * 0.1, 0.95)
  
    return {
      isCyberpunk: indicators.length >= 2,
      confidence,
      indicators,
    }
  }
  