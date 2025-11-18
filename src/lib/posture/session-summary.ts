/**
 * Session Summary Generator
 * Analyzes posture session data and generates insights, statistics, and recommendations
 */

import type { SessionStats, SessionDataPoint, PostureMetrics } from '../ai/types';
import { getPostureScorePercentage, identifyPrimaryIssue } from '../ai/posture-metrics';

/**
 * Calculate session statistics from data points
 */
export function calculateSessionStats(
  dataPoints: SessionDataPoint[],
  startTime: number,
  endTime: number
): SessionStats {
  if (dataPoints.length === 0) {
    return {
      duration: endTime - startTime,
      postureScore: 0,
      timeInQuality: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
      alerts: {
        total: 0,
        deviations: 0,
        praises: 0,
      },
      commonIssues: {},
      averageCorrectionTime: 0,
      pointsEarned: 0,
    };
  }

  const duration = endTime - startTime;

  // Calculate time in each quality category
  const timeInQuality = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
  };

  let totalScore = 0;
  const commonIssues: Record<string, number> = {};
  const alerts = {
    total: 0,
    deviations: 0,
    praises: 0,
  };

  const correctionTimes: number[] = [];
  let lastPoorTime: number | null = null;

  // Analyze each data point
  dataPoints.forEach((point, index) => {
    const metrics = point.metrics;

    // Track time in each quality
    if (index > 0) {
      const timeDiff = point.timestamp - dataPoints[index - 1].timestamp;
      timeInQuality[metrics.quality] += timeDiff;
    }

    // Sum scores for average
    totalScore += getPostureScorePercentage(metrics);

    // Track common issues
    const primaryIssue = identifyPrimaryIssue(metrics);
    if (primaryIssue) {
      commonIssues[primaryIssue] = (commonIssues[primaryIssue] || 0) + 1;
    }

    // Track alerts
    if (point.alert) {
      alerts.total++;
      if (point.alert.type === 'deviation') {
        alerts.deviations++;
        lastPoorTime = point.timestamp;
      } else if (point.alert.type === 'praise') {
        alerts.praises++;
      }
    }

    // Track correction times
    const wasPoor =
      index > 0 &&
      (dataPoints[index - 1].metrics.quality === 'fair' ||
        dataPoints[index - 1].metrics.quality === 'poor');
    const isGood =
      metrics.quality === 'excellent' || metrics.quality === 'good';

    if (wasPoor && isGood && lastPoorTime) {
      const correctionTime = (point.timestamp - lastPoorTime) / 1000; // Convert to seconds
      correctionTimes.push(correctionTime);
      lastPoorTime = null;
    }
  });

  // Calculate averages
  const postureScore = Math.round(totalScore / dataPoints.length);
  const averageCorrectionTime =
    correctionTimes.length > 0
      ? Math.round(
          correctionTimes.reduce((a, b) => a + b, 0) / correctionTimes.length
        )
      : 0;

  // Calculate points earned
  const pointsEarned = calculatePointsEarned(
    duration,
    postureScore,
    alerts.praises
  );

  return {
    duration,
    postureScore,
    timeInQuality,
    alerts,
    commonIssues,
    averageCorrectionTime,
    pointsEarned,
  };
}

/**
 * Calculate points earned from session
 * - 50 points per hour of session
 * - Bonus for good posture
 * - Bonus for praises (milestones)
 */
function calculatePointsEarned(
  duration: number,
  postureScore: number,
  praises: number
): number {
  const hours = duration / (1000 * 60 * 60);

  // Base points: 50 per hour
  let points = Math.round(hours * 50);

  // Bonus for good posture
  if (postureScore >= 90) {
    points += Math.round(hours * 50); // 100% bonus for excellent
  } else if (postureScore >= 80) {
    points += Math.round(hours * 25); // 50% bonus for good
  }

  // Praise bonuses
  points += praises * 25;

  return points;
}

/**
 * Generate session grade (A-F)
 */
export function generateSessionGrade(stats: SessionStats): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  message: string;
} {
  const score = stats.postureScore;

  if (score >= 90) {
    return {
      grade: 'A',
      message: 'Exceptional work! Your posture was nearly perfect!',
    };
  } else if (score >= 80) {
    return {
      grade: 'B',
      message: 'Great session! You maintained strong posture!',
    };
  } else if (score >= 70) {
    return {
      grade: 'C',
      message: 'Good effort! Room for improvement.',
    };
  } else if (score >= 60) {
    return {
      grade: 'D',
      message: 'Keep working on it. Small improvements add up!',
    };
  } else {
    return {
      grade: 'F',
      message: "Let's focus on building better habits tomorrow.",
    };
  }
}

/**
 * Generate AI-powered insights from session data
 */
export function generateSessionInsights(
  stats: SessionStats,
  dataPoints: SessionDataPoint[]
): string[] {
  const insights: string[] = [];

  // Analyze posture deterioration over time
  const deteriorationPoint = findPostureDeteriorationPoint(dataPoints);
  if (deteriorationPoint) {
    const minutes = Math.round(deteriorationPoint / (1000 * 60));
    insights.push(
      `Your posture tends to decline after ${minutes} minutes. Consider scheduling breaks at ${minutes - 10} min.`
    );
  }

  // Analyze common issues
  const topIssue = Object.entries(stats.commonIssues).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topIssue) {
    const [issue, count] = topIssue;
    const percentage = Math.round((count / dataPoints.length) * 100);
    insights.push(
      `${issue} was detected ${percentage}% of the time. ${getExerciseRecommendation(issue)}`
    );
  }

  // Analyze correction speed
  if (stats.averageCorrectionTime > 0) {
    const comparedToTarget = stats.averageCorrectionTime - 60; // Target: 60 seconds
    if (comparedToTarget > 0) {
      insights.push(
        `You're correcting posture in ${stats.averageCorrectionTime}s on average. Try to respond faster to alerts.`
      );
    } else {
      insights.push(
        `Excellent! You're correcting posture ${Math.abs(comparedToTarget)}s faster than target.`
      );
    }
  }

  // Quality distribution insight
  const totalTime = Object.values(stats.timeInQuality).reduce((a, b) => a + b, 0);
  const poorPercentage = Math.round(
    (stats.timeInQuality.poor / totalTime) * 100
  );

  if (poorPercentage > 30) {
    insights.push(
      `You spent ${poorPercentage}% of the session in poor posture. Focus on maintaining awareness.`
    );
  } else if (poorPercentage < 10) {
    insights.push(
      `Amazing! Less than ${poorPercentage}% poor posture time. Keep up the great work!`
    );
  }

  return insights;
}

/**
 * Find the point in session where posture starts to decline
 */
function findPostureDeteriorationPoint(
  dataPoints: SessionDataPoint[]
): number | null {
  if (dataPoints.length < 10) {
    return null;
  }

  // Look for sustained drop in quality
  for (let i = 5; i < dataPoints.length - 5; i++) {
    const before = dataPoints.slice(i - 5, i);
    const after = dataPoints.slice(i, i + 5);

    const avgBefore =
      before.reduce(
        (sum, p) => sum + getPostureScorePercentage(p.metrics),
        0
      ) / 5;
    const avgAfter =
      after.reduce(
        (sum, p) => sum + getPostureScorePercentage(p.metrics),
        0
      ) / 5;

    // Significant drop detected
    if (avgBefore - avgAfter > 15) {
      return dataPoints[i].timestamp - dataPoints[0].timestamp;
    }
  }

  return null;
}

/**
 * Get exercise recommendation based on detected issue
 */
function getExerciseRecommendation(issue: string): string {
  const recommendations: Record<string, string> = {
    'Forward head posture': 'Try the Chin Tuck and Neck Stretch exercises.',
    'Rounded shoulders': 'Try the Shoulder Blade Squeeze exercise.',
    'Slouched spine': 'Try the Seated Cat-Cow Stretch.',
    'Uneven shoulders': 'Check your desk setup and try shoulder rolls.',
    'Too close to screen': 'Adjust your monitor distance or desk setup.',
  };

  return recommendations[issue] || 'Review the exercise library for suggestions.';
}

/**
 * Generate action recommendations based on session
 */
export function generateActionRecommendations(
  stats: SessionStats,
  dataPoints: SessionDataPoint[]
): Array<{ action: string; priority: 'high' | 'medium' | 'low' }> {
  const recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Recommend exercises based on common issues
  const topIssue = Object.entries(stats.commonIssues).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (topIssue) {
    const [issue] = topIssue;
    const exercise = getExerciseForIssue(issue);
    if (exercise) {
      recommendations.push({
        action: `Complete the '${exercise}' routine (5 min)`,
        priority: 'high',
      });
    }
  }

  // Recommend ergonomic adjustments
  if (
    stats.commonIssues['Too close to screen'] &&
    stats.commonIssues['Too close to screen'] > dataPoints.length * 0.3
  ) {
    recommendations.push({
      action: 'Adjust your monitor position - it may be too close',
      priority: 'high',
    });
  }

  // Recommend calibration check
  const deteriorationPoint = findPostureDeteriorationPoint(dataPoints);
  if (deteriorationPoint && stats.postureScore < 70) {
    recommendations.push({
      action: 'Consider recalibrating - your baseline may have shifted',
      priority: 'medium',
    });
  }

  // Recommend break schedule adjustment
  if (stats.postureScore < 75 && deteriorationPoint) {
    const minutes = Math.round(deteriorationPoint / (1000 * 60));
    recommendations.push({
      action: `Adjust break frequency to every ${Math.max(30, minutes - 10)} minutes`,
      priority: 'medium',
    });
  }

  // Positive reinforcement
  if (stats.postureScore >= 85) {
    recommendations.push({
      action: 'Great work today! Maintain this consistency.',
      priority: 'low',
    });
  }

  return recommendations;
}

/**
 * Get specific exercise name for issue
 */
function getExerciseForIssue(issue: string): string | null {
  const exerciseMap: Record<string, string> = {
    'Forward head posture': 'Neck Relief',
    'Rounded shoulders': 'Shoulder Opener',
    'Slouched spine': 'Spine Stretch',
    'Uneven shoulders': 'Shoulder Balance',
  };

  return exerciseMap[issue] || null;
}

/**
 * Compare session to user's average
 */
export function compareToAverage(
  currentScore: number,
  averageScore: number
): {
  comparison: 'better' | 'same' | 'worse';
  difference: number;
  message: string;
} {
  const difference = currentScore - averageScore;

  if (Math.abs(difference) < 3) {
    return {
      comparison: 'same',
      difference: 0,
      message: 'Similar to your average',
    };
  } else if (difference > 0) {
    return {
      comparison: 'better',
      difference,
      message: `↑ ${difference.toFixed(0)}% better than your average`,
    };
  } else {
    return {
      comparison: 'worse',
      difference: Math.abs(difference),
      message: `↓ ${Math.abs(difference).toFixed(0)}% below your average`,
    };
  }
}

/**
 * Check for personal records
 */
export function checkPersonalRecords(
  stats: SessionStats,
  previousBest: {
    longestGoodPostureStreak?: number;
    bestPostureScore?: number;
    fastestCorrectionTime?: number;
  }
): Array<{ record: string; value: number }> {
  const records: Array<{ record: string; value: number }> = [];

  // Best posture score
  if (
    !previousBest.bestPostureScore ||
    stats.postureScore > previousBest.bestPostureScore
  ) {
    records.push({
      record: 'Best posture score',
      value: stats.postureScore,
    });
  }

  // Fastest correction time
  if (
    stats.averageCorrectionTime > 0 &&
    (!previousBest.fastestCorrectionTime ||
      stats.averageCorrectionTime < previousBest.fastestCorrectionTime)
  ) {
    records.push({
      record: 'Fastest average correction',
      value: stats.averageCorrectionTime,
    });
  }

  return records;
}

/**
 * Format session duration for display
 */
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  } else {
    return `${seconds} seconds`;
  }
}

/**
 * Calculate percentage breakdown for pie chart
 */
export function calculateQualityPercentages(stats: SessionStats): {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
} {
  const total = Object.values(stats.timeInQuality).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return { excellent: 0, good: 0, fair: 0, poor: 0 };
  }

  return {
    excellent: Math.round((stats.timeInQuality.excellent / total) * 100),
    good: Math.round((stats.timeInQuality.good / total) * 100),
    fair: Math.round((stats.timeInQuality.fair / total) * 100),
    poor: Math.round((stats.timeInQuality.poor / total) * 100),
  };
}
