import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface NotificationData {
  title: string
  body: string
  data?: any
}

class NotificationService {
  private expoPushToken: string | null = null

  /**
   * Initialize notification service and request permissions
   */
  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted')
        return null
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with actual Expo project ID
        })
        this.expoPushToken = token.data
        await AsyncStorage.setItem('pushToken', token.data)
        console.log('Push token:', token.data)
        return token.data
      } else {
        console.warn('Must use physical device for Push Notifications')
        return null
      }
    } catch (error) {
      console.error('Error initializing notifications:', error)
      return null
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    triggerSeconds: number = 5
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: triggerSeconds,
        },
      })
      return id
    } catch (error) {
      console.error('Error scheduling notification:', error)
      return null
    }
  }

  /**
   * Schedule a break reminder notification
   */
  async scheduleBreakReminder(minutes: number = 30) {
    return this.scheduleNotification(
      'Time for a Break! ☕',
      `You've been working for ${minutes} minutes. Take a posture break to refresh!`,
      { type: 'break-reminder' },
      minutes * 60
    )
  }

  /**
   * Send achievement unlocked notification
   */
  async notifyAchievementUnlocked(achievementName: string, points: number) {
    return this.scheduleNotification(
      '🏆 Achievement Unlocked!',
      `${achievementName} - You earned ${points} points!`,
      { type: 'achievement', name: achievementName, points },
      1
    )
  }

  /**
   * Send posture alert notification
   */
  async notifyPostureAlert(score: number) {
    if (score < 60) {
      return this.scheduleNotification(
        '⚠️ Posture Alert',
        `Your posture score is ${score}%. Time to sit up straight!`,
        { type: 'posture-alert', score },
        1
      )
    }
    return null
  }

  /**
   * Send streak reminder notification
   */
  async notifyStreakAtRisk() {
    return this.scheduleNotification(
      '🔥 Don\'t Break Your Streak!',
      'You haven\'t tracked your posture today. Keep your streak alive!',
      { type: 'streak-reminder' },
      1
    )
  }

  /**
   * Send goal progress notification
   */
  async notifyGoalProgress(goalName: string, progress: number) {
    if (progress >= 100) {
      return this.scheduleNotification(
        '🎯 Goal Achieved!',
        `Congratulations! You've completed: ${goalName}`,
        { type: 'goal-complete', name: goalName },
        1
      )
    } else if (progress >= 75) {
      return this.scheduleNotification(
        '🎯 Almost There!',
        `You're ${progress}% of the way to completing: ${goalName}`,
        { type: 'goal-progress', name: goalName, progress },
        1
      )
    }
    return null
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      console.error('Error canceling notification:', error)
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Error canceling all notifications:', error)
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Error getting scheduled notifications:', error)
      return []
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for notifications received while app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener(onNotificationReceived)

    // Listener for user tapping on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped)

    return () => {
      Notifications.removeNotificationSubscription(receivedListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number) {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count)
    }
  }

  /**
   * Clear badge count (iOS)
   */
  async clearBadge() {
    await this.setBadgeCount(0)
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Helper functions
export async function initializeNotifications() {
  return notificationService.initialize()
}

export async function scheduleBreakReminder(minutes: number = 30) {
  return notificationService.scheduleBreakReminder(minutes)
}

export async function notifyAchievement(name: string, points: number) {
  return notificationService.notifyAchievementUnlocked(name, points)
}

export async function notifyPostureAlert(score: number) {
  return notificationService.notifyPostureAlert(score)
}

export async function notifyStreakAtRisk() {
  return notificationService.notifyStreakAtRisk()
}
