/**
 * Performance Monitor for AI Operations
 * Tracks FPS, processing time, and provides optimization recommendations
 */

export class PerformanceMonitor {
  private frameTimestamps: number[] = [];
  private processingTimes: number[] = [];
  private readonly maxSamples = 60; // Track last 60 frames
  private lastFrameTime = 0;

  /**
   * Record a new frame
   */
  recordFrame(): void {
    const now = performance.now();

    if (this.lastFrameTime > 0) {
      this.frameTimestamps.push(now - this.lastFrameTime);

      // Keep only recent samples
      if (this.frameTimestamps.length > this.maxSamples) {
        this.frameTimestamps.shift();
      }
    }

    this.lastFrameTime = now;
  }

  /**
   * Record processing time for a frame
   */
  recordProcessingTime(durationMs: number): void {
    this.processingTimes.push(durationMs);

    if (this.processingTimes.length > this.maxSamples) {
      this.processingTimes.shift();
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    if (this.frameTimestamps.length === 0) return 0;

    const avgFrameTime = this.frameTimestamps.reduce((a, b) => a + b, 0) / this.frameTimestamps.length;
    return Math.round(1000 / avgFrameTime);
  }

  /**
   * Get average processing time
   */
  getAverageProcessingTime(): number {
    if (this.processingTimes.length === 0) return 0;

    return this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
  }

  /**
   * Get performance stats
   */
  getStats(): {
    fps: number;
    avgProcessingTime: number;
    minProcessingTime: number;
    maxProcessingTime: number;
    isPerformant: boolean;
  } {
    const fps = this.getCurrentFPS();
    const avgProcessingTime = this.getAverageProcessingTime();
    const minProcessingTime = this.processingTimes.length > 0
      ? Math.min(...this.processingTimes)
      : 0;
    const maxProcessingTime = this.processingTimes.length > 0
      ? Math.max(...this.processingTimes)
      : 0;

    // Consider performant if maintaining >= 5 FPS
    const isPerformant = fps >= 5;

    return {
      fps,
      avgProcessingTime: Math.round(avgProcessingTime),
      minProcessingTime: Math.round(minProcessingTime),
      maxProcessingTime: Math.round(maxProcessingTime),
      isPerformant,
    };
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];

    if (stats.fps < 5) {
      recommendations.push('FPS is low. Consider using Lightning model instead of Thunder.');
    }

    if (stats.avgProcessingTime > 300) {
      recommendations.push('Processing time is high. Reduce video resolution or use Web Worker.');
    }

    if (stats.maxProcessingTime > 1000) {
      recommendations.push('Detected frame drops. Close other browser tabs or applications.');
    }

    if (stats.fps >= 8) {
      recommendations.push('Performance is excellent! You can try increasing video quality.');
    }

    return recommendations;
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.frameTimestamps = [];
    this.processingTimes = [];
    this.lastFrameTime = 0;
  }
}

/**
 * Measure execution time of async function
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  onComplete?: (durationMs: number) => void
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (onComplete) {
    onComplete(duration);
  }

  return result;
}

/**
 * Create FPS counter display (for debugging)
 */
export function createFPSDisplay(): {
  update: (fps: number, processingTime: number) => void;
  element: HTMLDivElement;
} {
  const element = document.createElement('div');
  element.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    min-width: 150px;
  `;

  return {
    element,
    update: (fps: number, processingTime: number) => {
      const fpsColor = fps >= 8 ? '#00ff00' : fps >= 5 ? '#ffff00' : '#ff0000';
      element.innerHTML = `
        <div style="color: ${fpsColor}; font-weight: bold;">FPS: ${fps}</div>
        <div>Processing: ${processingTime}ms</div>
        <div style="font-size: 10px; color: #888; margin-top: 5px;">
          ${fps >= 8 ? 'Excellent' : fps >= 5 ? 'Good' : 'Poor'}
        </div>
      `;
    },
  };
}
