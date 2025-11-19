# OAuth Configuration Guide

This guide explains how to set up Google and Apple OAuth authentication for both the SpineMate webapp and mobile app.

## Overview

SpineMate supports three authentication methods:
1. **Email/Password** - Direct authentication (fully configured ✓)
2. **Google OAuth** - Sign in with Google (requires configuration)
3. **Apple Sign In** - Sign in with Apple ID (requires configuration)

## ✅ What's Already Working

### Email/Password Authentication
- **Backend**: API endpoints at `/api/auth/mobile/signup` and `/api/auth/mobile/login`
- **Mobile**: Full authentication flow with validation
- **Webapp**: Full authentication flow with validation
- **Security**: Bcrypt password hashing (10 salt rounds)
- **Sessions**: 30-day session token expiry

## 🔧 Google OAuth Setup

### Prerequisites
- Google Cloud Console account
- Admin access to your project

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the **Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure the OAuth consent screen if prompted

### Step 2: Configure OAuth Clients

You'll need separate client IDs for:
- Web Application (webapp)
- iOS Application (mobile iOS)
- Android Application (mobile Android)

#### Web Application
1. Application type: **Web application**
2. Name: `SpineMate Web`
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

#### iOS Application
1. Application type: **iOS**
2. Name: `SpineMate iOS`
3. Bundle ID: Your iOS app's bundle identifier (e.g., `com.yourcompany.spinemate`)

#### Android Application
1. Application type: **Android**
2. Name: `SpineMate Android`
3. Package name: Your Android app's package name
4. SHA-1 certificate fingerprint:
   ```bash
   # Get debug keystore fingerprint
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

### Step 3: Update Environment Variables (Webapp)

Create or update `.env.local` in the project root:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-web-client-secret

# Apple OAuth (if configuring)
APPLE_CLIENT_ID=com.yourcompany.spinemate
APPLE_CLIENT_SECRET=your-apple-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-string
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Update Mobile App Configuration

Edit `/mobile/app.config.js` (create if doesn't exist):

```javascript
export default {
  expo: {
    name: "SpineMate",
    slug: "spinemate",
    extra: {
      googleClientId: {
        ios: "your-ios-client-id.apps.googleusercontent.com",
        android: "your-android-client-id.apps.googleusercontent.com",
        web: "your-web-client-id.apps.googleusercontent.com"
      }
    },
    ios: {
      bundleIdentifier: "com.yourcompany.spinemate",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      package: "com.yourcompany.spinemate",
      googleServicesFile: "./google-services.json"
    }
  }
}
```

### Step 5: Enable Google OAuth in Mobile Code

Update `/mobile/services/auth.ts` - uncomment the Google OAuth implementation:

```typescript
async signInWithGoogle(): Promise<AuthResponse> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true })
    const clientId = 'YOUR_GOOGLE_CLIENT_ID' // Replace with actual client ID

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
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    return {
      success: false,
      error: 'Failed to sign in with Google',
    }
  }
}
```

## 🍎 Apple Sign In Setup

### Prerequisites
- Apple Developer account ($99/year)
- App ID configured in Apple Developer Portal

### Step 1: Configure App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Select "Identifiers" > "App IDs"
4. Create or edit your App ID
5. Enable "Sign In with Apple" capability

### Step 2: Create Service ID (for Webapp)

1. In Apple Developer Portal, go to "Identifiers"
2. Click "+" > "Services IDs"
3. Register a Service ID (e.g., `com.yourcompany.spinemate.web`)
4. Enable "Sign In with Apple"
5. Configure domains and return URLs:
   - Domains: `yourdomain.com`, `localhost`
   - Return URLs: `https://yourdomain.com/api/auth/callback/apple`

### Step 3: Create Private Key

1. In Apple Developer Portal, go to "Keys"
2. Create a new key with "Sign In with Apple" enabled
3. Download the `.p8` key file (you can only download once!)
4. Note the Key ID

### Step 4: Generate Client Secret (for Webapp)

Apple requires a JWT token as the client secret. Use this Node.js script:

```javascript
// generate-apple-secret.js
const jwt = require('jsonwebtoken')
const fs = require('fs')

const privateKey = fs.readFileSync('./AuthKey_XXXXXXXXXX.p8') // Your .p8 file
const teamId = 'YOUR_TEAM_ID' // 10-character Team ID
const clientId = 'com.yourcompany.spinemate.web' // Your Service ID
const keyId = 'YOUR_KEY_ID' // From the key you created

const token = jwt.sign(
  {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 180 days
    aud: 'https://appleid.apple.com',
    sub: clientId,
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  }
)

console.log(token)
```

Run: `node generate-apple-secret.js`

### Step 5: Update Environment Variables

Add to `.env.local`:

```env
APPLE_CLIENT_ID=com.yourcompany.spinemate.web
APPLE_CLIENT_SECRET=<generated-jwt-token>
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
```

### Step 6: Configure Mobile App

Apple Sign In works out of the box on iOS with the `expo-apple-authentication` package. Just ensure:

1. Your app's bundle ID matches the App ID in Apple Developer Portal
2. "Sign In with Apple" capability is enabled in your provisioning profile

## 📱 Mobile App Configuration Files

### iOS: GoogleService-Info.plist

Download from Firebase Console (if using Firebase) or Google Cloud Console.

Place at: `/mobile/GoogleService-Info.plist`

### Android: google-services.json

Download from Firebase Console (if using Firebase) or Google Cloud Console.

Place at: `/mobile/google-services.json`

## 🧪 Testing Authentication

### Test Email/Password (Ready Now)

**Webapp:**
1. Navigate to `http://localhost:3000/auth`
2. Click "Sign Up" tab
3. Fill in name, email, password
4. Submit form
5. You'll be redirected to `/onboarding`

**Mobile:**
1. Launch the mobile app
2. Click "Get Started" on welcome screen
3. Click "Sign Up"
4. Fill in form and submit
5. Complete onboarding flow

### Test Google OAuth (After Configuration)

**Webapp:**
1. Navigate to `http://localhost:3000/auth`
2. Click "Google" button
3. Sign in with Google account
4. Authorize the app
5. You'll be redirected to `/dashboard`

**Mobile:**
1. Click "Continue with Google" on signup/login screen
2. Follow Google sign-in flow
3. App will create/link your account

### Test Apple Sign In (After Configuration)

**Webapp:**
1. Navigate to `http://localhost:3000/auth`
2. Click "Apple" button
3. Sign in with Apple ID
4. Choose to share or hide email
5. You'll be redirected to `/dashboard`

**Mobile (iOS only):**
1. Click Apple Sign In button
2. Use Face ID/Touch ID or password
3. App will create/link your account

## 🔒 Security Considerations

### Current Implementation

✅ **Implemented:**
- Bcrypt password hashing (10 rounds)
- Session tokens with 30-day expiry
- Email validation with regex
- Password minimum length (8 characters)
- Password confirmation matching
- Expired session cleanup
- Account linking for OAuth providers

### Recommendations

🔐 **Additional Security Measures** (optional):
- Add rate limiting to login endpoints
- Implement CSRF tokens
- Add email verification for email/password signups
- Enable 2FA for high-security users
- Add refresh token rotation
- Implement device fingerprinting
- Add IP-based rate limiting
- Monitor for suspicious login patterns

## 🐛 Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Ensure the redirect URI in your code matches exactly what's configured in Google Cloud Console
- Check for trailing slashes
- Verify http vs https

**Error: "invalid_client"**
- Double-check your client ID and client secret
- Ensure the OAuth consent screen is published (not in testing mode) for production

**Mobile: "Google sign-in was cancelled"**
- Verify the client IDs are correct for each platform
- Check that Google+ API is enabled
- Ensure redirect URI scheme is configured in app.json

### Apple Sign In Issues

**Error: "invalid_client"**
- Regenerate your client secret (JWT token)
- Ensure the token hasn't expired (max 6 months)
- Verify Team ID, Client ID, and Key ID are correct

**Error: "invalid_grant"**
- Check that your Service ID is properly configured
- Verify the return URL matches exactly
- Ensure Sign In with Apple is enabled for your App ID

**Mobile: Apple Sign In not showing**
- Only works on iOS devices (not Android)
- Requires iOS 13 or later
- Must be tested on physical device or iOS simulator with signed-in Apple ID

### Database Issues

**Error: "User not found"**
- Ensure database migrations are up to date: `npm run db:push`
- Check that Prisma client is generated: `npm run db:generate`

**Error: "Unique constraint failed"**
- User with that email already exists
- Check if trying to link OAuth to existing email-based account (should auto-link)

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)

## 🎯 Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Email/Password Auth | ✅ Ready | Fully configured for mobile & webapp |
| Google OAuth (Webapp) | ⚙️ Needs Config | NextAuth configured, needs credentials |
| Google OAuth (Mobile) | ⚙️ Needs Config | Code ready, needs client IDs |
| Apple Sign In (Webapp) | ⚙️ Needs Config | NextAuth configured, needs credentials |
| Apple Sign In (Mobile) | ⚙️ Needs Config | iOS ready, needs App ID setup |
| Backend API Endpoints | ✅ Ready | `/api/auth/mobile/signup`, `/login`, `/oauth` |
| Session Management | ✅ Ready | 30-day tokens, AsyncStorage (mobile), localStorage (web) |
| Onboarding Flow | ✅ Ready | 4-step mobile, 6-step webapp |
| Database Schema | ✅ Ready | Password field added, OAuth account linking |

## 📞 Need Help?

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations are up to date
4. Review the OAuth provider's dashboard for configuration issues
5. Test with a fresh user account

For mobile-specific issues:
- Clear app cache: `expo start -c`
- Rebuild the app: `expo prebuild --clean`
- Check Expo Go vs development build requirements for OAuth
