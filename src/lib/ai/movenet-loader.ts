/**
 * MoveNet Model Loader
 * Handles loading and initializing TensorFlow.js MoveNet models
 * Supports both Thunder (accurate) and Lightning (fast) variants
 */

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { ModelConfig } from './types';

// MoveNet model URLs
const MODEL_URLS = {
  thunder: 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/thunder/4',
  lightning: 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4',
};

/**
 * Global detector instance (singleton pattern)
 */
let detectorInstance: poseDetection.PoseDetector | null = null;
let currentModelConfig: ModelConfig | null = null;

/**
 * Check device capability to determine optimal model
 */
export function getRecommendedModelType(): 'thunder' | 'lightning' {
  // Check if running on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check available memory (if API exists)
  const deviceMemory = (navigator as any).deviceMemory;

  // Use Lightning (faster) for mobile or low-memory devices
  if (isMobile || (deviceMemory && deviceMemory < 4)) {
    return 'lightning';
  }

  // Use Thunder (more accurate) for desktop with sufficient resources
  return 'thunder';
}

/**
 * Initialize TensorFlow.js backend
 * Prefers WebGL for GPU acceleration
 */
export async function initializeBackend(): Promise<void> {
  try {
    // Try WebGL first (GPU acceleration)
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('✓ TensorFlow.js initialized with WebGL backend');
  } catch (error) {
    console.warn('WebGL backend failed, falling back to CPU:', error);
    try {
      // Fall back to CPU
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✓ TensorFlow.js initialized with CPU backend');
    } catch (cpuError) {
      throw new Error(`Failed to initialize TensorFlow.js: ${cpuError}`);
    }
  }
}

/**
 * Load MoveNet model with configuration
 */
export async function loadMoveNetModel(
  config?: Partial<ModelConfig>,
  onProgress?: (progress: number) => void
): Promise<poseDetection.PoseDetector> {
  // Default configuration
  const defaultConfig: ModelConfig = {
    modelType: getRecommendedModelType(),
    scoreThreshold: 0.3,
    maxPoses: 1,
    enableSmoothing: true,
  };

  const modelConfig = { ...defaultConfig, ...config };

  try {
    // Initialize backend if not already done
    if (!tf.getBackend()) {
      await initializeBackend();
    }

    // Report initial progress
    if (onProgress) onProgress(10);

    // Create detector configuration
    const detectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: modelConfig.enableSmoothing,
      minPoseScore: modelConfig.scoreThreshold,
    };

    // Set model type
    if (modelConfig.modelType === 'lightning') {
      detectorConfig.modelType = poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
    }

    if (onProgress) onProgress(30);

    console.log(`Loading MoveNet ${modelConfig.modelType} model...`);

    // Create pose detector
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    if (onProgress) onProgress(100);

    // Store detector and config
    detectorInstance = detector;
    currentModelConfig = modelConfig;

    console.log(`✓ MoveNet ${modelConfig.modelType} model loaded successfully`);

    return detector;
  } catch (error) {
    console.error('Failed to load MoveNet model:', error);
    throw new Error(`MoveNet model loading failed: ${error}`);
  }
}

/**
 * Get the current detector instance
 * Returns null if not initialized
 */
export function getDetectorInstance(): poseDetection.PoseDetector | null {
  return detectorInstance;
}

/**
 * Get current model configuration
 */
export function getCurrentModelConfig(): ModelConfig | null {
  return currentModelConfig;
}

/**
 * Check if detector is loaded and ready
 */
export function isDetectorReady(): boolean {
  return detectorInstance !== null;
}

/**
 * Dispose of the current detector and free memory
 */
export async function disposeDetector(): Promise<void> {
  if (detectorInstance) {
    detectorInstance.dispose();
    detectorInstance = null;
    currentModelConfig = null;
    console.log('✓ MoveNet detector disposed');
  }
}

/**
 * Warm up the model by running a dummy inference
 * This helps reduce latency on first real detection
 */
export async function warmUpModel(detector: poseDetection.PoseDetector): Promise<void> {
  try {
    // Create a dummy canvas
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Fill with dummy data
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Run a dummy detection
    await detector.estimatePoses(canvas);

    console.log('✓ Model warmed up');
  } catch (error) {
    console.warn('Model warm-up failed (non-critical):', error);
  }
}

/**
 * Estimate device performance
 * Returns estimated FPS the device can handle
 */
export async function estimateDevicePerformance(): Promise<number> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const deviceMemory = (navigator as any).deviceMemory;

  // Conservative estimates based on device type
  if (isMobile) {
    return 5; // 5 FPS for mobile devices
  } else if (deviceMemory && deviceMemory < 4) {
    return 7; // 7 FPS for low-memory desktops
  } else {
    return 10; // 10 FPS for capable desktops
  }
}

/**
 * Get memory usage statistics from TensorFlow.js
 */
export function getMemoryStats() {
  return {
    numTensors: tf.memory().numTensors,
    numBytes: tf.memory().numBytes,
    numDataBuffers: tf.memory().numDataBuffers,
    unreliable: tf.memory().unreliable,
  };
}

/**
 * Cleanup unused tensors to prevent memory leaks
 */
export function cleanupMemory(): void {
  const before = tf.memory().numTensors;
  tf.engine().startScope();
  tf.engine().endScope();
  const after = tf.memory().numTensors;

  if (before !== after) {
    console.log(`Cleaned up ${before - after} tensors`);
  }
}
