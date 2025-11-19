/**
 * Posture Alert System
 * Manages posture deviation alerts, praise notifications, and smart alert logic
 */

import type { PostureMetrics, PostureAlert, AlertConfig } from '../ai/types';

/**
 * Alert state management
 */
interface AlertState {
  lastAlertTime: number;
  poorPostureStartTime: number | null;
  lastCorrectionTime: number | null;
  consecutiveGoodPostureTime: number;
  alertCount: number;
  lastQuality: string;
}

let alertState: AlertState = {
  lastAlertTime: 0,
  poorPostureStartTime: null,
  lastCorrectionTime: null,
  consecutiveGoodPostureTime: 0,
  alertCount: 0,
  lastQuality: 'good',
};

/**
 * Default alert configuration
 */
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  threshold: 30, // 30 seconds of poor posture
  minTimeBetweenAlerts: 300, // 5 minutes
  methods: {
    visual: true,
    audio: false,
    haptic: false,
  },
  sensitivity: 'balanced',
  doNotDisturb: false,
};

let currentConfig: AlertConfig = { ...DEFAULT_ALERT_CONFIG };

/**
 * Set alert configuration
 */
export function setAlertConfig(config: Partial<AlertConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get current alert configuration
 */
export function getAlertConfig(): AlertConfig {
  return { ...currentConfig };
}

/**
 * Reset alert state
 */
export function resetAlertState(): void {
  alertState = {
    lastAlertTime: 0,
    poorPostureStartTime: null,
    lastCorrectionTime: null,
    consecutiveGoodPostureTime: 0,
    alertCount: 0,
    lastQuality: 'good',
  };
}

/**
 * Adjust threshold based on sensitivity setting
 */
function getAdjustedThreshold(): number {
  const baseThreshold = currentConfig.threshold;

  switch (currentConfig.sensitivity) {
    case 'lenient':
      return baseThreshold * 2; // 2x threshold (only severe deviations)
    case 'strict':
      return baseThreshold * 0.5; // 0.5x threshold (even minor deviations)
    case 'balanced':
    default:
      return baseThreshold;
  }
}

/**
 * Check if alert should be triggered
 */
function shouldTriggerAlert(metrics: PostureMetrics, now: number): boolean {
  // Check if alerts are enabled
  if (!currentConfig.enabled || currentConfig.doNotDisturb) {
    return false;
  }

  // Check if in grace period after correction
  if (
    alertState.lastCorrectionTime &&
    now - alertState.lastCorrectionTime < 120000
  ) {
    // 2 minutes grace period
    return false;
  }

  // Check frequency limiting
  const minInterval = currentConfig.minTimeBetweenAlerts * 1000; // Convert to ms
  if (now - alertState.lastAlertTime < minInterval) {
    return false;
  }

  // Check if poor posture has been sustained
  if (!alertState.poorPostureStartTime) {
    return false;
  }

  const poorPostureDuration = now - alertState.poorPostureStartTime;
  const adjustedThreshold = getAdjustedThreshold() * 1000; // Convert to ms

  return poorPostureDuration >= adjustedThreshold;
}

/**
 * Create deviation alert message
 */
function createDeviationAlert(metrics: PostureMetrics): PostureAlert {
  const problemAreas: string[] = [];

  // Identify problem areas
  if (metrics.headForwardAngle.classification !== 'good') {
    problemAreas.push('Forward head posture');
  }
  if (metrics.shoulderRoundedness.classification !== 'good') {
    problemAreas.push('Rounded shoulders');
  }
  if (metrics.spineAlignment.classification !== 'good') {
    problemAreas.push('Slouched spine');
  }
  if (metrics.shoulderSymmetry.classification !== 'good') {
    problemAreas.push('Uneven shoulders');
  }
  if (metrics.screenDistance.classification === 'poor') {
    problemAreas.push('Too close to screen');
  }

  // Determine severity
  let severity: 'low' | 'medium' | 'high';
  if (metrics.quality === 'poor') {
    severity = 'high';
  } else if (metrics.quality === 'fair') {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  // Create message based on tone preference (default: friendly)
  const messages = {
    friendly: [
      "Hey there! Let's check that posture 😊",
      "Posture check! Time to sit up straight 🌟",
      "Oops! Your posture needs some love ❤️",
      "Let's straighten up together! You've got this 💪",
    ],
    professional: [
      'Posture correction needed',
      'Please adjust your posture',
      'Posture deviation detected',
      'Time to correct your posture',
    ],
    playful: [
      'Uh-oh, slouch alert! 🚨',
      "Your spine called - it wants to be straight! 😄",
      "Posture police here! Sit up! 👮",
      "Slouch monster detected! Fight back! 🦸",
    ],
    mindful: [
      'Take a breath and realign your body 🧘',
      'Notice your posture and gently adjust ☮️',
      'Bring awareness to your spine 🌿',
      'Mindfully return to center 🕉️',
    ],
  };

  const selectedMessages = messages.friendly; // Default to friendly
  const message =
    selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

  return {
    type: 'deviation',
    severity,
    message,
    problemAreas,
    timestamp: Date.now(),
    dismissed: false,
  };
}

/**
 * Create praise notification
 */
function createPraiseAlert(duration: number): PostureAlert {
  const minutes = Math.floor(duration / 60000);

  const praiseMessages = [
    `Amazing! ${minutes} minutes of perfect posture! 🌟`,
    `You're crushing it! ${minutes} min streak! 🎉`,
    `Excellent work! ${minutes} minutes strong! 💪`,
    `Keep it up! ${minutes} min of great posture! ⭐`,
    `Posture champion! ${minutes} minutes! 🏆`,
  ];

  const message = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];

  return {
    type: 'praise',
    severity: 'low',
    message,
    problemAreas: [],
    timestamp: Date.now(),
    dismissed: false,
  };
}

/**
 * Create milestone alert
 */
function createMilestoneAlert(milestone: string): PostureAlert {
  return {
    type: 'milestone',
    severity: 'low',
    message: milestone,
    problemAreas: [],
    timestamp: Date.now(),
    dismissed: false,
  };
}

/**
 * Process posture metrics and determine if alert needed
 */
export function processPostureMetrics(
  metrics: PostureMetrics
): PostureAlert | null {
  const now = Date.now();
  const currentQuality = metrics.quality;

  // Track posture quality changes
  const wasPoor = alertState.lastQuality === 'fair' || alertState.lastQuality === 'poor';
  const isPoor = currentQuality === 'fair' || currentQuality === 'poor';
  const wasGood = alertState.lastQuality === 'excellent' || alertState.lastQuality === 'good';
  const isGood = currentQuality === 'excellent' || currentQuality === 'good';

  // User just corrected poor posture
  if (wasPoor && isGood) {
    alertState.lastCorrectionTime = now;
    alertState.poorPostureStartTime = null;
    alertState.consecutiveGoodPostureTime = now;
  }

  // User started poor posture
  if (!wasPoor && isPoor) {
    alertState.poorPostureStartTime = now;
  }

  // User is maintaining poor posture
  if (isPoor && alertState.poorPostureStartTime) {
    if (shouldTriggerAlert(metrics, now)) {
      alertState.lastAlertTime = now;
      alertState.alertCount++;
      const alert = createDeviationAlert(metrics);
      alertState.lastQuality = currentQuality;
      return alert;
    }
  }

  // Check for praise (good posture sustained)
  if (isGood && alertState.consecutiveGoodPostureTime) {
    const goodDuration = now - alertState.consecutiveGoodPostureTime;

    // Praise at milestones: 30 min, 1 hr, 2 hr
    const praiseIntervals = [30 * 60 * 1000, 60 * 60 * 1000, 120 * 60 * 1000];
    const lastPraiseDuration =
      praiseIntervals
        .filter((interval) => goodDuration >= interval)
        .pop() || 0;

    // Check if we just hit a milestone
    if (lastPraiseDuration > 0) {
      const timeSinceLastAlert = now - alertState.lastAlertTime;
      if (timeSinceLastAlert > 10 * 60 * 1000) {
        // At least 10 min since last alert
        alertState.lastAlertTime = now;
        const alert = createPraiseAlert(goodDuration);
        alertState.lastQuality = currentQuality;
        return alert;
      }
    }
  }

  alertState.lastQuality = currentQuality;
  return null;
}

/**
 * Check for rapid deterioration (good → poor in <5 min)
 */
export function checkRapidDeterioration(
  previousMetrics: PostureMetrics,
  currentMetrics: PostureMetrics
): boolean {
  const wasGood =
    previousMetrics.quality === 'excellent' || previousMetrics.quality === 'good';
  const isPoor = currentMetrics.quality === 'poor';

  if (!wasGood || !isPoor) {
    return false;
  }

  const timeDiff = currentMetrics.timestamp - previousMetrics.timestamp;
  return timeDiff < 5 * 60 * 1000; // Less than 5 minutes
}

/**
 * Get alert statistics
 */
export function getAlertStatistics(): {
  totalAlerts: number;
  lastAlertTime: number;
  averageResponseTime: number | null;
} {
  return {
    totalAlerts: alertState.alertCount,
    lastAlertTime: alertState.lastAlertTime,
    averageResponseTime: null, // Would need to track correction times
  };
}

/**
 * Enable Do Not Disturb mode
 */
export function enableDoNotDisturb(duration?: number): void {
  currentConfig.doNotDisturb = true;

  if (duration) {
    setTimeout(() => {
      currentConfig.doNotDisturb = false;
    }, duration);
  }
}

/**
 * Disable Do Not Disturb mode
 */
export function disableDoNotDisturb(): void {
  currentConfig.doNotDisturb = false;
}

/**
 * Check if currently in Do Not Disturb mode
 */
export function isDoNotDisturb(): boolean {
  return currentConfig.doNotDisturb;
}

/**
 * Get suggested alert sound based on severity
 */
export function getSuggestedAlertSound(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'low':
      return 'gentle-chime';
    case 'medium':
      return 'soft-bell';
    case 'high':
      return 'alert-ding';
    default:
      return 'gentle-chime';
  }
}

/**
 * Format alert message with user name (optional personalization)
 */
export function formatAlertMessage(alert: PostureAlert, userName?: string): string {
  if (userName && alert.type === 'deviation') {
    return `${userName}, ${alert.message.toLowerCase()}`;
  }
  return alert.message;
}
