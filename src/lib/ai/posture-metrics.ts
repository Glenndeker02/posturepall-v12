/**
 * Posture Metrics Calculator
 * Implements all posture analysis algorithms per PRD specifications
 * Calculates: head forward angle, shoulder symmetry, shoulder roundedness,
 * spine alignment, screen distance, and composite posture score
 */

import type {
  DetectedPose,
  PostureMetrics,
  PostureQuality,
  MetricClassification,
  CalibrationData,
  HeadForwardAngle,
  ShoulderSymmetry,
  ShoulderRoundedness,
  SpineAlignment,
  ScreenDistance,
} from './types';
import {
  getKeypoint,
  calculateMidpoint,
  calculateDistance,
  calculateAngleFromVertical,
} from './pose-detector';

/**
 * Weighted scoring for composite posture score
 */
const METRIC_WEIGHTS = {
  headForwardAngle: 0.30, // 30% - most common issue
  shoulderPosition: 0.25, // 25%
  spineAlignment: 0.25, // 25%
  screenDistance: 0.10, // 10%
  shoulderSymmetry: 0.10, // 10%
};

/**
 * Calculate head forward angle
 * Measures degrees of forward head tilt from baseline
 */
export function calculateHeadForwardAngle(
  pose: DetectedPose,
  calibration: CalibrationData | null
): HeadForwardAngle {
  const ear = getKeypoint(pose, 'left_ear') || getKeypoint(pose, 'right_ear');
  const shoulder =
    getKeypoint(pose, 'left_shoulder') || getKeypoint(pose, 'right_shoulder');

  if (!ear || !shoulder) {
    return {
      angle: 0,
      deviation: 0,
      classification: 'poor',
      score: 100,
    };
  }

  // Calculate angle between ear and shoulder relative to vertical
  const angle = calculateAngleFromVertical(shoulder, ear);

  // If we have calibration data, calculate deviation from baseline
  const baseline = calibration?.baselineAngles.headAngle || 0;
  const deviation = Math.abs(angle - baseline);

  // Classify based on deviation
  let classification: MetricClassification;
  if (deviation <= 5) {
    classification = 'good'; // ±5° from calibrated position
  } else if (deviation <= 15) {
    classification = 'moderate'; // 6-15° deviation
  } else {
    classification = 'poor'; // >15° deviation (text neck)
  }

  // Calculate score (0-100, where 0 is perfect)
  // Linear scaling: 0° = 0, 5° = 33, 15° = 66, 25°+ = 100
  const score = Math.min(100, (deviation / 25) * 100);

  return {
    angle,
    deviation,
    classification,
    score,
  };
}

/**
 * Calculate shoulder symmetry
 * Measures height difference between left and right shoulders
 */
export function calculateShoulderSymmetry(
  pose: DetectedPose,
  calibration: CalibrationData | null
): ShoulderSymmetry {
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const rightShoulder = getKeypoint(pose, 'right_shoulder');

  if (!leftShoulder || !rightShoulder) {
    return {
      heightDifference: 0,
      percentageDifference: 0,
      classification: 'poor',
      score: 100,
    };
  }

  // Calculate height difference (y-coordinates, lower y = higher on screen)
  const heightDifference = Math.abs(leftShoulder.y - rightShoulder.y);

  // Calculate shoulder width for normalization
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

  // Calculate percentage difference
  const percentageDifference = (heightDifference / shoulderWidth) * 100;

  // Classify based on percentage
  let classification: MetricClassification;
  if (percentageDifference < 5) {
    classification = 'good'; // <5% height difference
  } else if (percentageDifference <= 10) {
    classification = 'moderate'; // 5-10% difference
  } else {
    classification = 'poor'; // >10% difference
  }

  // Calculate score
  const score = Math.min(100, percentageDifference * 10);

  return {
    heightDifference,
    percentageDifference,
    classification,
    score,
  };
}

/**
 * Calculate shoulder roundedness
 * Measures forward protrusion of shoulders from spine alignment
 */
export function calculateShoulderRoundedness(
  pose: DetectedPose,
  calibration: CalibrationData | null
): ShoulderRoundedness {
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const leftEar = getKeypoint(pose, 'left_ear');
  const rightEar = getKeypoint(pose, 'right_ear');

  if (!leftShoulder || !rightShoulder || !leftEar || !rightEar) {
    return {
      forwardProtrusion: 0,
      classification: 'poor',
      score: 100,
    };
  }

  // Calculate shoulder midpoint
  const shoulderMidpoint = calculateMidpoint(leftShoulder, rightShoulder);

  // Calculate ear midpoint (proxy for head/neck position)
  const earMidpoint = calculateMidpoint(leftEar, rightEar);

  // Calculate horizontal distance (forward protrusion)
  // If shoulders are ahead of ears in x-axis, that's forward rounding
  const horizontalDistance = Math.abs(shoulderMidpoint.x - earMidpoint.x);

  // Normalize by shoulder width
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
  const normalizedDistance = (horizontalDistance / shoulderWidth) * 100;

  // Compare to baseline if available
  const baseline = calibration?.baselinePositions.shoulderWidth || shoulderWidth;
  const forwardProtrusion =
    ((horizontalDistance - baseline * 0.1) / (baseline * 0.1)) * 100;

  // Classify
  let classification: MetricClassification;
  if (forwardProtrusion <= 5) {
    classification = 'good'; // Within 5% of baseline
  } else if (forwardProtrusion <= 15) {
    classification = 'moderate'; // 5-15% forward
  } else {
    classification = 'poor'; // >15% forward (hunched)
  }

  // Calculate score
  const score = Math.min(100, Math.abs(forwardProtrusion) * 2);

  return {
    forwardProtrusion,
    classification,
    score,
  };
}

/**
 * Calculate spine alignment
 * Measures upper spine curve from neutral using shoulder-hip alignment
 */
export function calculateSpineAlignment(
  pose: DetectedPose,
  calibration: CalibrationData | null
): SpineAlignment {
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const leftHip = getKeypoint(pose, 'left_hip');
  const rightHip = getKeypoint(pose, 'right_hip');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return {
      angle: 0,
      classification: 'poor',
      score: 100,
    };
  }

  // Calculate midpoints
  const shoulderMidpoint = calculateMidpoint(leftShoulder, rightShoulder);
  const hipMidpoint = calculateMidpoint(leftHip, rightHip);

  // Calculate angle from vertical
  const angle = calculateAngleFromVertical(hipMidpoint, shoulderMidpoint);

  // Ideal is close to 0 (vertical)
  // Classify based on deviation from vertical
  let classification: MetricClassification;
  if (angle >= 0 && angle <= 10) {
    classification = 'good'; // 0-10° from vertical
  } else if (angle <= 20) {
    classification = 'moderate'; // 10-20° slouch
  } else {
    classification = 'poor'; // >20° slouch
  }

  // Calculate score
  const score = Math.min(100, (angle / 30) * 100);

  return {
    angle,
    classification,
    score,
  };
}

/**
 * Estimate distance from screen based on face size
 * Uses eye distance as proxy for face size
 */
export function calculateScreenDistance(
  pose: DetectedPose,
  calibration: CalibrationData | null
): ScreenDistance {
  const leftEye = getKeypoint(pose, 'left_eye');
  const rightEye = getKeypoint(pose, 'right_eye');

  if (!leftEye || !rightEye) {
    return {
      estimatedDistance: 0,
      classification: 'poor',
      score: 100,
    };
  }

  // Calculate eye distance (proxy for face size)
  const eyeDistance = calculateDistance(leftEye, rightEye);

  // Use calibration as baseline for optimal distance
  const baselineFaceSize = calibration?.baselinePositions.faceSize || 50;

  // Estimate distance based on face size relative to baseline
  // Larger face = closer, smaller face = farther
  // This is a rough estimation, actual distance would require camera calibration
  const sizeRatio = eyeDistance / baselineFaceSize;

  // Map size ratio to approximate distance in inches
  // 1.0 ratio = 20 inches (optimal)
  const estimatedDistance = 20 / sizeRatio;

  // Classify
  let classification: MetricClassification;
  if (estimatedDistance >= 18 && estimatedDistance <= 24) {
    classification = 'good'; // 18-24 inches (arm's length)
  } else if (estimatedDistance >= 12 && estimatedDistance < 18) {
    classification = 'moderate'; // 12-18 inches (too close)
  } else {
    classification = 'poor'; // <12 inches (eye strain risk) or >24 inches
  }

  // Calculate score
  const optimalDistance = 20;
  const deviation = Math.abs(estimatedDistance - optimalDistance);
  const score = Math.min(100, (deviation / 10) * 100);

  return {
    estimatedDistance,
    classification,
    score,
  };
}

/**
 * Calculate composite posture score
 * Weighted average of all metrics (0-100, where 0 is perfect)
 */
function calculateCompositeScore(metrics: {
  headForwardAngle: HeadForwardAngle;
  shoulderSymmetry: ShoulderSymmetry;
  shoulderRoundedness: ShoulderRoundedness;
  spineAlignment: SpineAlignment;
  screenDistance: ScreenDistance;
}): number {
  const weightedScore =
    metrics.headForwardAngle.score * METRIC_WEIGHTS.headForwardAngle +
    metrics.shoulderRoundedness.score * METRIC_WEIGHTS.shoulderPosition +
    metrics.spineAlignment.score * METRIC_WEIGHTS.spineAlignment +
    metrics.screenDistance.score * METRIC_WEIGHTS.screenDistance +
    metrics.shoulderSymmetry.score * METRIC_WEIGHTS.shoulderSymmetry;

  return Math.round(weightedScore);
}

/**
 * Determine overall posture quality from composite score
 */
function determinePostureQuality(compositeScore: number): PostureQuality {
  if (compositeScore <= 15) {
    return 'excellent'; // 0-15: Excellent (green)
  } else if (compositeScore <= 35) {
    return 'good'; // 16-35: Good (light green)
  } else if (compositeScore <= 60) {
    return 'fair'; // 36-60: Fair (yellow)
  } else {
    return 'poor'; // 61-100: Poor (red)
  }
}

/**
 * Calculate all posture metrics from detected pose
 * Main function to get complete posture analysis
 */
export function calculatePostureMetrics(
  pose: DetectedPose,
  calibration: CalibrationData | null = null
): PostureMetrics {
  // Calculate individual metrics
  const headForwardAngle = calculateHeadForwardAngle(pose, calibration);
  const shoulderSymmetry = calculateShoulderSymmetry(pose, calibration);
  const shoulderRoundedness = calculateShoulderRoundedness(pose, calibration);
  const spineAlignment = calculateSpineAlignment(pose, calibration);
  const screenDistance = calculateScreenDistance(pose, calibration);

  // Calculate composite score
  const compositeScore = calculateCompositeScore({
    headForwardAngle,
    shoulderSymmetry,
    shoulderRoundedness,
    spineAlignment,
    screenDistance,
  });

  // Determine overall quality
  const quality = determinePostureQuality(compositeScore);

  return {
    headForwardAngle,
    shoulderSymmetry,
    shoulderRoundedness,
    spineAlignment,
    screenDistance,
    compositeScore,
    quality,
    timestamp: Date.now(),
  };
}

/**
 * Get user-facing posture score (0-100%, where 100% is perfect)
 * Inverts the composite score for better UX
 */
export function getPostureScorePercentage(metrics: PostureMetrics): number {
  return Math.max(0, 100 - metrics.compositeScore);
}

/**
 * Identify the most problematic area from metrics
 */
export function identifyPrimaryIssue(metrics: PostureMetrics): string | null {
  const scores = {
    'Forward head posture': metrics.headForwardAngle.score,
    'Rounded shoulders': metrics.shoulderRoundedness.score,
    'Slouched spine': metrics.spineAlignment.score,
    'Uneven shoulders': metrics.shoulderSymmetry.score,
    'Too close to screen': metrics.screenDistance.score,
  };

  // Find the highest score (worst metric)
  let maxScore = 0;
  let primaryIssue: string | null = null;

  Object.entries(scores).forEach(([issue, score]) => {
    if (score > maxScore && score > 30) {
      // Only report if significant
      maxScore = score;
      primaryIssue = issue;
    }
  });

  return primaryIssue;
}

/**
 * Get correction suggestions based on metrics
 */
export function getCorrectionSuggestions(metrics: PostureMetrics): string[] {
  const suggestions: string[] = [];

  if (metrics.headForwardAngle.classification !== 'good') {
    suggestions.push('Tuck your chin and bring your head back');
  }

  if (metrics.shoulderRoundedness.classification !== 'good') {
    suggestions.push('Roll your shoulders back and down');
  }

  if (metrics.spineAlignment.classification !== 'good') {
    suggestions.push('Straighten your spine and sit up tall');
  }

  if (metrics.shoulderSymmetry.classification !== 'good') {
    suggestions.push('Level your shoulders evenly');
  }

  if (
    metrics.screenDistance.classification === 'moderate' &&
    metrics.screenDistance.estimatedDistance < 18
  ) {
    suggestions.push('Move back from the screen');
  }

  return suggestions;
}

/**
 * Compare current metrics to previous for trend analysis
 */
export function compareMetrics(
  current: PostureMetrics,
  previous: PostureMetrics
): {
  improved: boolean;
  scoreDelta: number;
  message: string;
} {
  const scoreDelta = current.compositeScore - previous.compositeScore;

  // Negative delta means improvement (lower score is better)
  const improved = scoreDelta < 0;

  let message = '';
  if (Math.abs(scoreDelta) < 5) {
    message = 'Posture is stable';
  } else if (improved) {
    message = `Posture improved by ${Math.abs(scoreDelta).toFixed(0)} points!`;
  } else {
    message = `Posture declined by ${Math.abs(scoreDelta).toFixed(0)} points`;
  }

  return {
    improved,
    scoreDelta,
    message,
  };
}
