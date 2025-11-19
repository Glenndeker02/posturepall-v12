import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Button, Card } from '../../components'
import { authService } from '../../services/auth'
import { useAppStore } from '../../store'
import { theme } from '../../../shared/theme'

export default function LoginScreen() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError('')

    const result = await authService.signInWithEmail(email, password)

    if (result.success && result.user) {
      setUser(result.user)

      // Check if onboarding is complete
      const onboardingComplete = await authService.isOnboardingComplete()
      if (onboardingComplete) {
        router.replace('/')
      } else {
        router.replace('/onboarding/work-environment')
      }
    } else {
      setError(result.error || 'Login failed')
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const result = await authService.signInWithGoogle()

    if (result.success && result.user) {
      setUser(result.user)

      const onboardingComplete = await authService.isOnboardingComplete()
      if (onboardingComplete) {
        router.replace('/')
      } else {
        router.replace('/onboarding/work-environment')
      }
    } else {
      setError(result.error || 'Google sign-in failed')
    }

    setLoading(false)
  }

  const handleAppleLogin = async () {
    setLoading(true)
    setError('')

    const result = await authService.signInWithApple()

    if (result.success && result.user) {
      setUser(result.user)

      const onboardingComplete = await authService.isOnboardingComplete()
      if (onboardingComplete) {
        router.replace('/')
      } else {
        router.replace('/onboarding/work-environment')
      }
    } else {
      setError(result.error || 'Apple sign-in failed')
    }

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleEmailLogin}
            disabled={loading}
            loading={loading}
            style={styles.signInButton}
          />
        </Card>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.socialButtonIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={theme.borderRadius.md}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            disabled={loading}
          >
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    padding: theme.spacing[6],
    paddingTop: theme.spacing[16],
  },
  header: {
    marginBottom: theme.spacing[8],
  },
  backButton: {
    marginBottom: theme.spacing[6],
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  formCard: {
    marginBottom: theme.spacing[6],
  },
  errorContainer: {
    backgroundColor: theme.colors.danger[50],
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[4],
  },
  errorText: {
    color: theme.colors.danger[700],
    fontSize: theme.typography.fontSize.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  forgotPassword: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'right',
    marginBottom: theme.spacing[6],
  },
  signInButton: {
    marginTop: theme.spacing[2],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.medium,
  },
  dividerText: {
    marginHorizontal: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  socialButtons: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    ...theme.shadows.sm,
  },
  socialButtonIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing[3],
  },
  socialButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  appleButton: {
    height: 48,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  signUpLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
})
