import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import {
  Card,
  StatCard,
  ChartComponent,
  LoadingSpinner,
  EmptyState,
  Badge,
} from '../components'
import { useAppStore } from '../store'
import apiService from '../services/api'

const { width } = Dimensions.get('window')

type TimeRange = 'week' | 'month' | 'quarter' | 'year'

export default function AnalyticsScreen() {
  const router = useRouter()
  const { user, analytics, setAnalytics, setAnalyticsLoading, analyticsLoading } = useAppStore()
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    if (!user) return
    try {
      setAnalyticsLoading(true)
      const { analytics: data } = await apiService.getAnalytics(user.id, timeRange)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const handleExport = async () => {
    try {
      const message = `My SpineMate Analytics (${timeRange})\n\n` +
        `Average Posture Score: ${Math.round(analytics?.summary.averageScore || 0)}%\n` +
        `Total Sessions: ${analytics?.summary.totalSessions || 0}\n` +
        `Active Time: ${Math.round((analytics?.summary.totalDuration || 0) / 60)}h\n` +
        `Completed Breaks: ${analytics?.summary.completedBreaks || 0}\n` +
        `Current Streak: ${analytics?.summary.currentStreak || 0} days`

      await Share.share({
        message,
        title: 'SpineMate Analytics',
      })
    } catch (error) {
      console.error('Failed to share analytics:', error)
    }
  }

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case 'week':
        return 'Week'
      case 'month':
        return 'Month'
      case 'quarter':
        return 'Quarter'
      case 'year':
        return 'Year'
    }
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🔐"
          title="Not Authenticated"
          description="Please pair your device first"
          actionText="Go to Home"
          onAction={() => router.replace('/')}
        />
      </View>
    )
  }

  if (analyticsLoading && !analytics) {
    return <LoadingSpinner fullScreen text="Loading analytics..." />
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📊"
          title="No Analytics Data"
          description="Start tracking your posture to see analytics"
          actionText="Refresh"
          onAction={fetchAnalytics}
        />
      </View>
    )
  }

  // Prepare chart data
  const chartData = {
    labels: analytics.dailyData.map(d => {
      const date = new Date(d.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        data: analytics.dailyData.map(d => d.averageScore),
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>📤 Export</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Track your posture progress</Text>
      </LinearGradient>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
              ]}
            >
              {getTimeRangeLabel(range)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <StatCard
          label="Average Score"
          value={`${Math.round(analytics.summary.averageScore)}%`}
          icon="🎯"
          color="#DBEAFE"
          style={styles.summaryCard}
        />
        <StatCard
          label="Active Time"
          value={`${Math.round(analytics.summary.totalDuration / 60)}h`}
          icon="⏱️"
          color="#D1FAE5"
          style={styles.summaryCard}
        />
        <StatCard
          label="Breaks"
          value={analytics.summary.completedBreaks}
          icon="☕"
          color="#FEF3C7"
          style={styles.summaryCard}
        />
        <StatCard
          label="Streak"
          value={`${analytics.summary.currentStreak} days`}
          icon="🔥"
          color="#FEE2E2"
          style={styles.summaryCard}
        />
      </View>

      {/* Posture Score Trend */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Posture Score Trend</Text>
        <ChartComponent type="line" data={chartData} bezier />
      </Card>

      {/* Problem Areas */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Problem Areas</Text>
        <View style={styles.problemAreasList}>
          {analytics.problemAreas.map((area, index) => (
            <View key={index} style={styles.problemAreaRow}>
              <View style={styles.problemAreaInfo}>
                <Text style={styles.problemAreaName}>{area.area}</Text>
                <Text style={styles.problemAreaPercentage}>{area.percentage}%</Text>
              </View>
              <View style={styles.problemAreaBar}>
                <View
                  style={[
                    styles.problemAreaBarFill,
                    {
                      width: `${area.percentage}%`,
                      backgroundColor:
                        area.percentage > 30
                          ? '#EF4444'
                          : area.percentage > 15
                          ? '#F59E0B'
                          : '#10B981',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Recent Sessions */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Recent Sessions</Text>
        {analytics.recentSessions.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No sessions yet"
            description="Start tracking to see your sessions"
          />
        ) : (
          <View style={styles.sessionsList}>
            {analytics.recentSessions.map((session, index) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.startTime).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {session.endTime
                      ? new Date(session.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'In Progress'}
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <Badge
                    text={`${Math.round(session.averageScore)}%`}
                    variant={
                      session.averageScore >= 80
                        ? 'success'
                        : session.averageScore >= 60
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  />
                  <Text style={styles.sessionDuration}>
                    {Math.round(session.duration / 60)} min
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* AI Insights */}
      {analytics.summary.averageScore < 70 && (
        <Card style={[styles.card, styles.insightsCard]}>
          <Text style={styles.insightsIcon}>💡</Text>
          <Text style={styles.insightsTitle}>AI Insights</Text>
          <Text style={styles.insightsText}>
            Your average posture score is below target. Consider taking more
            breaks and doing recommended exercises to improve your posture.
          </Text>
        </Card>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: (width - 48) / 2,
    margin: 4,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  problemAreasList: {
    gap: 16,
  },
  problemAreaRow: {
    gap: 8,
  },
  problemAreaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  problemAreaName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  problemAreaPercentage: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  problemAreaBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  problemAreaBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sessionsList: {
    gap: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  insightsCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  insightsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 16,
    color: '#1E40AF',
    lineHeight: 24,
  },
})
