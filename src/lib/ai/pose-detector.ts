/**
 * Pose Detector Service
 * Handles real-time pose detection from camera feed using MoveNet
 */

import type { PoseDetector } from '@tensorflow-models/pose-detection';
import { getDetectorInstance, cleanupMemory } from './movenet-loader';
import type { DetectedPose, NamedKeypoint, KeypointName, DetectorState } from './types';

/**
 * Keypoint name mapping from MoveNet output
 */
const KEYPOINT_NAMES: KeypointName[] = [
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

/**
 * Detector state management
 */
let detectorState: DetectorState = {
  isInitialized: false,
  isDetecting: false,
  model: {
    modelType: 'thunder',
    scoreThreshold: 0.3,
    maxPoses: 1,
    enableSmoothing: true,
  },
  frameRate: 5,
  lastDetectionTime: 0,
};

/**
 * Initialize detector state
 */
export function initializeDetectorState(frameRate: number = 5): void {
  detectorState = {
    ...detectorState,
    isInitialized: true,
    frameRate,
    lastDetectionTime: 0,
  };
}

/**
 * Get current detector state
 */
export function getDetectorState(): DetectorState {
  return { ...detectorState };
}

/**
 * Check if enough time has passed for next frame (FPS throttling)
 */
function shouldProcessFrame(): boolean {
  const now = performance.now();
  const minInterval = 1000 / detectorState.frameRate; // Convert FPS to ms

  if (now - detectorState.lastDetectionTime >= minInterval) {
    detectorState.lastDetectionTime = now;
    return true;
  }

  return false;
}

/**
 * Detect pose from video element
 */
export async function detectPoseFromVideo(
  video: HTMLVideoElement,
  skipFrameCheck: boolean = false
): Promise<DetectedPose | null> {
  // Check if we should process this frame (FPS throttling)
  if (!skipFrameCheck && !shouldProcessFrame()) {
    return null;
  }

  const detector = getDetectorInstance();

  if (!detector) {
    throw new Error('Detector not initialized. Call loadMoveNetModel first.');
  }

  try {
    detectorState.isDetecting = true;

    // Estimate poses
    const poses = await detector.estimatePoses(video, {
      maxPoses: 1,
      flipHorizontal: false, // Don't flip since we want to mirror the user
    });

    if (poses.length === 0) {
      return null;
    }

    const pose = poses[0];

    // Map keypoints with names
    const namedKeypoints: NamedKeypoint[] = pose.keypoints.map((kp, index) => ({
      ...kp,
      name: KEYPOINT_NAMES[index],
    }));

    // Filter by confidence threshold
    const validKeypoints = namedKeypoints.filter(
      (kp) => kp.score && kp.score >= detectorState.model.scoreThreshold
    );

    const detectedPose: DetectedPose = {
      keypoints: validKeypoints,
      score: pose.score,
      timestamp: Date.now(),
    };

    return detectedPose;
  } catch (error) {
    console.error('Pose detection error:', error);
    return null;
  } finally {
    detectorState.isDetecting = false;
  }
}

/**
 * Detect pose from image/canvas element
 */
export async function detectPoseFromImage(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<DetectedPose | null> {
  const detector = getDetectorInstance();

  if (!detector) {
    throw new Error('Detector not initialized');
  }

  try {
    const poses = await detector.estimatePoses(image, {
      maxPoses: 1,
      flipHorizontal: false,
    });

    if (poses.length === 0) {
      return null;
    }

    const pose = poses[0];

    const namedKeypoints: NamedKeypoint[] = pose.keypoints.map((kp, index) => ({
      ...kp,
      name: KEYPOINT_NAMES[index],
    }));

    const validKeypoints = namedKeypoints.filter(
      (kp) => kp.score && kp.score >= detectorState.model.scoreThreshold
    );

    return {
      keypoints: validKeypoints,
      score: pose.score,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Pose detection error:', error);
    return null;
  }
}

/**
 * Get specific keypoint by name
 */
export function getKeypoint(pose: DetectedPose, name: KeypointName): NamedKeypoint | null {
  return pose.keypoints.find((kp) => kp.name === name) || null;
}

/**
 * Get multiple keypoints by names
 */
export function getKeypoints(
  pose: DetectedPose,
  names: KeypointName[]
): Record<KeypointName, NamedKeypoint | null> {
  const result: Partial<Record<KeypointName, NamedKeypoint | null>> = {};

  names.forEach((name) => {
    result[name] = getKeypoint(pose, name);
  });

  return result as Record<KeypointName, NamedKeypoint | null>;
}

/**
 * Check if all required keypoints are visible with sufficient confidence
 */
export function hasRequiredKeypoints(
  pose: DetectedPose,
  requiredKeypoints: KeypointName[],
  minConfidence: number = 0.3
): boolean {
  return requiredKeypoints.every((name) => {
    const kp = getKeypoint(pose, name);
    return kp !== null && kp.score !== undefined && kp.score >= minConfidence;
  });
}

/**
 * Calculate midpoint between two keypoints
 */
export function calculateMidpoint(
  kp1: NamedKeypoint,
  kp2: NamedKeypoint
): { x: number; y: number } {
  return {
    x: (kp1.x + kp2.x) / 2,
    y: (kp1.y + kp2.y) / 2,
  };
}

/**
 * Calculate distance between two keypoints
 */
export function calculateDistance(kp1: NamedKeypoint, kp2: NamedKeypoint): number {
  const dx = kp2.x - kp1.x;
  const dy = kp2.y - kp1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between three points (in degrees)
 * Point2 is the vertex of the angle
 */
export function calculateAngle(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  point3: { x: number; y: number }
): number {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);

  let degrees = radians * (180 / Math.PI);

  // Normalize to 0-360
  if (degrees < 0) {
    degrees += 360;
  }

  return degrees;
}

/**
 * Calculate angle from vertical (useful for head/spine alignment)
 */
export function calculateAngleFromVertical(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  // atan2 returns angle from horizontal, we want from vertical
  const angleFromHorizontal = Math.atan2(dy, dx) * (180 / Math.PI);

  // Convert to angle from vertical (90 degrees - horizontal angle)
  const angleFromVertical = 90 - Math.abs(angleFromHorizontal);

  return angleFromVertical;
}

/**
 * Smooth pose data using exponential moving average
 * Reduces jitter in pose detection
 */
export function smoothPose(
  currentPose: DetectedPose,
  previousPose: DetectedPose | null,
  smoothingFactor: number = 0.5
): DetectedPose {
  if (!previousPose) {
    return currentPose;
  }

  const smoothedKeypoints: NamedKeypoint[] = currentPose.keypoints.map((currentKp) => {
    const prevKp = previousPose.keypoints.find((kp) => kp.name === currentKp.name);

    if (!prevKp) {
      return currentKp;
    }

    // Apply exponential moving average
    return {
      ...currentKp,
      x: currentKp.x * smoothingFactor + prevKp.x * (1 - smoothingFactor),
      y: currentKp.y * smoothingFactor + prevKp.y * (1 - smoothingFactor),
    };
  });

  return {
    ...currentPose,
    keypoints: smoothedKeypoints,
  };
}

/**
 * Validate pose quality (check if pose is usable)
 */
export function validatePoseQuality(pose: DetectedPose): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if we have minimum required keypoints
  const requiredKeypoints: KeypointName[] = [
    'nose',
    'left_shoulder',
    'right_shoulder',
    'left_ear',
    'right_ear',
  ];

  const missingKeypoints = requiredKeypoints.filter(
    (name) => !getKeypoint(pose, name)
  );

  if (missingKeypoints.length > 0) {
    issues.push(`Missing keypoints: ${missingKeypoints.join(', ')}`);
  }

  // Check overall pose score
  if (pose.score !== undefined && pose.score < 0.3) {
    issues.push(`Low pose confidence: ${pose.score.toFixed(2)}`);
  }

  // Check if person is too far (small face size)
  const leftEye = getKeypoint(pose, 'left_eye');
  const rightEye = getKeypoint(pose, 'right_eye');

  if (leftEye && rightEye) {
    const eyeDistance = calculateDistance(leftEye, rightEye);
    if (eyeDistance < 20) {
      // Threshold in pixels
      issues.push('Person too far from camera');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Set frame rate for pose detection
 */
export function setFrameRate(fps: number): void {
  if (fps < 1 || fps > 30) {
    throw new Error('Frame rate must be between 1 and 30 FPS');
  }
  detectorState.frameRate = fps;
}

/**
 * Periodic memory cleanup (call every few minutes)
 */
export function performMaintenanceCleanup(): void {
  cleanupMemory();
}
