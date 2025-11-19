import { View, Text, StyleSheet, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Button } from '../../components'
import { theme } from '../../../shared/theme'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <LinearGradient
      colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Branding */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧘</Text>
          <Text style={styles.logoText}>SpineMate</Text>
          <Text style={styles.tagline}>Your AI Posture Coach</Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <FeatureItem icon="📊" text="Track your posture in real-time" />
          <FeatureItem icon="💪" text="Personalized exercise recommendations" />
          <FeatureItem icon="🏆" text="Achieve goals and earn rewards" />
          <FeatureItem icon="📱" text="Sync seamlessly across devices" />
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth/signup')}
            style={styles.primaryButton}
          />
          <Button
            title="I already have an account"
            variant="outline"
            onPress={() => router.push('/auth/login')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </LinearGradient>
  )
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[12],
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: theme.spacing[4],
  },
  logoText: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  features: {
    gap: theme.spacing[4],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: theme.spacing[3],
  },
  featureText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    flex: 1,
    fontWeight: theme.typography.fontWeight.medium,
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
  terms: {
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
