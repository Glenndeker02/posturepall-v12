/**
 * Session Summary Component
 * Comprehensive post-session analysis with visualizations and insights
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart } from '@/components/charts/pie-chart';
import { GaugeChart } from '@/components/charts/gauge-chart';
import { BodyHeatmap } from '@/components/charts/body-heatmap';
import { LineChart } from '@/components/charts/line-chart';
import type { SessionAnalytics } from '@/lib/analytics/session-analytics';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Share2,
  Download,
  Play,
  Target,
  Award,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SessionSummaryProps {
  analytics: SessionAnalytics;
  duration: number; // in minutes
  onClose: () => void;
  onStartNew?: () => void;
  onViewDashboard?: () => void;
  onDoExercises?: () => void;
  className?: string;
}

export function SessionSummary({
  analytics,
  duration,
  onClose,
  onStartNew,
  onViewDashboard,
  onDoExercises,
  className = '',
}: SessionSummaryProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins > 0) {
      return `${mins}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto ${className}`}>
      <div className="max-w-6xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl my-8">
        {/* Header */}
        <div className="relative border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 rounded-t-lg">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Session Complete!</h1>
            <p className="text-lg text-muted-foreground">
              Great work! Here's how you did.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Overall Score */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {Math.round((analytics.excellentPercent + analytics.goodPercent) / 2)}
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="text-2xl font-bold">{formatTime(duration)}</div>
                </div>
                <div className="text-sm text-muted-foreground">Session Time</div>
              </CardContent>
            </Card>

            {/* Points Earned */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">
                    +{analytics.totalPoints}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Points</div>
                {analytics.bonusPoints > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +{analytics.bonusPoints} bonus
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="text-2xl font-bold">{analytics.totalAlerts}</div>
                </div>
                <div className="text-sm text-muted-foreground">Alerts</div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Record */}
          {analytics.isPersonalRecord && (
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="font-bold text-lg">New Personal Record!</div>
                    <div className="text-sm text-muted-foreground">
                      {analytics.recordType}: {analytics.recordValue}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Deviation Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Posture Quality Distribution</CardTitle>
                <CardDescription>Time spent in each category</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={[
                    {
                      label: 'Excellent',
                      value: analytics.excellentPercent,
                      color: '#10b981',
                    },
                    {
                      label: 'Good',
                      value: analytics.goodPercent,
                      color: '#84cc16',
                    },
                    {
                      label: 'Fair',
                      value: analytics.fairPercent,
                      color: '#f59e0b',
                    },
                    {
                      label: 'Poor',
                      value: analytics.poorPercent,
                      color: '#ef4444',
                    },
                  ]}
                />
                {analytics.mostCommonIssue && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Most Common Issue
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      {analytics.mostCommonIssue} detected {analytics.mostCommonIssuePercent}% of deviation time
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Correction Response Time */}
            <Card>
              <CardHeader>
                <CardTitle>Correction Response Time</CardTitle>
                <CardDescription>How quickly you fix poor posture</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <GaugeChart
                  value={analytics.avgCorrectionTime}
                  max={120}
                  label="Average Correction Time"
                  unit="s"
                  target={60}
                />
                {analytics.correctionTrend !== 'stable' && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    {analytics.correctionTrend === 'improving' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          {analytics.correctionTrendPercent}s faster than last week
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {analytics.correctionTrendPercent}s slower than last week
                        </span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alert Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{analytics.postureAlerts}</div>
                  <div className="text-sm text-muted-foreground">Posture Corrections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.breakReminders}</div>
                  <div className="text-sm text-muted-foreground">Break Reminders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.totalAlerts}</div>
                  <div className="text-sm text-muted-foreground">Total Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consistency Score & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Posture Consistency</CardTitle>
              <CardDescription>How stable your posture was throughout the session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Consistency Score</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {analytics.consistencyScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${analytics.consistencyScore}%` }}
                  />
                </div>
              </div>

              <LineChart data={analytics.postureTimeline} height={180} />

              {analytics.problemPeriods.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Notable Patterns:</div>
                  {analytics.problemPeriods.slice(0, 2).map((period, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      {period.reason}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Problem Areas Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Areas Analysis</CardTitle>
              <CardDescription>Body areas that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <BodyHeatmap problemAreas={analytics.problemAreas} />
            </CardContent>
          </Card>

          {/* Bonus Points */}
          {analytics.bonusPoints > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Bonus Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-4">
                  +{analytics.bonusPoints} Points
                </div>
                <ul className="space-y-2">
                  {analytics.bonusReasons.map((reason, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {analytics.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analytics.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-sm"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Recommendations */}
          {analytics.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Based on your session data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high'
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : rec.priority === 'medium'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{rec.title}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {rec.description}
                          </div>
                          <div className="text-sm font-medium text-indigo-600">
                            → {rec.action}
                          </div>
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              {showShareOptions && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Share to:</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      Instagram
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            {onStartNew && (
              <Button onClick={onStartNew} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Another Session
              </Button>
            )}
            {onDoExercises && (
              <Button onClick={onDoExercises} variant="outline" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Do Recommended Exercises
              </Button>
            )}
            {onViewDashboard && (
              <Button onClick={onViewDashboard} variant="outline" className="flex-1">
                View Progress Dashboard
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button onClick={onClose} variant="ghost">
              Done for Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
