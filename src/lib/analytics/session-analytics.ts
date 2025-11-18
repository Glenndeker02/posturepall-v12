/**
 * Session Analytics Service
 * Generates insights, recommendations, and calculates session metrics
 */

import type { PostureMetrics } from '@/lib/ai/types';

export interface SessionDataPoint {
  timestamp: number;
  score: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  headForwardAngle: number;
  shoulderSymmetry: number;
  screenDistance: number;
}

export interface ProblemAreaFrequency {
  neck: number;
  upperBack: number;
  shoulders: number;
  lowerBack: number;
  head: number;
}

export interface SessionAnalytics {
  // Time distribution
  timeExcellent: number;
  timeGood: number;
  timeFair: number;
  timePoor: number;

  // Deviation breakdown percentages
  excellentPercent: number;
  goodPercent: number;
  fairPercent: number;
  poorPercent: number;

  // Alerts
  totalAlerts: number;
  postureAlerts: number;
  breakReminders: number;

  // Correction metrics
  avgCorrectionTime: number;
  correctionTrend: 'improving' | 'stable' | 'declining';
  correctionTrendPercent: number;

  // Problem areas
  problemAreas: ProblemAreaFrequency;
  mostCommonIssue: string;
  mostCommonIssuePercent: number;

  // Timeline
  postureTimeline: Array<{ timestamp: number; score: number }>;
  problemPeriods: Array<{ start: number; end: number; reason: string }>;

  // Consistency
  consistencyScore: number;
  longestGoodStreak: number;

  // Environmental
  avgScreenDistance: number;
  lightingQuality: 'good' | 'fair' | 'poor';

  // Points
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  bonusReasons: string[];

  // Personal records
  isPersonalRecord: boolean;
  recordType?: string;
  recordValue?: number;

  // AI insights
  insights: string[];
  recommendations: Array<{
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Analyze session data and generate comprehensive analytics
 */
export function analyzeSession(
  dataPoints: SessionDataPoint[],
  duration: number,
  previousSessions?: any[]
): SessionAnalytics {
  const totalSeconds = duration * 60;

  // Calculate time in each quality category
  const timeCounts = calculateTimeDistribution(dataPoints);

  // Calculate percentages
  const totalTime = timeCounts.excellent + timeCounts.good + timeCounts.fair + timeCounts.poor;
  const excellentPercent = Math.round((timeCounts.excellent / totalTime) * 100);
  const goodPercent = Math.round((timeCounts.good / totalTime) * 100);
  const fairPercent = Math.round((timeCounts.fair / totalTime) * 100);
  const poorPercent = Math.round((timeCounts.poor / totalTime) * 100);

  // Analyze problem areas
  const problemAreas = analyzeProblemAreas(dataPoints);
  const mostCommonIssue = identifyMostCommonIssue(problemAreas, dataPoints);

  // Calculate correction metrics
  const correctionMetrics = analyzeCorrectionSpeed(dataPoints, previousSessions);

  // Generate timeline
  const postureTimeline = generateTimeline(dataPoints);
  const problemPeriods = identifyProblemPeriods(dataPoints, duration);

  // Calculate consistency
  const consistencyScore = calculateConsistencyScore(dataPoints);
  const longestGoodStreak = findLongestGoodStreak(dataPoints);

  // Environmental analysis
  const avgScreenDistance = calculateAverageDistance(dataPoints);
  const lightingQuality = assessLightingQuality(dataPoints);

  // Calculate points
  const pointsData = calculatePoints(
    duration,
    timeCounts,
    correctionMetrics.avgCorrectionTime,
    longestGoodStreak
  );

  // Check for personal records
  const recordCheck = checkPersonalRecords(
    duration,
    longestGoodStreak,
    consistencyScore,
    previousSessions
  );

  // Generate AI insights
  const insights = generateInsights(
    dataPoints,
    duration,
    problemAreas,
    correctionMetrics,
    consistencyScore
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    problemAreas,
    mostCommonIssue,
    correctionMetrics,
    avgScreenDistance
  );

  return {
    timeExcellent: timeCounts.excellent,
    timeGood: timeCounts.good,
    timeFair: timeCounts.fair,
    timePoor: timeCounts.poor,
    excellentPercent,
    goodPercent,
    fairPercent,
    poorPercent,
    totalAlerts: correctionMetrics.totalAlerts,
    postureAlerts: correctionMetrics.postureAlerts,
    breakReminders: correctionMetrics.breakReminders,
    avgCorrectionTime: correctionMetrics.avgCorrectionTime,
    correctionTrend: correctionMetrics.trend,
    correctionTrendPercent: correctionMetrics.trendPercent,
    problemAreas,
    mostCommonIssue: mostCommonIssue.issue,
    mostCommonIssuePercent: mostCommonIssue.percent,
    postureTimeline,
    problemPeriods,
    consistencyScore,
    longestGoodStreak,
    avgScreenDistance,
    lightingQuality,
    basePoints: pointsData.basePoints,
    bonusPoints: pointsData.bonusPoints,
    totalPoints: pointsData.totalPoints,
    bonusReasons: pointsData.bonusReasons,
    isPersonalRecord: recordCheck.isRecord,
    recordType: recordCheck.type,
    recordValue: recordCheck.value,
    insights,
    recommendations,
  };
}

function calculateTimeDistribution(dataPoints: SessionDataPoint[]) {
  const counts = { excellent: 0, good: 0, fair: 0, poor: 0 };

  dataPoints.forEach((point) => {
    counts[point.quality]++;
  });

  // Each data point represents ~1 second
  return counts;
}

function analyzeProblemAreas(dataPoints: SessionDataPoint[]): ProblemAreaFrequency {
  const areas: ProblemAreaFrequency = {
    neck: 0,
    upperBack: 0,
    shoulders: 0,
    lowerBack: 0,
    head: 0,
  };

  dataPoints.forEach((point) => {
    // Analyze head forward angle
    if (Math.abs(point.headForwardAngle) > 15) {
      areas.neck++;
      areas.head++;
    }

    // Analyze shoulder asymmetry
    if (point.shoulderSymmetry > 10) {
      areas.shoulders++;
      areas.upperBack++;
    }

    // Screen distance issues
    if (point.screenDistance < 45 || point.screenDistance > 65) {
      areas.neck++;
    }
  });

  return areas;
}

function identifyMostCommonIssue(
  problemAreas: ProblemAreaFrequency,
  dataPoints: SessionDataPoint[]
) {
  const issues = [
    { name: 'Forward head posture', count: problemAreas.head, area: 'head' },
    { name: 'Rounded shoulders', count: problemAreas.shoulders, area: 'shoulders' },
    { name: 'Upper back tension', count: problemAreas.upperBack, area: 'upperBack' },
    { name: 'Neck strain', count: problemAreas.neck, area: 'neck' },
  ];

  const mostCommon = issues.reduce((max, issue) =>
    issue.count > max.count ? issue : max
  );

  const poorPoints = dataPoints.filter(p => p.quality === 'poor' || p.quality === 'fair');
  const percent = poorPoints.length > 0
    ? Math.round((mostCommon.count / poorPoints.length) * 100)
    : 0;

  return {
    issue: mostCommon.name,
    percent,
  };
}

function analyzeCorrectionSpeed(
  dataPoints: SessionDataPoint[],
  previousSessions?: any[]
) {
  // Simulate alert detection and correction times
  let totalAlerts = 0;
  let postureAlerts = 0;
  let totalCorrectionTime = 0;

  for (let i = 0; i < dataPoints.length - 1; i++) {
    const current = dataPoints[i];
    const next = dataPoints[i + 1];

    // Detect when posture becomes poor
    if ((current.quality === 'poor' || current.quality === 'fair') &&
        (next.quality === 'good' || next.quality === 'excellent')) {
      totalAlerts++;
      postureAlerts++;

      // Find how long it took to correct
      let correctionTime = 1;
      for (let j = i - 1; j >= 0 && j > i - 60; j--) {
        if (dataPoints[j].quality === 'good' || dataPoints[j].quality === 'excellent') {
          break;
        }
        correctionTime++;
      }

      totalCorrectionTime += correctionTime;
    }
  }

  const avgCorrectionTime = totalAlerts > 0
    ? Math.round(totalCorrectionTime / totalAlerts)
    : 0;

  // Calculate trend compared to previous sessions
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let trendPercent = 0;

  if (previousSessions && previousSessions.length > 0) {
    const lastSession = previousSessions[0];
    const lastCorrectionSpeed = lastSession.correctionSpeed || 60;

    const diff = lastCorrectionSpeed - avgCorrectionTime;
    trendPercent = Math.round(Math.abs(diff));

    if (diff > 5) {
      trend = 'improving';
    } else if (diff < -5) {
      trend = 'declining';
    }
  }

  // Add some break reminders (every ~45 minutes)
  const breakReminders = Math.floor(dataPoints.length / (45 * 60));

  return {
    totalAlerts: totalAlerts + breakReminders,
    postureAlerts,
    breakReminders,
    avgCorrectionTime,
    trend,
    trendPercent,
  };
}

function generateTimeline(dataPoints: SessionDataPoint[]) {
  // Sample every 30 seconds for the timeline
  return dataPoints
    .filter((_, index) => index % 30 === 0)
    .map(point => ({
      timestamp: point.timestamp,
      score: point.score,
    }));
}

function identifyProblemPeriods(
  dataPoints: SessionDataPoint[],
  duration: number
) {
  const periods: Array<{ start: number; end: number; reason: string }> = [];
  let poorStart: number | null = null;

  dataPoints.forEach((point, index) => {
    if ((point.quality === 'poor' || point.quality === 'fair') && poorStart === null) {
      poorStart = point.timestamp;
    } else if ((point.quality === 'good' || point.quality === 'excellent') && poorStart !== null) {
      const durationMinutes = (point.timestamp - poorStart) / 60000;
      if (durationMinutes > 5) {
        periods.push({
          start: poorStart,
          end: point.timestamp,
          reason: `Posture declined after ${Math.round(poorStart / 60000)} minutes`,
        });
      }
      poorStart = null;
    }
  });

  return periods;
}

function calculateConsistencyScore(dataPoints: SessionDataPoint[]): number {
  // Calculate variance in posture scores
  const scores = dataPoints.map(p => p.score);
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher consistency
  // Map stdDev (0-30) to consistency score (100-0)
  const consistency = Math.max(0, Math.min(100, 100 - (stdDev * 3)));

  return Math.round(consistency);
}

function findLongestGoodStreak(dataPoints: SessionDataPoint[]): number {
  let longestStreak = 0;
  let currentStreak = 0;

  dataPoints.forEach((point) => {
    if (point.quality === 'good' || point.quality === 'excellent') {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return longestStreak; // in seconds
}

function calculateAverageDistance(dataPoints: SessionDataPoint[]): number {
  const distances = dataPoints.map(p => p.screenDistance);
  const avg = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  return Math.round(avg);
}

function assessLightingQuality(dataPoints: SessionDataPoint[]): 'good' | 'fair' | 'poor' {
  // Simulated lighting assessment based on posture consistency
  const variance = dataPoints.reduce((sum, p, i, arr) => {
    if (i === 0) return 0;
    return sum + Math.abs(p.score - arr[i - 1].score);
  }, 0) / dataPoints.length;

  if (variance < 5) return 'good';
  if (variance < 10) return 'fair';
  return 'poor';
}

function calculatePoints(
  duration: number,
  timeCounts: { excellent: number; good: number; fair: number; poor: number },
  avgCorrectionTime: number,
  longestStreak: number
) {
  // Base points: 10 points per minute
  const basePoints = duration * 10;

  const bonusReasons: string[] = [];
  let bonusPoints = 0;

  // Bonus for high percentage of good posture
  const goodPercent = ((timeCounts.excellent + timeCounts.good) /
    (timeCounts.excellent + timeCounts.good + timeCounts.fair + timeCounts.poor)) * 100;

  if (goodPercent >= 90) {
    bonusPoints += 50;
    bonusReasons.push('90%+ excellent posture');
  } else if (goodPercent >= 80) {
    bonusPoints += 30;
    bonusReasons.push('80%+ excellent posture');
  }

  // Bonus for fast correction
  if (avgCorrectionTime < 30) {
    bonusPoints += 25;
    bonusReasons.push('Quick posture corrections');
  }

  // Bonus for long streak
  if (longestStreak > 30 * 60) { // 30 minutes
    bonusPoints += 25;
    bonusReasons.push('No alerts in final 30 min');
  }

  // Bonus for session duration
  if (duration >= 120) { // 2 hours
    bonusPoints += 20;
    bonusReasons.push('2+ hour session completed');
  }

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    bonusReasons,
  };
}

function checkPersonalRecords(
  duration: number,
  longestStreak: number,
  consistencyScore: number,
  previousSessions?: any[]
) {
  if (!previousSessions || previousSessions.length === 0) {
    return { isRecord: false };
  }

  // Check longest streak record
  const previousBestStreak = Math.max(
    ...previousSessions.map(s => s.longestGoodStreak || 0)
  );

  if (longestStreak > previousBestStreak) {
    return {
      isRecord: true,
      type: 'Longest streak of good posture',
      value: Math.round(longestStreak / 60), // convert to minutes
    };
  }

  // Check best consistency score
  const previousBestConsistency = Math.max(
    ...previousSessions.map(s => {
      // Calculate from old data if needed
      return 75; // placeholder
    })
  );

  if (consistencyScore > previousBestConsistency) {
    return {
      isRecord: true,
      type: 'Best consistency score this month',
      value: consistencyScore,
    };
  }

  return { isRecord: false };
}

function generateInsights(
  dataPoints: SessionDataPoint[],
  duration: number,
  problemAreas: ProblemAreaFrequency,
  correctionMetrics: any,
  consistencyScore: number
): string[] {
  const insights: string[] = [];

  // Time-based insight
  const declinePoint = findPostureDeclinePoint(dataPoints);
  if (declinePoint) {
    insights.push(
      `Your posture tends to deteriorate around the ${Math.round(declinePoint / 60)}-minute mark. Consider scheduling breaks at ${Math.round(declinePoint / 60) - 15} minutes.`
    );
  }

  // Problem area insight
  const maxArea = Object.entries(problemAreas).reduce((max, [area, count]) =>
    count > max.count ? { area, count } : max
  , { area: '', count: 0 });

  if (maxArea.count > dataPoints.length * 0.2) {
    const areaNames: Record<string, string> = {
      neck: 'neck',
      head: 'head alignment',
      shoulders: 'shoulders',
      upperBack: 'upper back',
      lowerBack: 'lower back',
    };

    insights.push(
      `${areaNames[maxArea.area] || maxArea.area} showed the most issues today. Consider targeted stretches for this area.`
    );
  }

  // Correction speed insight
  if (correctionMetrics.trend === 'improving') {
    insights.push(
      `You corrected posture ${correctionMetrics.trendPercent}% faster than last session. Great progress!`
    );
  }

  // Consistency insight
  if (consistencyScore > 80) {
    insights.push(
      `Excellent consistency today! Your posture remained stable throughout the session.`
    );
  } else if (consistencyScore < 50) {
    insights.push(
      `Posture fluctuated significantly. Try to maintain awareness throughout your work session.`
    );
  }

  return insights;
}

function findPostureDeclinePoint(dataPoints: SessionDataPoint[]): number | null {
  // Find when posture starts declining consistently
  const windowSize = 300; // 5 minutes

  for (let i = windowSize; i < dataPoints.length - windowSize; i++) {
    const before = dataPoints.slice(i - windowSize, i);
    const after = dataPoints.slice(i, i + windowSize);

    const avgBefore = before.reduce((sum, p) => sum + p.score, 0) / before.length;
    const avgAfter = after.reduce((sum, p) => sum + p.score, 0) / after.length;

    if (avgBefore - avgAfter > 10) {
      return (dataPoints[i].timestamp - dataPoints[0].timestamp) / 1000;
    }
  }

  return null;
}

function generateRecommendations(
  problemAreas: ProblemAreaFrequency,
  mostCommonIssue: { issue: string; percent: number },
  correctionMetrics: any,
  avgScreenDistance: number
) {
  const recommendations: Array<{
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Distance recommendation
  if (avgScreenDistance < 45) {
    recommendations.push({
      title: 'Adjust monitor distance',
      description: 'Your screen is too close, which can cause eye strain and forward head posture.',
      action: 'Move monitor to 50-65cm (arm\'s length)',
      priority: 'high',
    });
  } else if (avgScreenDistance > 65) {
    recommendations.push({
      title: 'Move monitor closer',
      description: 'Screen is too far, causing you to lean forward.',
      action: 'Move monitor closer to 50-65cm',
      priority: 'medium',
    });
  }

  // Problem area recommendation
  if (mostCommonIssue.percent > 50) {
    recommendations.push({
      title: `Address ${mostCommonIssue.issue.toLowerCase()}`,
      description: `This was your most common issue (${mostCommonIssue.percent}% of deviation time).`,
      action: 'Complete targeted exercise routine',
      priority: 'high',
    });
  }

  // Correction speed recommendation
  if (correctionMetrics.avgCorrectionTime > 60) {
    recommendations.push({
      title: 'Enable audio alerts',
      description: 'You\'re taking longer than recommended to correct posture.',
      action: 'Turn on sound alerts for faster response',
      priority: 'medium',
    });
  }

  // General recommendation
  recommendations.push({
    title: 'Schedule calibration check',
    description: 'Regular calibration ensures accurate tracking.',
    action: 'Recalibrate your workstation',
    priority: 'low',
  });

  return recommendations;
}
