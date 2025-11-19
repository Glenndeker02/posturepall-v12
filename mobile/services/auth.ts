import * as AppleAuthentication from 'expo-apple-authentication'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiService from './api'

WebBrowser.maybeCompleteAuthSession()

interface User {
  id: string
  email?: string
  name?: string
  image?: string
  provider: 'email' | 'google' | 'apple'
  accessToken?: string
}

interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

class AuthService {
  private currentUser: User | null = null

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    try {
      // Call backend API to create user
      const response = await apiService.client.post('/auth/mobile/signup', {
        email,
        password,
        name,
      })

      if (response.data.success) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          image: response.data.user.image,
          provider: 'email',
          accessToken: response.data.accessToken,
        }

        await this.saveUserSession(user)
        this.currentUser = user

        return { success: true, user }
      }

      return { success: false, error: response.data.error || 'Signup failed' }
    } catch (error: any) {
      console.error('Email signup error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred during signup',
      }
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.client.post('/auth/mobile/login', {
        email,
        password,
      })

      if (response.data.success) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          image: response.data.user.image,
          provider: 'email',
          accessToken: response.data.accessToken,
        }

        await this.saveUserSession(user)
        this.currentUser = user

        return { success: true, user }
      }

      return { success: false, error: response.data.error || 'Login failed' }
    } catch (error: any) {
      console.error('Email login error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid email or password',
      }
    }
  }

  /**
   * Sign in with Google
   * Note: This requires Google OAuth client IDs to be configured
   * Set GOOGLE_CLIENT_ID in your app.config.js or environment
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      // For now, return a message that Google OAuth needs to be configured
      // In a real implementation, you would:
      // 1. Create OAuth request with proper client IDs
      // 2. Use AuthSession.startAsync() or WebBrowser.openAuthSessionAsync()
      // 3. Get the access token
      // 4. Fetch user info from Google
      // 5. Send to backend

      return {
        success: false,
        error: 'Google OAuth is not yet configured. Please set up Google OAuth client IDs in your app configuration.',
      }

      // Example implementation (requires configuration):
      /*
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true })
      const clientId = 'YOUR_GOOGLE_CLIENT_ID'

      const result = await AuthSession.startAsync({
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=token&` +
          `scope=openid%20profile%20email`,
      })

      if (result.type === 'success' && result.params.access_token) {
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${result.params.access_token}` },
          }
        )

        const googleUser = await userInfoResponse.json()

        const response = await apiService.client.post('/auth/mobile/oauth', {
          provider: 'google',
          providerId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          accessToken: result.params.access_token,
        })

        if (response.data.success) {
          const user: User = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            image: response.data.user.image,
            provider: 'google',
            accessToken: result.params.access_token,
          }

          await this.saveUserSession(user)
          this.currentUser = user

          return { success: true, user }
        }
      }

      return { success: false, error: 'Google sign-in was cancelled' }
      */
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      return {
        success: false,
        error: 'Failed to sign in with Google',
      }
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthResponse> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      // Send to backend to create/update user
      const response = await apiService.client.post('/auth/mobile/oauth', {
        provider: 'apple',
        providerId: credential.user,
        email: credential.email,
        name: credential.fullName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : undefined,
        identityToken: credential.identityToken,
      })

      if (response.data.success) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          image: response.data.user.image,
          provider: 'apple',
        }

        await this.saveUserSession(user)
        this.currentUser = user

        return { success: true, user }
      }

      return { success: false, error: 'Apple sign-in failed' }
    } catch (error: any) {
      console.error('Apple sign-in error:', error)

      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'Apple sign-in was cancelled' }
      }

      return {
        success: false,
        error: 'Failed to sign in with Apple',
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'onboardingComplete'])
      this.currentUser = null
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await AsyncStorage.getItem('user')
      return user !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Save user session to AsyncStorage
   */
  private async saveUserSession(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user))
      if (user.accessToken) {
        await AsyncStorage.setItem('accessToken', user.accessToken)
      }
    } catch (error) {
      console.error('Error saving user session:', error)
    }
  }

  /**
   * Load user session from AsyncStorage
   */
  async loadUserSession(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user')
      if (userJson) {
        this.currentUser = JSON.parse(userJson)
        return this.currentUser
      }
      return null
    } catch (error) {
      console.error('Error loading user session:', error)
      return null
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const complete = await AsyncStorage.getItem('onboardingComplete')
      return complete === 'true'
    } catch (error) {
      return false
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true')
    } catch (error) {
      console.error('Error marking onboarding complete:', error)
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiService.client.post('/auth/reset-password', {
        email,
      })

      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset email',
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Helper functions
export async function signInWithEmail(email: string, password: string) {
  return authService.signInWithEmail(email, password)
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  return authService.signUpWithEmail(email, password, name)
}

export async function signInWithGoogle() {
  return authService.signInWithGoogle()
}

export async function signInWithApple() {
  return authService.signInWithApple()
}

export async function signOut() {
  return authService.signOut()
}
