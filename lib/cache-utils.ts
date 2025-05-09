// Simple in-memory cache for analysis results
const analysisCache = new Map<string, any>()

/**
 * Generate a simple hash for an image buffer
 */
export function generateImageHash(buffer: Buffer): string {
  // Simple hash function - in production you'd want a more robust solution
  let hash = 0
  const str = buffer.toString("base64").substring(0, 1000) // Use first 1000 chars for speed

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash.toString(16)
}

/**
 * Check if analysis exists in cache
 */
export function hasAnalysisInCache(imageHash: string): boolean {
  return analysisCache.has(imageHash)
}

/**
 * Get analysis from cache
 */
export function getAnalysisFromCache(imageHash: string): any {
  return analysisCache.get(imageHash)
}

/**
 * Store analysis in cache
 */
export function storeAnalysisInCache(imageHash: string, result: any): void {
  analysisCache.set(imageHash, result)

  // Limit cache size to prevent memory issues
  if (analysisCache.size > 100) {
    // Remove oldest entry (first key)
    const firstKey = analysisCache.keys().next().value
    analysisCache.delete(firstKey)
  }
}

/**
 * Clear the analysis cache
 */
export function clearAnalysisCache(): void {
  analysisCache.clear()
}
