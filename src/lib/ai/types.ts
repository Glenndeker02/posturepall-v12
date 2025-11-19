/**
 * TypeScript type definitions for pose detection and posture analysis
 * Using TensorFlow.js MoveNet pose estimation
 */

import type { Keypoint } from '@tensorflow-models/pose-detection';

/**
 * Keypoint names tracked by MoveNet for posture analysis
 */
export type KeypointName =
  | 'nose'
  | 'left_eye'
  | 'right_eye'
  | 'left_ear'
  | 'right_ear'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip';

/**
 * Extended keypoint with name
 */
export interface NamedKeypoint extends Keypoint {
  name?: KeypointName;
}

/**
 * Detected pose with keypoints
 */
export interface DetectedPose {
  keypoints: NamedKeypoint[];
  score?: number;
  timestamp: number;
}

/**
 * Posture quality classification
 */
export type PostureQuality = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Individual posture metric classification
 */
export type MetricClassification = 'good' | 'moderate' | 'poor';

/**
 * Head forward angle metric
 */
export interface HeadForwardAngle {
  angle: number; // Degrees from vertical
  deviation: number; // Deviation from baseline
  classification: MetricClassification;
  score: number; // 0-100, where 0 is perfect
}

/**
 * Shoulder symmetry metric
 */
export interface ShoulderSymmetry {
  heightDifference: number; // Pixels
  percentageDifference: number; // Percentage
  classification: MetricClassification;
  score: number;
}

/**
 * Shoulder roundedness metric
 */
export interface ShoulderRoundedness {
  forwardProtrusion: number; // Percentage from baseline
  classification: MetricClassification;
  score: number;
}

/**
 * Spine alignment metric
 */
export interface SpineAlignment {
  angle: number; // Degrees from vertical
  classification: MetricClassification;
  score: number;
}

/**
 * Screen distance metric
 */
export interface ScreenDistance {
  estimatedDistance: number; // Inches
  classification: MetricClassification;
  score: number;
}

/**
 * Comprehensive posture metrics
 */
export interface PostureMetrics {
  headForwardAngle: HeadForwardAngle;
  shoulderSymmetry: ShoulderSymmetry;
  shoulderRoundedness: ShoulderRoundedness;
  spineAlignment: SpineAlignment;
  screenDistance: ScreenDistance;
  compositeScore: number; // 0-100 weighted average
  quality: PostureQuality;
  timestamp: number;
}

/**
 * Calibration baseline data
 */
export interface CalibrationData {
  baselineAngles: {
    headAngle: number;
    shoulderAngle: number;
    spineAngle: number;
  };
  baselinePositions: {
    noseY: number;
    shoulderMidpointY: number;
    shoulderWidth: number;
    faceSize: number; // For distance estimation
  };
  keypointConfidences: Record<string, number>;
  capturedAt: number;
  qualityScore: number;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  threshold: number; // Seconds of poor posture before alert
  minTimeBetweenAlerts: number; // Seconds
  methods: {
    visual: boolean;
    audio: boolean;
    haptic: boolean;
  };
  sensitivity: 'lenient' | 'balanced' | 'strict';
  doNotDisturb: boolean;
}

/**
 * Posture alert
 */
export interface PostureAlert {
  type: 'deviation' | 'praise' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  message: string;
  problemAreas: string[];
  timestamp: number;
  dismissed: boolean;
}

/**
 * Session statistics
 */
export interface SessionStats {
  duration: number; // Milliseconds
  postureScore: number; // Percentage (0-100)
  timeInQuality: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  alerts: {
    total: number;
    deviations: number;
    praises: number;
  };
  commonIssues: Record<string, number>;
  averageCorrectionTime: number; // Seconds
  pointsEarned: number;
}

/**
 * Real-time session data point
 */
export interface SessionDataPoint {
  timestamp: number;
  metrics: PostureMetrics;
  alert?: PostureAlert;
}

/**
 * MoveNet model configuration
 */
export interface ModelConfig {
  modelType: 'thunder' | 'lightning';
  scoreThreshold: number;
  maxPoses: number;
  enableSmoothing: boolean;
}

/**
 * Pose detector state
 */
export interface DetectorState {
  isInitialized: boolean;
  isDetecting: boolean;
  model: ModelConfig;
  frameRate: number;
  lastDetectionTime: number;
}
