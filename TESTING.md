# SpineMate Testing Guide

This document provides comprehensive testing instructions for the SpineMate application, including API endpoints, mobile app screens, backend services, and end-to-end integration.

## Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [Backend API Testing](#backend-api-testing)
3. [Mobile App Testing](#mobile-app-testing)
4. [Database Testing](#database-testing)
5. [WebSocket Testing](#websocket-testing)
6. [Integration Testing](#integration-testing)
7. [Performance Testing](#performance-testing)

---

## Setup & Prerequisites

### Install Dependencies

**Backend:**
```bash
npm install
```

**Mobile:**
```bash
cd mobile
npm install
```

### Environment Setup

Create `.env` file in root directory:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with test data
npm run db:seed
```

---

## Backend API Testing

### Manual API Testing

#### 1. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

#### 2. Test API Endpoints

**Pairing API:**
```bash
# Generate QR code
curl http://localhost:3000/api/pair

# Pair device
curl -X POST http://localhost:3000/api/pair \
  -H "Content-Type: application/json" \
  -d '{"qrCode":"ABC12345","deviceId":"test-device-1"}'
```

**User API:**
```bash
# Get user
curl "http://localhost:3000/api/user?userId=USER_ID"

# Create user
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Update user
curl -X PUT http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","name":"Updated Name"}'
```

**Sessions API:**
```bash
# Get sessions
curl "http://localhost:3000/api/sessions?userId=USER_ID"

# Create session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID",
    "startTime":"2025-01-01T10:00:00Z",
    "averageScore":85
  }'
```

**Analytics API:**
```bash
# Get weekly analytics
curl "http://localhost:3000/api/analytics?userId=USER_ID&timeRange=week"

# Get monthly analytics
curl "http://localhost:3000/api/analytics?userId=USER_ID&timeRange=month"
```

### Automated API Testing

```bash
# Run Jest tests
npm test

# Run API integration tests
npm test __tests__/api/endpoints.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Mobile App Testing

### Start Mobile App

```bash
cd mobile

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device (scan QR code)
```

### Screen-by-Screen Testing

#### 1. Home Screen (`app/index.tsx`)

**Unauthenticated State:**
- ✅ Shows welcome message
- ✅ "Scan QR to Connect" button visible
- ✅ SpineMate logo displays correctly

**Authenticated State:**
- ✅ Posture score ring animates correctly
- ✅ Stats grid shows: Streak, Sessions, Breaks, Active Time
- ✅ Quick actions navigate to correct screens
- ✅ Connection status shows "Connected"
- ✅ Real-time posture updates via WebSocket

**Navigation:**
```javascript
// Test navigation
router.push('/analytics')
router.push('/exercises')
router.push('/settings')
router.push('/pairing')
```

#### 2. Pairing Screen (`app/pairing.tsx`)

- ✅ Camera permission requested
- ✅ QR scanner UI displays
- ✅ Scan area with corner markers visible
- ✅ Successfully scans QR code
- ✅ Pairs device with backend
- ✅ Navigates to home after pairing
- ✅ WebSocket connection established

#### 3. Analytics Screen (`app/analytics.tsx`)

- ✅ Time range selector works (Week/Month/Quarter/Year)
- ✅ Summary cards display correct metrics
- ✅ Posture score trend chart renders
- ✅ Problem areas bars show correct percentages
- ✅ Recent sessions list populated
- ✅ Pull-to-refresh functionality works
- ✅ Export button shares analytics

#### 4. Exercises Screen (`app/exercises.tsx`)

- ✅ Category tabs filter exercises correctly
- ✅ Search bar filters in real-time
- ✅ Exercise cards display with thumbnails
- ✅ Favorite toggle works
- ✅ Filter modal opens and applies filters
- ✅ Sort options change order (Popular/Duration/Recent)
- ✅ Tapping exercise navigates to detail

#### 5. Exercise Detail Screen (`app/exercises/[id].tsx`)

- ✅ Exercise name and metadata display
- ✅ Video placeholder or thumbnail shows
- ✅ Step-by-step instructions listed
- ✅ Benefits list with checkmarks
- ✅ Related exercises carousel scrollable
- ✅ Favorite button toggles
- ✅ Share button works
- ✅ "Start Exercise" navigates to workout

#### 6. Workout Screen (`app/workout.tsx`)

- ✅ Timer counts down correctly
- ✅ Progress bar updates
- ✅ Exercise queue shows coming up exercises
- ✅ Pause/Resume buttons work
- ✅ Skip button advances to next exercise
- ✅ Points counter increments
- ✅ Workout completion screen shows
- ✅ Share results button works

#### 7. Settings Screen (`app/settings.tsx`)

- ✅ User profile displays correctly
- ✅ Notification toggles save state
- ✅ Sync functionality works
- ✅ Subscription tier shows correctly
- ✅ About links open correctly
- ✅ Logout confirmation modal
- ✅ Delete account modal works

### Component Testing

Test each reusable component:

```bash
# Run mobile app tests
cd mobile
npm test

# Run integration tests
npm test __tests__/integration.test.tsx
```

**Components to Test:**
- Button (all variants)
- Card
- Badge (all variants)
- ScoreRing (animation)
- StatCard
- ExerciseCard
- ChartComponent
- LoadingSpinner
- EmptyState
- Modal
- ErrorBoundary

---

## Database Testing

### SQLite Database (Mobile)

```javascript
import { databaseService } from './services/database'

// Initialize
await databaseService.initialize()

// Test user operations
await databaseService.saveUser(testUser)
const user = await databaseService.getUser(userId)

// Test session operations
await databaseService.savePostureSession(session)
const sessions = await databaseService.getPostureSessions(userId)

// Test caching
await databaseService.cacheAnalytics(userId, 'week', analytics)
const cached = await databaseService.getCachedAnalytics(userId, 'week')

// Test sync queue
const queue = await databaseService.getSyncQueue()

// Get stats
const stats = await databaseService.getDatabaseStats()
console.log(stats) // { users: 1, sessions: 10, breaks: 5, queueSize: 3 }
```

### Prisma Database (Backend)

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate SQL migration
npx prisma migrate dev --name test_migration
```

---

## WebSocket Testing

### Manual WebSocket Testing

Use a WebSocket client (like `wscat` or browser console):

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    userId: 'test-user-id',
    deviceId: 'test-device-123',
    type: 'mobile'
  }
})

// Listen for events
socket.on('posture-data', (data) => {
  console.log('Received posture data:', data)
})

socket.on('new-achievement', (data) => {
  console.log('Achievement unlocked:', data)
})

socket.on('break-reminder', (data) => {
  console.log('Break reminder:', data)
})

// Emit events
socket.emit('mobile-connected', {
  userId: 'test-user-id',
  deviceId: 'test-device-123'
})

socket.emit('check-achievements', {
  userId: 'test-user-id'
})
```

### Test All WebSocket Events

**Authentication & Pairing:**
- `mobile-connected` → `device-paired`
- `generate-qr` → `qr-generated`
- `pairing-success`

**Posture Data:**
- `posture-data` (web to mobile)
- `acknowledge-posture`

**Analytics:**
- `analytics-update`
- `goal-progress`

**Achievements:**
- `achievement-unlocked` → `new-achievement`
- `check-achievements`

**Breaks:**
- `break-reminder`
- `break-started`
- `break-completed`

**Sync:**
- `sync-request` → `sync-start` → `sync-complete`

---

## Integration Testing

### End-to-End User Flow

**Test Scenario 1: New User Onboarding**

1. Open mobile app (unauthenticated)
2. Tap "Scan QR to Connect"
3. Open webapp, generate QR code
4. Scan QR code with mobile
5. Verify pairing success
6. Check WebSocket connection established
7. Verify user data synced to mobile

**Test Scenario 2: Posture Tracking**

1. Start posture tracking on webapp
2. Verify real-time data streams to mobile
3. Check posture score updates on mobile
4. Verify session saved to database
5. Check sync queue has pending items
6. Trigger sync
7. Verify session appears in webapp analytics

**Test Scenario 3: Break Exercise**

1. Navigate to Exercises screen
2. Select an exercise
3. Start exercise
4. Complete workout
5. Verify points awarded
6. Check achievement unlocked
7. Verify notification sent
8. Check data synced to backend

**Test Scenario 4: Offline Mode**

1. Disconnect from internet
2. Create posture session
3. Create break session
4. Check data saved to SQLite
5. Verify sync queue populated
6. Reconnect to internet
7. Check auto-sync triggered
8. Verify all data synced to server

### Backend-Frontend Synchronization

**Test Data Flow:**

```
Mobile → API → Database → API → Mobile
  ↓                           ↓
SQLite                    Analytics
  ↓                           ↓
Sync Queue → Sync API → Prisma DB
```

**Verification Steps:**

1. Create data on mobile (offline)
2. Check SQLite has data
3. Check sync queue populated
4. Trigger sync
5. Verify API receives data
6. Check Prisma database updated
7. Fetch analytics from API
8. Verify mobile receives updated analytics
9. Check cache updated

---

## Performance Testing

### Mobile App Performance

```javascript
import { estimateObjectSize, formatNumber } from './utils/performance'

// Test memory usage
const user = await databaseService.getUser(userId)
const size = estimateObjectSize(user)
console.log('User object size:', formatNumber(size), 'bytes')

// Test database query speed
console.time('getSessions')
const sessions = await databaseService.getPostureSessions(userId, 100)
console.timeEnd('getSessions')

// Test component render time
console.time('renderAnalytics')
// Render analytics screen
console.timeEnd('renderAnalytics')
```

### API Performance

```bash
# Use Apache Bench for load testing
ab -n 1000 -c 10 http://localhost:3000/api/analytics?userId=test-user-id

# Results should show:
# - Requests per second > 100
# - Mean response time < 100ms
# - No failed requests
```

### Database Performance

```sql
-- Check query performance
EXPLAIN QUERY PLAN SELECT * FROM posture_sessions WHERE userId = 'test-user-id';

-- Should use index: idx_posture_sessions_user
```

---

## Test Checklist

### Backend ✅

- [ ] All API endpoints return correct responses
- [ ] Error handling works for invalid requests
- [ ] Database operations complete successfully
- [ ] WebSocket events emit and receive correctly
- [ ] Authentication system works
- [ ] Recommendation engine returns personalized results
- [ ] Streak calculator computes correctly
- [ ] Achievement system triggers appropriately

### Mobile ✅

- [ ] App initializes without errors
- [ ] All screens navigate correctly
- [ ] Components render properly
- [ ] Forms validate input
- [ ] Images load correctly
- [ ] Animations are smooth
- [ ] Offline mode works
- [ ] Notifications display
- [ ] Camera permissions handled

### Integration ✅

- [ ] QR pairing flow works end-to-end
- [ ] Real-time data syncs webapp ↔ mobile
- [ ] Offline data syncs when reconnected
- [ ] Analytics updates reflect new data
- [ ] Achievements unlock correctly
- [ ] Break reminders trigger
- [ ] Multi-device support works

### Performance ✅

- [ ] API response times < 200ms
- [ ] Mobile app launches < 3s
- [ ] Screen transitions < 100ms
- [ ] Database queries optimized
- [ ] Memory usage reasonable
- [ ] No memory leaks
- [ ] Smooth 60fps animations

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Solution: Reset database
npm run db:push
```

**2. WebSocket Not Connecting**
```bash
# Solution: Check server is running
npm run dev

# Verify WebSocket endpoint
curl http://localhost:3000/socket.io/
```

**3. Mobile App Won't Start**
```bash
# Solution: Clear cache and reinstall
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

**4. Notifications Not Working**
```javascript
// Solution: Check permissions
const { status } = await Notifications.getPermissionsAsync()
console.log('Notification permission:', status)
```

**5. Offline Sync Failing**
```javascript
// Solution: Check sync queue
const queue = await databaseService.getSyncQueue()
console.log('Pending sync items:', queue.length)
```

---

## Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:push
      - run: npm test
      - run: npm run build
```

---

## Summary

This testing guide covers all aspects of the SpineMate application:

- **API Testing**: All 6 API endpoints with manual and automated tests
- **Mobile Testing**: All 7 screens with component and integration tests
- **Database Testing**: Both SQLite (mobile) and Prisma (backend)
- **WebSocket Testing**: All 20+ real-time events
- **Integration Testing**: Complete user flows and data synchronization
- **Performance Testing**: Load testing, memory profiling, and optimization

Follow this guide to ensure the application is production-ready and all features work correctly across platforms.
