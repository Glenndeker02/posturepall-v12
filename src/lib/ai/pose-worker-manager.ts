/**
 * Pose Worker Manager
 * Manages Web Worker for background pose detection
 */

import type { DetectedPose, NamedKeypoint } from './types';

export class PoseWorkerManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private pendingCallbacks: Map<string, (data: any) => void> = new Map();
  private onPoseCallback: ((pose: DetectedPose | null) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  /**
   * Initialize the worker
   */
  async initialize(modelType: 'thunder' | 'lightning' = 'thunder'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create worker
        this.worker = new Worker('/workers/pose-worker.js');

        // Set up message handler
        this.worker.onmessage = (e) => {
          const { type, pose, error } = e.data;

          switch (type) {
            case 'initialized':
              this.isInitialized = true;
              resolve();
              break;

            case 'pose':
              if (this.onPoseCallback) {
                const detectedPose = this.formatPose(pose);
                this.onPoseCallback(detectedPose);
              }
              break;

            case 'error':
              console.error('Worker error:', error);
              if (this.onErrorCallback) {
                this.onErrorCallback(error);
              }
              break;

            case 'disposed':
              this.isInitialized = false;
              break;

            default:
              console.warn('Unknown message type from worker:', type);
          }
        };

        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          if (this.onErrorCallback) {
            this.onErrorCallback(error.message);
          }
          reject(error);
        };

        // Initialize detector in worker
        this.worker.postMessage({
          type: 'init',
          data: { modelType },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Process a video frame
   */
  processFrame(videoElement: HTMLVideoElement): void {
    if (!this.worker || !this.isInitialized) {
      console.warn('Worker not initialized');
      return;
    }

    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Send to worker
    this.worker.postMessage(
      {
        type: 'process',
        data: {
          imageData: {
            data: imageData.data.buffer,
            width: imageData.width,
            height: imageData.height,
          },
        },
      },
      [imageData.data.buffer] // Transfer ownership for performance
    );
  }

  /**
   * Set callback for pose detection
   */
  onPose(callback: (pose: DetectedPose | null) => void): void {
    this.onPoseCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Format pose data from worker
   */
  private formatPose(pose: any): DetectedPose | null {
    if (!pose) return null;

    const KEYPOINT_NAMES = [
      'nose',
      'left_eye',
      'right_eye',
      'left_ear',
      'right_ear',
      'left_shoulder',
      'right_shoulder',
      'left_elbow',
      'right_elbow',
      'left_wrist',
      'right_wrist',
      'left_hip',
      'right_hip',
    ];

    const namedKeypoints: NamedKeypoint[] = pose.keypoints.map((kp: any, index: number) => ({
      ...kp,
      name: KEYPOINT_NAMES[index],
    }));

    return {
      keypoints: namedKeypoints.filter(kp => kp.score && kp.score >= 0.3),
      score: pose.score,
      timestamp: Date.now(),
    };
  }

  /**
   * Dispose of the worker
   */
  dispose(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'dispose' });
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if worker is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let workerManagerInstance: PoseWorkerManager | null = null;

/**
 * Get or create worker manager instance
 */
export function getPoseWorkerManager(): PoseWorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new PoseWorkerManager();
  }
  return workerManagerInstance;
}

/**
 * Dispose of global worker instance
 */
export function disposePoseWorker(): void {
  if (workerManagerInstance) {
    workerManagerInstance.dispose();
    workerManagerInstance = null;
  }
}
