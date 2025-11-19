/**
 * Calibration Validation Helper
 * Validates calibration data quality and provides recalibration recommendations
 */

import type { CalibrationData, DetectedPose } from './types';
import { getKeypoint, hasRequiredKeypoints, calculateDistance } from './pose-detector';

/**
 * Required keypoints for valid calibration
 */
const REQUIRED_CALIBRATION_KEYPOINTS = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_hip',
  'right_hip',
] as const;

/**
 * Minimum confidence threshold for calibration keypoints
 */
const MIN_CALIBRATION_CONFIDENCE = 0.5;

/**
 * Maximum age for calibration data (7 days in milliseconds)
 */
const MAX_CALIBRATION_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if calibration is recent enough
 */
export function isCalibrationRecent(calibration: CalibrationData): boolean {
  const age = Date.now() - calibration.capturedAt;
  return age < MAX_CALIBRATION_AGE;
}

/**
 * Get calibration age in days
 */
export function getCalibrationAgeDays(calibration: CalibrationData): number {
  const age = Date.now() - calibration.capturedAt;
  return Math.floor(age / (24 * 60 * 60 * 1000));
}

/**
 * Validate pose quality for calibration
 */
export function validatePoseForCalibration(pose: DetectedPose): {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
} {
  const issues: string[] = [];

  // Check required keypoints
  const hasAllKeypoints = hasRequiredKeypoints(
    pose,
    REQUIRED_CALIBRATION_KEYPOINTS as any,
    MIN_CALIBRATION_CONFIDENCE
  );

  if (!hasAllKeypoints) {
    issues.push('Not all required keypoints are visible with sufficient confidence');
  }

  // Check individual keypoint confidences
  const lowConfidenceKeypoints = pose.keypoints.filter(
    (kp) => kp.score !== undefined && kp.score < MIN_CALIBRATION_CONFIDENCE
  );

  if (lowConfidenceKeypoints.length > 0) {
    issues.push(
      `Low confidence for: ${lowConfidenceKeypoints.map((kp) => kp.name).join(', ')}`
    );
  }

  // Check face visibility (both eyes and nose)
  const nose = getKeypoint(pose, 'nose');
  const leftEye = getKeypoint(pose, 'left_eye');
  const rightEye = getKeypoint(pose, 'right_eye');

  if (!nose || !leftEye || !rightEye) {
    issues.push('Face not clearly visible');
  }

  // Check distance (face size should be adequate)
  if (leftEye && rightEye) {
    const eyeDistance = calculateDistance(leftEye, rightEye);
    if (eyeDistance < 30) {
      issues.push('Too far from camera - move closer');
    } else if (eyeDistance > 150) {
      issues.push('Too close to camera - move back');
    }
  }

  // Check shoulder visibility and symmetry
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const rightShoulder = getKeypoint(pose, 'right_shoulder');

  if (!leftShoulder || !rightShoulder) {
    issues.push('Shoulders not visible - adjust camera position');
  } else {
    // Check if shoulders are roughly level (not tilted)
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

    if (shoulderTilt / shoulderWidth > 0.15) {
      issues.push('Please level your shoulders and face the camera straight');
    }
  }

  // Check overall pose score
  if (pose.score !== undefined && pose.score < 0.5) {
    issues.push('Overall pose detection quality is low');
  }

  // Calculate quality score (0-100)
  const averageConfidence =
    pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) /
    pose.keypoints.length;
  const qualityScore = Math.round(averageConfidence * 100);

  return {
    isValid: issues.length === 0,
    issues,
    qualityScore,
  };
}

/**
 * Average multiple poses for calibration
 * Reduces noise by averaging keypoint positions across frames
 */
export function averagePosesForCalibration(poses: DetectedPose[]): DetectedPose {
  if (poses.length === 0) {
    throw new Error('No poses to average');
  }

  if (poses.length === 1) {
    return poses[0];
  }

  // Initialize accumulators for each keypoint
  const keypointAccumulators: Map<
    string,
    { x: number; y: number; score: number; count: number }
  > = new Map();

  // Accumulate keypoint positions
  poses.forEach((pose) => {
    pose.keypoints.forEach((kp) => {
      const name = kp.name || 'unknown';
      const existing = keypointAccumulators.get(name) || {
        x: 0,
        y: 0,
        score: 0,
        count: 0,
      };

      keypointAccumulators.set(name, {
        x: existing.x + kp.x,
        y: existing.y + kp.y,
        score: existing.score + (kp.score || 0),
        count: existing.count + 1,
      });
    });
  });

  // Calculate averages
  const averagedKeypoints = Array.from(keypointAccumulators.entries()).map(
    ([name, accumulator]) => ({
      name: name as any,
      x: accumulator.x / accumulator.count,
      y: accumulator.y / accumulator.count,
      score: accumulator.score / accumulator.count,
    })
  );

  // Average pose score
  const averageScore =
    poses.reduce((sum, pose) => sum + (pose.score || 0), 0) / poses.length;

  return {
    keypoints: averagedKeypoints,
    score: averageScore,
    timestamp: Date.now(),
  };
}

/**
 * Create calibration data from averaged pose
 */
export function createCalibrationData(pose: DetectedPose): CalibrationData {
  const nose = getKeypoint(pose, 'nose');
  const leftEar = getKeypoint(pose, 'left_ear');
  const rightEar = getKeypoint(pose, 'right_ear');
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const leftHip = getKeypoint(pose, 'left_hip');
  const rightHip = getKeypoint(pose, 'right_hip');
  const leftEye = getKeypoint(pose, 'left_eye');
  const rightEye = getKeypoint(pose, 'right_eye');

  if (
    !nose ||
    !leftEar ||
    !rightEar ||
    !leftShoulder ||
    !rightShoulder ||
    !leftHip ||
    !rightHip ||
    !leftEye ||
    !rightEye
  ) {
    throw new Error('Missing required keypoints for calibration');
  }

  // Calculate baseline angles
  const earMidpoint = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2,
  };
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  // Head angle (ear to shoulder)
  const headAngle =
    90 -
    Math.abs(
      Math.atan2(earMidpoint.y - shoulderMidpoint.y, earMidpoint.x - shoulderMidpoint.x) *
        (180 / Math.PI)
    );

  // Shoulder angle
  const shoulderAngle = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );

  // Spine angle (shoulder to hip)
  const spineAngle =
    90 -
    Math.abs(
      Math.atan2(
        shoulderMidpoint.y - hipMidpoint.y,
        shoulderMidpoint.x - hipMidpoint.x
      ) *
        (180 / Math.PI)
    );

  // Calculate baseline positions
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
  const faceSize = calculateDistance(leftEye, rightEye);

  // Get keypoint confidences
  const keypointConfidences: Record<string, number> = {};
  pose.keypoints.forEach((kp) => {
    if (kp.name && kp.score !== undefined) {
      keypointConfidences[kp.name] = kp.score;
    }
  });

  // Calculate quality score
  const averageConfidence =
    pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) /
    pose.keypoints.length;
  const qualityScore = Math.round(averageConfidence * 100);

  return {
    baselineAngles: {
      headAngle,
      shoulderAngle,
      spineAngle,
    },
    baselinePositions: {
      noseY: nose.y,
      shoulderMidpointY: shoulderMidpoint.y,
      shoulderWidth,
      faceSize,
    },
    keypointConfidences,
    capturedAt: Date.now(),
    qualityScore,
  };
}

/**
 * Check if calibration data integrity is valid
 */
export function validateCalibrationData(calibration: CalibrationData): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if required fields exist
  if (!calibration.baselineAngles) {
    issues.push('Missing baseline angles');
  }

  if (!calibration.baselinePositions) {
    issues.push('Missing baseline positions');
  }

  if (!calibration.capturedAt) {
    issues.push('Missing capture timestamp');
  }

  // Check if angles are reasonable
  if (calibration.baselineAngles) {
    const { headAngle, shoulderAngle, spineAngle } = calibration.baselineAngles;

    if (headAngle < -90 || headAngle > 90) {
      issues.push('Head angle out of reasonable range');
    }

    if (Math.abs(shoulderAngle) > Math.PI / 4) {
      // More than 45° tilt
      issues.push('Shoulder angle indicates poor calibration posture');
    }

    if (spineAngle < -90 || spineAngle > 90) {
      issues.push('Spine angle out of reasonable range');
    }
  }

  // Check quality score
  if (calibration.qualityScore < 50) {
    issues.push('Calibration quality score is too low');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Determine if recalibration is recommended
 */
export function shouldRecalibrate(
  calibration: CalibrationData | null,
  currentPostureScore?: number
): {
  shouldRecalibrate: boolean;
  reason: string | null;
} {
  if (!calibration) {
    return {
      shouldRecalibrate: true,
      reason: 'No calibration data exists',
    };
  }

  // Check age
  if (!isCalibrationRecent(calibration)) {
    const ageDays = getCalibrationAgeDays(calibration);
    return {
      shouldRecalibrate: true,
      reason: `Calibration is ${ageDays} days old (recommended: weekly)`,
    };
  }

  // Check integrity
  const { isValid, issues } = validateCalibrationData(calibration);
  if (!isValid) {
    return {
      shouldRecalibrate: true,
      reason: `Calibration data issues: ${issues.join(', ')}`,
    };
  }

  // Check if user has significantly improved
  // If consistently scoring 90%+, they may have improved beyond their baseline
  if (currentPostureScore !== undefined && currentPostureScore >= 90) {
    return {
      shouldRecalibrate: false, // Optional suggestion in UI
      reason: 'Your posture has improved! Consider recalibrating to set a new baseline',
    };
  }

  return {
    shouldRecalibrate: false,
    reason: null,
  };
}

/**
 * Get recalibration recommendations
 */
export function getRecalibrationRecommendations(
  calibration: CalibrationData | null
): string[] {
  const recommendations: string[] = [];

  if (!calibration) {
    recommendations.push('Complete initial calibration to establish your baseline');
    return recommendations;
  }

  const ageDays = getCalibrationAgeDays(calibration);

  if (ageDays > 7) {
    recommendations.push('Recalibrate weekly for best accuracy');
  }

  if (calibration.qualityScore < 70) {
    recommendations.push(
      'Previous calibration had low quality - recalibrate in better lighting'
    );
  }

  if (ageDays < 1 && calibration.qualityScore >= 70) {
    recommendations.push('Your calibration is recent and high-quality!');
  }

  return recommendations;
}
