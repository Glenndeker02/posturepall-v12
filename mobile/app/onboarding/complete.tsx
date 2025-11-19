import { View, Text, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button } from '../../components'
import { theme } from '../../../shared/theme'

export default function OnboardingCompleteScreen() {
  const router = useRouter()

  const handleOpenWebapp = () => {
    // Open webapp in browser for calibration
    Linking.openURL('http://localhost:3000/onboarding/calibration')
  }

  const handleGoToDashboard = () => {
    router.replace('/')
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your profile is complete. Now let's calibrate your posture.
        </Text>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Next Steps</Text>

          <View style={styles.stepsList}>
            <StepItem
              number="1"
              title="Open Webapp for Calibration"
              description="Visit SpineMate on your desktop/laptop to calibrate your posture using the camera"
            />
            <StepItem
              number="2"
              title="Start Posture Tracking"
              description="Begin tracking sessions on the webapp while working"
            />
            <StepItem
              number="3"
              title="Monitor on Mobile"
              description="Check your posture score, stats, and progress on this app in real-time"
            />
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <Text style={styles.noticeText}>
              <Text style={styles.noticeTextBold}>Important:</Text> Posture tracking requires a webcam and works best on desktop/laptop. Use this mobile app to monitor your progress and complete exercises.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Open Webapp for Calibration"
            onPress={handleOpenWebapp}
            style={styles.primaryButton}
          />
          <Button
            title="I'll Do This Later"
            variant="outline"
            onPress={handleGoToDashboard}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Need help? Visit our{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('http://localhost:3000/help')}
          >
            Help Center
          </Text>
        </Text>
      </View>
    </LinearGradient>
  )
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[24],
    paddingBottom: theme.spacing[10],
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  successIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing[8],
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[8],
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[5],
  },
  stepsList: {
    gap: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  stepItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[1],
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    gap: theme.spacing[2],
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  noticeTextBold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  actions: {
    gap: theme.spacing[3],
  },
  primaryButton: {
    backgroundColor: theme.colors.background.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.background.primary,
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: theme.colors.background.primary,
  },
  helpText: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: theme.spacing[4],
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: theme.typography.fontWeight.semibold,
  },
})
