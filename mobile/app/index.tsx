import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../store'
import { useEffect, useState } from 'react'
import socketService from '../services/socket'
import apiService from '../services/api'
import { authService } from '../services/auth'

const { width } = Dimensions.get('window')

export default function HomeScreen() {
  const router = useRouter()
  const { user, isAuthenticated, deviceId, currentPosture, analytics } = useAppStore()
  const [streak, setStreak] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check authentication and onboarding status on mount
    async function checkAuthStatus() {
      const authenticated = await authService.isAuthenticated()
      if (!authenticated) {
        router.replace('/auth/welcome')
        return
      }

      const onboardingComplete = await authService.isOnboardingComplete()
      if (!onboardingComplete) {
        router.replace('/onboarding/work-environment')
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isAuthenticated && user && deviceId) {
      // Connect to WebSocket
      if (!socketService.isConnected()) {
        socketService.connect(user.id, deviceId)
      }

      // Fetch analytics
      fetchAnalytics()
    }
  }, [isAuthenticated, user, deviceId])

  useEffect(() => {
    // Listen for posture updates
    const cleanup = socketService.on('posture-data', (data: any) => {
      useAppStore.getState().updatePosture(data)
    })

    return cleanup
  }, [])

  const fetchAnalytics = async () => {
    if (!user) return
    try {
      useAppStore.getState().setAnalyticsLoading(true)
      const { analytics } = await apiService.getAnalytics(user.id, 'week')
      useAppStore.getState().setAnalytics(analytics)
      setStreak(analytics.summary.currentStreak)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      useAppStore.getState().setAnalyticsLoading(false)
    }
  }

  const score = currentPosture?.score || analytics?.summary.averageScore || 0
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.gradient}
        >
          <View style={styles.centeredContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>SpineMate</Text>
            </View>

            <Text style={styles.welcomeTitle}>Welcome to SpineMate</Text>
            <Text style={styles.welcomeSubtitle}>
              Monitor your posture and build healthy habits
            </Text>

            <TouchableOpacity
              style={styles.pairButton}
              onPress={() => router.push('/pairing')}
            >
              <Text style={styles.pairButtonText}>📷 Scan QR to Connect</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Open SpineMate on your computer to get started
            </Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Here's your posture summary</Text>
      </LinearGradient>

      {/* Posture Score Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Posture Score</Text>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{Math.round(score)}%</Text>
            <Text style={styles.scoreLabel}>Good Posture</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.statValue}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={styles.statValue}>
            {analytics?.summary.totalSessions || 0}
          </Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.statValue}>
            {analytics?.summary.completedBreaks || 0}
          </Text>
          <Text style={styles.statLabel}>Breaks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E9D5FF' }]}>
          <Text style={styles.statValue}>
            {Math.round((analytics?.summary.totalDuration || 0) / 60)}h
          </Text>
          <Text style={styles.statLabel}>Active Time</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Link href="/analytics" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/exercises" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionText}>Exercises</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.actionButton} onPress={fetchAnalytics}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Refresh</Text>
          </TouchableOpacity>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Connection Status */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <View style={styles.connectionRow}>
          <View style={[styles.statusDot, { backgroundColor: socketService.isConnected() ? '#10b981' : '#ef4444' }]} />
          <Text style={styles.connectionText}>
            {socketService.isConnected() ? 'Connected to Webapp' : 'Disconnected'}
          </Text>
        </View>
      </View>
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
  gradient: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  pairButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pairButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scoreRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    margin: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 72) / 2,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#6B7280',
  },
})
