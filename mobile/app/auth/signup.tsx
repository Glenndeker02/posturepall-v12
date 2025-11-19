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
} from 'react-native'
import { useRouter } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Button, Card } from '../../components'
import { authService } from '../../services/auth'
import { useAppStore } from '../../store'
import { theme } from '../../../shared/theme'

export default function SignUpScreen() {
  const router = useRouter()
  const setUser = useAppStore((state) => state.setUser)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return false
    }

    if (!email.trim()) {
      setError('Please enter your email')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!password) {
      setError('Please enter a password')
      return false
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleEmailSignUp = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    const result = await authService.signUpWithEmail(email, password, name)

    if (result.success && result.user) {
      setUser(result.user)
      // After signup, go to onboarding
      router.replace('/onboarding/work-environment')
    } else {
      setError(result.error || 'Sign up failed')
    }

    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    const result = await authService.signInWithGoogle()

    if (result.success && result.user) {
      setUser(result.user)
      router.replace('/onboarding/work-environment')
    } else {
      setError(result.error || 'Google sign-up failed')
    }

    setLoading(false)
  }

  const handleAppleSignUp = async () => {
    setLoading(true)
    setError('')

    const result = await authService.signInWithApple()

    if (result.success && result.user) {
      setUser(result.user)
      router.replace('/onboarding/work-environment')
    } else {
      setError(result.error || 'Apple sign-up failed')
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SpineMate to improve your posture</Text>
        </View>

        {/* Sign Up Form */}
        <Card style={styles.formCard}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

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
              placeholder="Create a password (min 8 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            title={loading ? 'Creating account...' : 'Sign Up'}
            onPress={handleEmailSignUp}
            disabled={loading}
            loading={loading}
            style={styles.signUpButton}
          />
        </Card>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Sign Up */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignUp}
            disabled={loading}
          >
            <Text style={styles.socialButtonIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={theme.borderRadius.md}
              style={styles.appleButton}
              onPress={handleAppleSignUp}
            />
          )}
        </View>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            disabled={loading}
          >
            <Text style={styles.signInLink}>Sign In</Text>
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
  signUpButton: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  signInLink: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
})
