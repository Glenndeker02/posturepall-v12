# SpineMate API Documentation & Testing Guide

## Overview
This document provides comprehensive documentation for all API endpoints in the SpineMate application, including request/response formats, authentication requirements, and testing examples.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
Most endpoints use NextAuth session-based authentication. Protected endpoints require a valid session cookie.

---

## API Endpoints

### 1. Health Check
**Endpoint:** `/api/health`
**Method:** `GET`
**Authentication:** Not required
**Description:** Basic health check endpoint to verify API availability

#### Response
```json
{
  "message": "Good!"
}
```

#### Test Command
```bash
curl http://localhost:3000/api/health
```

---

### 2. User Management

#### 2.1 Create/Update User
**Endpoint:** `/api/user`
**Method:** `POST`
**Authentication:** Not required
**Description:** Creates a new user or updates an existing user based on email

#### Request Body
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "workEnvironment": "office",
  "dailySittingHours": 8,
  "painAreas": ["neck", "lower_back"],
  "workSchedule": {
    "startTime": "09:00",
    "endTime": "17:00",
    "workDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  "userGoals": {
    "targetPostureScore": 85,
    "dailyBreaks": 5
  },
  "calibrationData": {
    "baseline": "good_posture_data"
  }
}
```

#### Response
```json
{
  "success": true,
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free",
    "workEnvironment": "office",
    "dailySittingHours": 8,
    "painAreas": ["neck", "lower_back"],
    "workSchedule": {...},
    "userGoals": {...},
    "calibrationData": {...},
    "qrPairingCode": "ABC123XY"
  }
}
```

#### Test Command
```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "workEnvironment": "home",
    "dailySittingHours": 6,
    "painAreas": ["neck"],
    "workSchedule": {},
    "userGoals": {},
    "calibrationData": {}
  }'
```

#### 2.2 Get User
**Endpoint:** `/api/user`
**Method:** `GET`
**Authentication:** Not required
**Description:** Retrieves user information by userId or email

#### Query Parameters
- `userId` (optional): User ID
- `email` (optional): User email

**Note:** One of userId or email is required

#### Response
```json
{
  "success": true,
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free",
    "workEnvironment": "office",
    "dailySittingHours": 8,
    "painAreas": ["neck", "lower_back"],
    "workSchedule": {...},
    "userGoals": {...},
    "calibrationData": {...},
    "qrPairingCode": "ABC123XY",
    "mobileDeviceId": "device-uuid",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### Test Command
```bash
# By email
curl "http://localhost:3000/api/user?email=test@example.com"

# By userId
curl "http://localhost:3000/api/user?userId=clxxx123456"
```

#### 2.3 Update User
**Endpoint:** `/api/user`
**Method:** `PUT`
**Authentication:** Not required
**Description:** Updates user-specific fields (calibration, device, subscription)

#### Request Body
```json
{
  "userId": "clxxx123456",
  "calibrationData": {...},
  "mobileDeviceId": "new-device-uuid",
  "subscriptionTier": "premium"
}
```

#### Response
```json
{
  "success": true,
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "premium",
    "calibrationData": {...},
    "mobileDeviceId": "new-device-uuid"
  }
}
```

#### Test Command
```bash
curl -X PUT http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxxx123456",
    "subscriptionTier": "premium"
  }'
```

---

### 3. QR Pairing (Mobile Integration)

#### 3.1 Generate Pairing Code
**Endpoint:** `/api/pair`
**Method:** `GET`
**Authentication:** Required (user session)
**Description:** Generates a QR pairing code for mobile device pairing

#### Response
```json
{
  "pairingCode": "ABC123XY",
  "expiresAt": "2025-01-15T10:40:00Z"
}
```

#### Test Command
```bash
curl http://localhost:3000/api/pair \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### 3.2 Pair Device
**Endpoint:** `/api/pair`
**Method:** `POST`
**Authentication:** Not required (uses QR code)
**Description:** Pairs a mobile device using the QR code

#### Request Body
```json
{
  "qrCode": "ABC123XY",
  "deviceId": "mobile-device-uuid-12345"
}
```

#### Response
```json
{
  "success": true,
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free"
  }
}
```

#### Error Responses
```json
// Invalid or expired QR code
{
  "error": "Invalid QR code or pairing expired"
}

// Missing parameters
{
  "error": "QR code and device ID are required"
}
```

#### Test Command
```bash
curl -X POST http://localhost:3000/api/pair \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "ABC123XY",
    "deviceId": "test-device-12345"
  }'
```

---

### 4. Posture Sessions

#### 4.1 Create Session
**Endpoint:** `/api/sessions`
**Method:** `POST`
**Authentication:** Required
**Description:** Creates a new posture monitoring session

#### Request Body
```json
{
  "userId": "clxxx123456",
  "startTime": "2025-01-15T10:00:00Z",
  "endTime": "2025-01-15T11:00:00Z",
  "duration": 60,
  "overallScore": 85,
  "goodPosturePercent": 75.5,
  "deviationBreakdown": {
    "headForward": 15,
    "shoulderSlump": 10,
    "spineAlignment": 5
  },
  "alertsReceived": 3,
  "correctionSpeed": 12.5,
  "pointsEarned": 50
}
```

#### Response
```json
{
  "success": true,
  "session": {
    "id": "session-id-123",
    "userId": "clxxx123456",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z",
    "duration": 60,
    "overallScore": 85,
    "goodPosturePercent": 75.5,
    "deviationBreakdown": {...},
    "alertsReceived": 3,
    "correctionSpeed": 12.5,
    "pointsEarned": 50,
    "mobileSynced": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

#### Test Command
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxxx123456",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z",
    "duration": 60,
    "overallScore": 85,
    "goodPosturePercent": 75.5,
    "deviationBreakdown": {
      "headForward": 15
    },
    "alertsReceived": 3,
    "correctionSpeed": 12,
    "pointsEarned": 50
  }'
```

#### 4.2 Get Sessions
**Endpoint:** `/api/sessions`
**Method:** `GET`
**Authentication:** Required
**Description:** Retrieves posture sessions for a user

#### Query Parameters
- `userId` (required): User ID
- `limit` (optional): Number of sessions to return (default: 10)

#### Response
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session-id-123",
      "userId": "clxxx123456",
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T11:00:00Z",
      "duration": 60,
      "overallScore": 85,
      "goodPosturePercent": 75.5,
      "deviationBreakdown": {...},
      "alertsReceived": 3,
      "correctionSpeed": 12.5,
      "pointsEarned": 50
    }
  ]
}
```

#### Test Command
```bash
curl "http://localhost:3000/api/sessions?userId=clxxx123456&limit=5"
```

#### 4.3 Update Session
**Endpoint:** `/api/sessions`
**Method:** `PUT`
**Authentication:** Required
**Description:** Updates an existing posture session

#### Request Body
```json
{
  "sessionId": "session-id-123",
  "endTime": "2025-01-15T11:30:00Z",
  "duration": 90,
  "overallScore": 88,
  "goodPosturePercent": 80.0,
  "deviationBreakdown": {...},
  "alertsReceived": 4,
  "correctionSpeed": 10.0,
  "pointsEarned": 75
}
```

#### Response
```json
{
  "success": true,
  "session": {
    "id": "session-id-123",
    "endTime": "2025-01-15T11:30:00Z",
    "duration": 90,
    "overallScore": 88,
    ...
  }
}
```

#### Test Command
```bash
curl -X PUT http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-id-123",
    "endTime": "2025-01-15T11:30:00Z",
    "duration": 90,
    "overallScore": 88,
    "goodPosturePercent": 80,
    "deviationBreakdown": {},
    "alertsReceived": 4,
    "correctionSpeed": 10,
    "pointsEarned": 75
  }'
```

---

### 5. Break Sessions

#### 5.1 Create Break Session
**Endpoint:** `/api/breaks`
**Method:** `POST`
**Authentication:** Required
**Description:** Creates a new break/exercise session

#### Request Body
```json
{
  "userId": "clxxx123456",
  "breakType": "micro",
  "exercises": [
    {
      "name": "Neck Stretch",
      "duration": 30,
      "completed": true
    },
    {
      "name": "Shoulder Roll",
      "duration": 20,
      "completed": true
    }
  ],
  "duration": 5,
  "completed": true,
  "pointsEarned": 10
}
```

**Break Types:**
- `micro`: 2-5 minute breaks
- `standard`: 10-15 minute breaks
- `extended`: 20-30 minute breaks

#### Response
```json
{
  "success": true,
  "breakSession": {
    "id": "break-id-123",
    "userId": "clxxx123456",
    "breakType": "micro",
    "exercises": [...],
    "duration": 5,
    "completed": true,
    "pointsEarned": 10,
    "mobileSynced": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

#### Test Command
```bash
curl -X POST http://localhost:3000/api/breaks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxxx123456",
    "breakType": "micro",
    "exercises": [{"name": "Neck Stretch", "duration": 30, "completed": true}],
    "duration": 5,
    "completed": true,
    "pointsEarned": 10
  }'
```

#### 5.2 Get Break Sessions
**Endpoint:** `/api/breaks`
**Method:** `GET`
**Authentication:** Required
**Description:** Retrieves break sessions for a user

#### Query Parameters
- `userId` (required): User ID
- `limit` (optional): Number of sessions to return (default: 20)

#### Response
```json
{
  "success": true,
  "breakSessions": [
    {
      "id": "break-id-123",
      "userId": "clxxx123456",
      "breakType": "micro",
      "exercises": [...],
      "duration": 5,
      "completed": true,
      "pointsEarned": 10,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Test Command
```bash
curl "http://localhost:3000/api/breaks?userId=clxxx123456&limit=10"
```

---

### 6. Analytics

**Endpoint:** `/api/analytics`
**Method:** `GET`
**Authentication:** Required
**Description:** Retrieves comprehensive analytics for a user

#### Query Parameters
- `userId` (required): User ID
- `timeRange` (optional): Time range for analytics
  - `week` (default): Last 7 days
  - `month`: Last 30 days
  - `quarter`: Last 90 days
  - `year`: Last 365 days

#### Response
```json
{
  "success": true,
  "analytics": {
    "summary": {
      "totalSessions": 25,
      "totalDuration": 1500,
      "averageScore": 82,
      "averageGoodPosture": 75,
      "totalAlerts": 45,
      "averageCorrectionSpeed": 15,
      "completedBreaks": 18,
      "totalBreaks": 20,
      "breakCompletionRate": 90,
      "currentStreak": 7,
      "timeRange": "week"
    },
    "dailyData": [
      {
        "date": "2025-01-15",
        "sessions": [...],
        "totalDuration": 240,
        "averageScore": 85,
        "goodPosturePercent": 78
      }
    ],
    "problemAreas": {
      "headForward": 120,
      "shoulderSlump": 80,
      "spineAlignment": 45
    },
    "recentSessions": [...]
  }
}
```

#### Test Command
```bash
# Weekly analytics
curl "http://localhost:3000/api/analytics?userId=clxxx123456&timeRange=week"

# Monthly analytics
curl "http://localhost:3000/api/analytics?userId=clxxx123456&timeRange=month"
```

---

### 7. Data Synchronization (Mobile-Web)

#### 7.1 Sync Data from Mobile
**Endpoint:** `/api/sync`
**Method:** `POST`
**Authentication:** Required (device pairing)
**Description:** Syncs data from mobile app to web platform

#### Request Body
```json
{
  "userId": "clxxx123456",
  "deviceId": "mobile-device-uuid",
  "lastSyncTime": "2025-01-14T10:00:00Z",
  "sessions": [
    {
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T11:00:00Z",
      "duration": 60,
      "overallScore": 85,
      "goodPosturePercent": 75.5,
      "deviationBreakdown": {...},
      "alertsReceived": 3,
      "correctionSpeed": 12.5,
      "pointsEarned": 50
    }
  ],
  "breaks": [
    {
      "breakType": "micro",
      "exercises": [...],
      "duration": 5,
      "completed": true,
      "pointsEarned": 10,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "syncResults": {
    "sessionsSynced": 1,
    "breaksSynced": 1,
    "errors": [],
    "webSessionsMarkedSynced": 2,
    "webBreaksMarkedSynced": 3,
    "syncTime": "2025-01-15T12:00:00Z"
  }
}
```

#### Error Responses
```json
// Unauthorized device
{
  "error": "Unauthorized device or user not found"
}

// Missing parameters
{
  "error": "User ID and device ID are required"
}
```

#### Test Command
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxxx123456",
    "deviceId": "test-device-12345",
    "sessions": [],
    "breaks": []
  }'
```

#### 7.2 Get Unsynced Data for Mobile
**Endpoint:** `/api/sync`
**Method:** `GET`
**Authentication:** Required (device pairing)
**Description:** Retrieves unsynced web data for mobile app

#### Query Parameters
- `userId` (required): User ID
- `deviceId` (required): Mobile device ID
- `lastSyncTime` (optional): Last sync timestamp

#### Response
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id-123",
        "startTime": "2025-01-15T10:00:00Z",
        "endTime": "2025-01-15T11:00:00Z",
        "duration": 60,
        "overallScore": 85,
        "goodPosturePercent": 75.5,
        "deviationBreakdown": {...},
        "alertsReceived": 3,
        "correctionSpeed": 12.5,
        "pointsEarned": 50
      }
    ],
    "breaks": [...],
    "user": {
      "calibrationData": {...},
      "subscriptionTier": "free",
      "goals": {...}
    },
    "syncTime": "2025-01-15T12:00:00Z"
  }
}
```

#### Test Command
```bash
curl "http://localhost:3000/api/sync?userId=clxxx123456&deviceId=test-device-12345"
```

---

### 8. Authentication (NextAuth)

**Endpoint:** `/api/auth/[...nextauth]`
**Methods:** `GET`, `POST`
**Description:** NextAuth authentication endpoints

#### Available Routes
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/google` - Google OAuth callback
- `/api/auth/callback/apple` - Apple OAuth callback
- `/api/auth/session` - Get current session
- `/api/auth/providers` - List available providers

#### OAuth Providers
1. **Google OAuth**
   - Client ID and Secret required
   - Redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Apple Sign In**
   - Client ID and Secret required
   - Redirect URI: `http://localhost:3000/api/auth/callback/apple`

#### Get Session
```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Response
```json
{
  "user": {
    "id": "clxxx123456",
    "name": "John Doe",
    "email": "user@example.com",
    "image": "https://avatar-url.com/image.jpg"
  },
  "expires": "2025-02-15T10:00:00Z"
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Authentication required or invalid
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

---

## Testing Workflow

### 1. Setup Test User
```bash
# Create user
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "workEnvironment": "home",
    "dailySittingHours": 8,
    "painAreas": [],
    "workSchedule": {},
    "userGoals": {},
    "calibrationData": {}
  }'
```

### 2. Create Posture Session
```bash
# Save the userId from step 1
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_STEP_1",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z",
    "duration": 60,
    "overallScore": 85,
    "goodPosturePercent": 75,
    "deviationBreakdown": {},
    "alertsReceived": 3,
    "correctionSpeed": 12,
    "pointsEarned": 50
  }'
```

### 3. Create Break Session
```bash
curl -X POST http://localhost:3000/api/breaks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_STEP_1",
    "breakType": "micro",
    "exercises": [],
    "duration": 5,
    "completed": true,
    "pointsEarned": 10
  }'
```

### 4. Get Analytics
```bash
curl "http://localhost:3000/api/analytics?userId=USER_ID_FROM_STEP_1&timeRange=week"
```

---

## Database Schema Reference

### User
- `id`: String (CUID)
- `email`: String (unique, optional)
- `emailVerified`: DateTime (optional)
- `name`: String (optional)
- `image`: String (optional)
- `subscriptionTier`: String (default: "free")
- `workEnvironment`: String (optional)
- `dailySittingHours`: Int (optional)
- `painAreas`: JSON String (optional)
- `workSchedule`: JSON String (optional)
- `userGoals`: JSON String (optional)
- `calibrationData`: JSON String (optional)
- `qrPairingCode`: String (unique, optional)
- `mobileDeviceId`: String (optional)

### PostureSession
- `id`: String (CUID)
- `userId`: String
- `startTime`: DateTime
- `endTime`: DateTime (optional)
- `duration`: Int (minutes)
- `overallScore`: Int (0-100)
- `goodPosturePercent`: Float
- `deviationBreakdown`: JSON String
- `alertsReceived`: Int
- `correctionSpeed`: Float (seconds)
- `pointsEarned`: Int
- `mobileSynced`: Boolean

### BreakSession
- `id`: String (CUID)
- `userId`: String
- `breakType`: String (micro, standard, extended)
- `exercises`: JSON String
- `duration`: Int (minutes)
- `completed`: Boolean
- `pointsEarned`: Int
- `mobileSynced`: Boolean

---

## Notes

1. **Authentication:** Most endpoints require user authentication via NextAuth session
2. **Date Formats:** All dates use ISO 8601 format (e.g., "2025-01-15T10:00:00Z")
3. **JSON Fields:** Many fields store JSON data as strings (painAreas, workSchedule, etc.)
4. **Mobile Sync:** The `mobileSynced` flag tracks whether data has been synced with mobile app
5. **QR Pairing:** Pairing codes expire after 10 minutes
6. **Points System:** Users earn points for completed sessions and breaks

---

## Environment Variables Required

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

---

## API Implementation Summary

All APIs are implemented using:
- **Framework:** Next.js 15 App Router
- **Database:** Prisma ORM with SQLite
- **Authentication:** NextAuth.js v4
- **Validation:** Runtime validation in route handlers
- **Error Handling:** Try-catch blocks with appropriate HTTP status codes
- **Data Format:** JSON for all requests and responses

Each endpoint follows RESTful conventions and includes comprehensive error handling for production use.
