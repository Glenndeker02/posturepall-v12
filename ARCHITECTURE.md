# SpineMate Architecture Documentation

## Overview
SpineMate is a comprehensive posture monitoring system consisting of a Next.js web application and a React Native mobile application, with real-time synchronization via WebSocket and REST APIs.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├──────────────────────────────┬──────────────────────────────────┤
│    Web App (Next.js 15)      │   Mobile App (React Native)      │
│    - Dashboard               │   - Home Screen                  │
│    - Analytics               │   - Analytics Mirror             │
│    - Exercises               │   - Exercises Library            │
│    - Posture Monitoring      │   - Settings                     │
│    - OAuth Login             │   - QR Scanner                   │
│    - Calibration             │   - Workout Tracking             │
│    - Onboarding              │   - Push Notifications           │
└──────────────────────────────┴──────────────────────────────────┘
                          ▲                    ▲
                          │                    │
                    ┌─────┴────────────────────┴─────┐
                    │        Real-time Sync          │
                    │   WebSocket (Socket.IO)        │
                    │   REST APIs                     │
                    └─────┬────────────────────┬─────┘
                          │                    │
                          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend Layer                              │
├──────────────────────────────┬──────────────────────────────────┤
│    Next.js API Routes        │   Socket.IO Server               │
│    - /api/auth               │   - QR Pairing                   │
│    - /api/user               │   - Posture Stream               │
│    - /api/pair               │   - Analytics Push               │
│    - /api/sessions           │   - Exercise Updates             │
│    - /api/breaks             │   - Session Events               │
│    - /api/analytics          │                                  │
│    - /api/sync               │                                  │
└──────────────────────────────┴──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
├──────────────────────────────────────────────────────────────────┤
│    Prisma ORM + SQLite Database                                 │
│    - Users & Auth (OAuth)                                        │
│    - Posture Sessions                                            │
│    - Break Sessions                                              │
│    - Exercises Library                                           │
│    - Achievements & Goals                                        │
│    - Mobile Sync State                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models (Prisma Schema)

### Core Models

#### User
```prisma
- id: String (CUID)
- email: String (unique, optional for OAuth)
- name: String
- image: String (OAuth profile pic)
- subscriptionTier: String (free/premium)
- workEnvironment: String (office/home/flexible/student/gaming/other)
- dailySittingHours: Int
- painAreas: JSON String (array of affected areas)
- workSchedule: JSON String {startTime, endTime, workDays, breakFrequency}
- userGoals: JSON String {primaryGoal, commitmentLevel}
- calibrationData: JSON String {headAngle, shoulderSymmetry, spineAlignment}
- qrPairingCode: String (8-char code for mobile pairing)
- mobileDeviceId: String (paired device UUID)
- createdAt, updatedAt: DateTime
```

#### PostureSession
```prisma
- id: String
- userId: String
- startTime: DateTime
- endTime: DateTime
- duration: Int (minutes)
- overallScore: Int (0-100)
- goodPosturePercent: Float
- deviationBreakdown: JSON {headForward, shoulderSlump, spineAlignment}
- alertsReceived: Int
- correctionSpeed: Float (seconds)
- pointsEarned: Int
- mobileSynced: Boolean
```

#### BreakSession
```prisma
- id: String
- userId: String
- breakType: String (micro/standard/extended)
- exercises: JSON [exerciseId, completed, duration]
- duration: Int
- completed: Boolean
- pointsEarned: Int
- mobileSynced: Boolean
```

#### Exercise
```prisma
- id: String
- name: String
- category: String (neck/shoulder/back/chest/lower_body/eye)
- description: String
- instructions: JSON [step1, step2, ...]
- duration: Int (seconds)
- difficulty: String (gentle/moderate/deep)
- imageUrl: String
- gifUrl: String
```

#### Achievement & Goal
```prisma
Achievement:
- name, description, icon, points, rarity
- condition: JSON {type, threshold, metric}

Goal:
- title, description
- targetValue, currentValue, unit
- deadline, isCompleted
```

### NextAuth Models
- Account (OAuth providers)
- Session (user sessions)
- VerificationToken

---

## API Endpoints

### Authentication
```
POST /api/auth/signin           - NextAuth sign in
POST /api/auth/signout          - NextAuth sign out
GET  /api/auth/session          - Get current session
GET  /api/auth/callback/google  - Google OAuth callback
GET  /api/auth/callback/apple   - Apple OAuth callback
```

### User Management
```
POST /api/user                  - Create/Update user profile
GET  /api/user?userId=X         - Get user by ID
GET  /api/user?email=X          - Get user by email
PUT  /api/user                  - Update calibration/device/subscription
```

### QR Pairing (Mobile Integration)
```
GET  /api/pair                  - Generate QR pairing code (10-min expiry)
POST /api/pair                  - Pair mobile device
  Body: {qrCode, deviceId}
  Returns: {success, user}
```

### Posture Sessions
```
POST /api/sessions              - Create session
GET  /api/sessions?userId=X     - Get user sessions
PUT  /api/sessions              - Update session
  Body: {sessionId, ...metrics}
```

### Break Sessions
```
POST /api/breaks                - Create break session
GET  /api/breaks?userId=X       - Get user breaks
```

### Analytics
```
GET  /api/analytics?userId=X&timeRange=week
  Returns: {
    summary: {totalSessions, avgScore, streak, ...},
    dailyData: [...],
    problemAreas: {headForward: 45, ...},
    recentSessions: [...]
  }
```

### Data Synchronization (Mobile-Web)
```
POST /api/sync                  - Sync mobile data to web
  Body: {userId, deviceId, sessions[], breaks[], lastSyncTime}
  Returns: {sessionsSynced, breaksSynced, errors[]}

GET  /api/sync?userId=X&deviceId=Y
  Returns: {
    sessions: [...unsynced web sessions],
    breaks: [...unsynced web breaks],
    user: {calibrationData, goals, subscriptionTier}
  }
```

### Health Check
```
GET  /api/health                - API status
```

---

## WebSocket Events (Socket.IO)

### QR Pairing Flow
```
Web → Server:   'generate-qr' → {userId}
Server → Web:   'qr-generated' → {code, expiresAt}
Mobile → Server:'scan-qr' → {code, deviceId}
Server → Web:   'device-paired' → {deviceId, deviceInfo}
Server → Mobile:'pairing-success' → {user, sessionToken}
```

### Real-time Posture Streaming
```
Web → Server:   'posture-update' → {userId, metrics, timestamp}
Server → Mobile:'posture-data' → {score, status, metrics}
Mobile → Server:'acknowledge-posture' → {timestamp}
```

### Analytics Push
```
Server → Mobile:'analytics-update' → {summary, trends}
Server → Mobile:'new-achievement' → {achievement}
Server → Mobile:'goal-progress' → {goalId, progress}
```

### Break Reminders
```
Server → Mobile:'break-reminder' → {type, suggestedExercises[]}
Mobile → Server:'break-started' → {breakId}
Mobile → Server:'break-completed' → {breakId, exercises[]}
```

---

## Web App Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Auth**: NextAuth.js v4 (Google + Apple OAuth)
- **Database**: Prisma ORM + SQLite
- **Real-time**: Socket.IO
- **State**: React hooks + Zustand (if needed)
- **Icons**: Lucide React
- **Animation**: Framer Motion

### Page Structure
```
/                       → Landing/Dashboard
/auth                   → Login with OAuth
/onboarding             → 6-step personalization
/calibration            → Posture baseline setup
/dashboard              → Main hub (scores, streaks, recommendations)
/posture                → Real-time monitoring
/analytics              → Trends, charts, insights
/exercises              → Exercise library + routines
/breaks                 → Break management
/settings               → User preferences
/insights               → AI-powered insights
```

### Key Features
1. **OAuth Login**: Google + Apple via NextAuth
2. **Onboarding**: 6-step personalization (work env, sitting hours, pain areas, schedule, goals, account)
3. **Calibration**: Webcam-based posture baseline capture
4. **Dashboard**: Score ring, streaks, goals, activities, recommendations
5. **Posture Monitoring**: Real-time webcam analysis with metrics
6. **Analytics**: Charts, trends, problem areas, AI insights
7. **Exercises**: Library with categories, filters, routines, AI recommendations

### Posture Analysis Algorithm
Tracks multiple skeletal keypoints:
- Head Forward Angle: Degrees from calibrated position
- Shoulder Symmetry: Height difference between shoulders
- Spine Alignment: Upper spine curve measurement
- Distance from Screen: Eye strain prevention

Scoring:
- 80-100%: Excellent (green)
- 60-79%: Good (lime)
- 40-59%: Fair (yellow)
- 0-39%: Poor (red)

---

## Mobile App Architecture (To Be Built)

### Tech Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Language**: TypeScript
- **State**: Zustand + React Query
- **Storage**: AsyncStorage + SQLite (offline)
- **UI**: React Native Paper or NativeWind
- **Icons**: Expo Icons
- **Real-time**: Socket.IO Client
- **QR Code**: expo-camera + expo-barcode-scanner
- **Push Notifications**: expo-notifications

### Screen Structure
```
/                       → Home (score, streaks, connect to webapp)
/analytics              → Mirror of web analytics
/exercises              → Exercise library with filters
/exercises/[id]         → Exercise detail (video, steps)
/workout                → Workout progress tracking
/settings               → App settings
/pairing                → QR scanner for webapp connection
```

### Key Features

#### 1. QR Pairing (WhatsApp Web Style)
```
1. User opens webapp → Generates QR code
2. User opens mobile app → Tap "Scan to Connect"
3. Mobile scans QR → Sends code + deviceId to backend
4. Backend validates → Creates pairing session
5. WebSocket establishes → Real-time sync begins
```

#### 2. Home Screen
- **Posture Score Ring**: Live score from webapp
- **Streak Counter**: Daily streak with fire icon
- **Achievements Grid**: Recent badges
- **Connect Card**: "Scan QR to Connect to Webapp"
- **Workout Progress**: Today's exercises completed
- **Quick Actions**: Start Exercise, View Analytics

#### 3. Analytics Screen
- **Same Data as Web**: Synced via API + WebSocket
- **Time Range Selector**: Week/Month/Quarter/Year
- **Summary Cards**: Avg Score, Active Time, Breaks, Streak
- **Trend Charts**: Posture score over time
- **Problem Areas**: Visual breakdown
- **Recent Sessions**: List view
- **AI Insights**: Personalized tips

#### 4. Exercises Screen
- **Category Tabs**: Neck, Shoulder, Back, Eye, Full Body, Breathing
- **Exercise Cards**: Name, duration, difficulty, rating
- **Search & Filter**: Find specific exercises
- **Favorites**: Star exercises
- **Quick Routines**: Pre-built workout sets
- **AI Recommendations**: Based on posture data

#### 5. Exercise Detail Screen
- **Video Player**: GIF or video demonstration
- **Step-by-Step**: Numbered instructions
- **Timer**: Countdown for timed exercises
- **Start Button**: Begin exercise with tracking
- **Benefits List**: Why this exercise helps
- **Related Exercises**: Similar workouts

#### 6. Workout Progress
- **Active Workout**: Current exercise with timer
- **Exercise Queue**: Upcoming exercises
- **Completion Tracking**: Checkmarks for done
- **Points Earned**: Gamification
- **Pause/Skip**: Workout controls
- **Summary**: Post-workout stats

#### 7. Settings Screen
- **Account**: Name, email, photo
- **Notifications**: Break reminders, achievements
- **Data Sync**: Manual sync trigger
- **Calibration**: Re-calibrate posture
- **Subscription**: Free → Premium upgrade
- **About**: App version, privacy policy
- **Logout**: Sign out

---

## Backend Enhancements Needed

### 1. Enhanced WebSocket Handler
**File**: `src/lib/socket.ts`

Add events for:
- QR pairing flow
- Real-time posture streaming
- Analytics push notifications
- Break reminders
- Achievement alerts

### 2. Exercise Recommendation Engine
**File**: `src/lib/recommendation-engine.ts`

Algorithm:
```typescript
function recommendExercises(userId: string) {
  1. Get user's recent posture sessions
  2. Analyze deviation breakdown
  3. Identify top problem areas
  4. Fetch exercises by category matching problems
  5. Sort by:
     - Problem area severity (higher weight)
     - User's pain areas (from onboarding)
     - Exercise difficulty (match commitment level)
     - Previous completion rate
  6. Return top 5 exercises
}
```

### 3. Streak Calculation
**File**: `src/lib/streak-calculator.ts`

```typescript
function calculateStreak(userId: string) {
  1. Get all posture sessions ordered by date
  2. Check if today has a session
  3. Count consecutive days backward
  4. Return current streak
}
```

### 4. Achievement System
**File**: `src/lib/achievements.ts`

Achievements to track:
- First Session
- 7-Day Streak
- 30-Day Streak
- 100 Sessions
- Perfect Posture Day (95%+ score)
- Break Master (complete all breaks)
- Exercise Enthusiast (25 exercises)

---

## Data Synchronization Strategy

### Sync Flow
```
1. Mobile app opens → GET /api/sync?userId=X&deviceId=Y
2. Receives unsynced web data → Update local SQLite
3. User completes exercises → Store locally
4. Background sync → POST /api/sync with mobile data
5. WebSocket push → Real-time updates for active sessions
```

### Conflict Resolution
- **Last-write-wins**: Use timestamp for conflicts
- **Mobile-first**: Mobile workout data takes priority
- **Web-first**: Posture session data from web takes priority

### Offline Support
- **Mobile**: Store all data in local SQLite
- **Queue**: Sync requests when back online
- **Indicators**: Show sync status in UI

---

## Security Considerations

1. **OAuth**: Secure Google/Apple authentication
2. **QR Pairing**: 10-minute expiry, one-time use
3. **Device ID**: UUID stored securely
4. **API Auth**: NextAuth session validation
5. **WebSocket**: Auth token in handshake
6. **Data Privacy**: Local video processing only
7. **Encryption**: HTTPS for all API calls

---

## Performance Optimizations

1. **Lazy Loading**: Load exercises on demand
2. **Caching**: React Query for API responses
3. **Image Optimization**: next/image for web, Fast Image for mobile
4. **Debouncing**: Posture updates every 1 second
5. **Pagination**: Limit API responses (default: 20)
6. **Indexing**: Database indexes on userId, createdAt

---

## Deployment Architecture

### Web App
- **Platform**: Vercel or Railway
- **Environment Variables**: .env.production
- **Database**: Attach persistent SQLite or upgrade to PostgreSQL
- **WebSocket**: Deploy server.ts separately if needed

### Mobile App
- **iOS**: TestFlight → App Store
- **Android**: Google Play Console
- **OTA Updates**: Expo Updates for quick fixes
- **Environment**: .env.production with API URLs

---

## Development Roadmap

### Phase 1: Setup (Complete)
✅ Web app with OAuth
✅ Database schema
✅ API endpoints
✅ Socket.IO server

### Phase 2: Mobile App (In Progress)
- [ ] Initialize React Native + Expo project
- [ ] QR code scanner
- [ ] Home screen with score ring
- [ ] Analytics screen (mirror web)
- [ ] Exercises library
- [ ] Exercise detail + video player
- [ ] Workout tracking
- [ ] Settings screen
- [ ] WebSocket integration
- [ ] Data sync implementation

### Phase 3: Backend Enhancements
- [ ] Exercise recommendation engine
- [ ] Enhanced WebSocket events
- [ ] Streak calculator
- [ ] Achievement system
- [ ] Push notifications

### Phase 4: Polish & Testing
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Bug fixes
- [ ] Documentation

### Phase 5: Launch
- [ ] Production deployment
- [ ] App Store submission
- [ ] Marketing materials
- [ ] User onboarding guides

---

## File Structure

```
posturepall-v12/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── exercises/
│   │   │   ├── insights/
│   │   │   └── settings/
│   │   ├── analytics/
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   ├── pair/
│   │   │   ├── sessions/
│   │   │   ├── breaks/
│   │   │   ├── analytics/
│   │   │   ├── sync/
│   │   │   └── user/
│   │   ├── auth/
│   │   ├── breaks/
│   │   ├── calibration/
│   │   ├── onboarding/
│   │   ├── posture/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── providers/
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config
│   │   ├── db.ts                # Prisma client
│   │   ├── socket.ts            # Socket.IO setup
│   │   └── utils.ts
│   └── types/
├── mobile/                        # To be created
│   ├── app/                      # Expo Router
│   ├── components/
│   ├── services/
│   ├── store/
│   └── utils/
├── server.ts                      # Custom Next.js + Socket.IO server
├── package.json
├── .env.example
├── APIStest.md                   # API documentation
└── ARCHITECTURE.md               # This file
```

---

## Next Steps

1. ✅ Complete codebase scan
2. ✅ Document architecture
3. **→ Initialize mobile app with Expo**
4. Build QR pairing system
5. Implement real-time sync
6. Create all mobile screens
7. Add exercise recommendation engine
8. Test end-to-end integration
9. Deploy to production

---

## Useful Commands

### Web App
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run db:push          # Update database schema
npm run db:generate      # Regenerate Prisma client
```

### Mobile App (After setup)
```bash
npx expo start           # Start Expo dev server
npx expo start --ios     # Open in iOS simulator
npx expo start --android # Open in Android emulator
npx expo build           # Build for production
```

---

## Contact & Support

For questions or issues:
- GitHub Issues: https://github.com/your-repo/issues
- Documentation: This file
- API Docs: APIStest.md
