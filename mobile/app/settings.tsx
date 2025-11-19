import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Card, Modal, Button } from '../components'
import { useAppStore } from '../store'
import apiService from '../services/api'
import socketService from '../services/socket'

export default function SettingsScreen() {
  const router = useRouter()
  const { user, lastSyncTime, logout, syncData } = useAppStore()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Settings state
  const [breakReminders, setBreakReminders] = useState(true)
  const [achievementAlerts, setAchievementAlerts] = useState(true)
  const [quietHours, setQuietHours] = useState(false)

  const handleSync = async () => {
    if (!user) return

    try {
      setSyncing(true)
      await syncData()
      Alert.alert('Success', 'Data synced successfully')
    } catch (error) {
      console.error('Sync error:', error)
      Alert.alert('Error', 'Failed to sync data')
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = () => {
    socketService.disconnect()
    logout()
    setShowLogoutModal(false)
    router.replace('/')
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account Deleted',
      'Your account has been scheduled for deletion',
      [{ text: 'OK', onPress: () => router.replace('/') }]
    )
    setShowDeleteModal(false)
  }

  const handleRecalibrate = () => {
    Alert.alert(
      'Recalibrate Posture',
      'This will reset your posture baseline. Continue on the webapp to complete recalibration.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {} },
      ]
    )
  }

  const handleOpenLink = (url: string) => {
    Linking.openURL(url)
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Please sign in to access settings</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* User Profile */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email || 'No email'}</Text>
            </View>
          </View>
          <Button
            title="Edit Profile"
            variant="outline"
            size="md"
            onPress={() => Alert.alert('Info', 'Edit profile on the webapp')}
            style={styles.editButton}
          />
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Break Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified when it's time for a break
              </Text>
            </View>
            <Switch
              value={breakReminders}
              onValueChange={setBreakReminders}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={breakReminders ? '#4F46E5' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Achievement Alerts</Text>
              <Text style={styles.settingDescription}>
                Celebrate when you unlock achievements
              </Text>
            </View>
            <Switch
              value={achievementAlerts}
              onValueChange={setAchievementAlerts}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={achievementAlerts ? '#4F46E5' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Quiet Hours</Text>
              <Text style={styles.settingDescription}>
                Pause notifications during specified hours
              </Text>
            </View>
            <Switch
              value={quietHours}
              onValueChange={setQuietHours}
              trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
              thumbColor={quietHours ? '#4F46E5' : '#F3F4F6'}
            />
          </View>
        </Card>

        {/* Data & Sync */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Data & Sync</Text>

          <View style={styles.syncInfo}>
            <Text style={styles.syncLabel}>Last Sync</Text>
            <Text style={styles.syncValue}>
              {lastSyncTime
                ? new Date(lastSyncTime).toLocaleString()
                : 'Never synced'}
            </Text>
          </View>

          <Button
            title="Sync Now"
            variant="primary"
            size="md"
            onPress={handleSync}
            loading={syncing}
            style={styles.syncButton}
          />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sync Frequency</Text>
              <Text style={styles.settingDescription}>Every 5 minutes</Text>
            </View>
          </View>
        </Card>

        {/* Subscription */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Subscription</Text>

          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTier}>
              {user.subscriptionTier === 'premium' ? '⭐ Premium' : '🆓 Free'}
            </Text>
            <Text style={styles.subscriptionDescription}>
              {user.subscriptionTier === 'premium'
                ? 'You have access to all premium features'
                : 'Upgrade to unlock premium features'}
            </Text>
          </View>

          {user.subscriptionTier !== 'premium' && (
            <>
              <View style={styles.benefitsList}>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Unlimited posture tracking</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Advanced analytics</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>AI-powered recommendations</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Priority support</Text>
                </View>
              </View>

              <Button
                title="Upgrade to Premium"
                variant="primary"
                size="lg"
                onPress={() => Alert.alert('Info', 'Upgrade on the webapp')}
                style={styles.upgradeButton}
              />
            </>
          )}
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink('https://spinemate.com/privacy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink('https://spinemate.com/terms')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>App Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>

          <Button
            title="Recalibrate Posture"
            variant="outline"
            size="md"
            onPress={handleRecalibrate}
            style={styles.actionButton}
          />

          <Button
            title="Logout"
            variant="secondary"
            size="md"
            onPress={() => setShowLogoutModal(true)}
            style={styles.actionButton}
          />

          <Button
            title="Delete Account"
            variant="danger"
            size="md"
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionButton}
          />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
      >
        <Text style={styles.modalText}>Are you sure you want to logout?</Text>
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowLogoutModal(false)}
            style={styles.modalButton}
          />
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <Text style={styles.modalText}>
          This action cannot be undone. All your data will be permanently deleted.
        </Text>
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowDeleteModal(false)}
            style={styles.modalButton}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={handleDeleteAccount}
            style={styles.modalButton}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    width: '100%',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  syncInfo: {
    marginBottom: 16,
  },
  syncLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  syncValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  syncButton: {
    width: '100%',
    marginBottom: 16,
  },
  subscriptionInfo: {
    marginBottom: 16,
  },
  subscriptionTier: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subscriptionDescription: {
    fontSize: 16,
    color: '#6B7280',
  },
  benefitsList: {
    marginBottom: 16,
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
  },
  upgradeButton: {
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    fontSize: 16,
    color: '#4F46E5',
  },
  linkArrow: {
    fontSize: 20,
    color: '#4F46E5',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  versionLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButton: {
    width: '100%',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
})
