# SpineMate Mobile App

React Native mobile application for SpineMate posture monitoring system.

## Features

✅ **Implemented:**
- QR Code pairing with webapp (WhatsApp Web style)
- Real-time WebSocket connection
- Home screen with posture score and stats
- API service with full backend integration
- State management with Zustand
- Offline storage with AsyncStorage
- TypeScript support

🚧 **To Be Completed:**
- Analytics screen (mirror of web analytics)
- Exercises library screen
- Exercise detail screen with video player
- Settings screen
- Workout tracking
- Push notifications
- Exercise recommendation engine integration

## Tech Stack

- **Framework**: React Native + Expo SDK 51
- **Router**: Expo Router 3.5
- **Language**: TypeScript 5
- **State**: Zustand 4.4
- **Data Fetching**: TanStack React Query 5
- **HTTP Client**: Axios 1.6
- **WebSocket**: Socket.IO Client 4.7
- **Storage**: AsyncStorage 1.21
- **Camera**: Expo Camera 15
- **Animations**: React Native Reanimated 3.10

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen ✅
│   ├── pairing.tsx        # QR scanner ✅
│   ├── analytics.tsx      # Analytics (TODO)
│   ├── exercises.tsx      # Exercises list (TODO)
│   ├── exercises/[id].tsx # Exercise detail (TODO)
│   └── settings.tsx       # Settings (TODO)
├── components/            # Reusable UI components (TODO)
├── services/              # Backend services
│   ├── api.ts            # REST API client ✅
│   └── socket.ts         # WebSocket client ✅
├── store/                 # Zustand state management ✅
│   └── index.ts          # Global app store ✅
├── types/                 # TypeScript types ✅
│   └── index.ts          # Shared types ✅
├── utils/                 # Utility functions (TODO)
├── assets/                # Images, fonts, etc. (TODO)
├── app.json              # Expo configuration ✅
├── package.json          # Dependencies ✅
└── tsconfig.json         # TypeScript config ✅
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for emulator)
- Expo Go app on physical device (optional)

### Installation

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your API URLs
```

4. Start development server:
```bash
npm start
```

5. Run on platform:
```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web (for testing)
npm run web

# Or scan QR code with Expo Go app
```

## Environment Variables

Create `.env` file:
```env
API_URL=http://localhost:3000
WEBSOCKET_URL=http://localhost:3000
```

For physical device testing, use your computer's IP:
```env
API_URL=http://192.168.1.X:3000
WEBSOCKET_URL=http://192.168.1.X:3000
```

## Usage Flow

### 1. Pairing with Webapp

1. Open webapp on computer
2. Navigate to settings/pairing (needs to be implemented on web)
3. Generate QR code
4. Open mobile app
5. Tap "Scan QR to Connect"
6. Scan the QR code
7. Device paired! Real-time sync begins

### 2. Home Screen

- View current posture score
- See daily streak
- Check session stats
- Quick access to analytics, exercises, settings
- Connection status indicator

### 3. Real-time Sync

- WebSocket connection for live posture updates
- Background data sync every 5 minutes
- Offline support with local storage
- Conflict resolution with last-write-wins

## API Integration

### Endpoints Used

- `POST /api/pair` - Pair device with QR code
- `GET /api/user?userId=X` - Fetch user data
- `GET /api/analytics?userId=X&timeRange=week` - Get analytics
- `GET /api/sessions?userId=X` - Get posture sessions
- `GET /api/breaks?userId=X` - Get break sessions
- `POST /api/sync` - Sync mobile data to server
- `GET /api/sync?userId=X&deviceId=Y` - Get unsynced data

### WebSocket Events

**Listening:**
- `posture-data` - Real-time posture metrics from webapp
- `analytics-update` - Analytics pushed from server
- `new-achievement` - Achievement unlocked
- `goal-progress` - Goal progress update
- `break-reminder` - Time for a break
- `pairing-success` - Device paired successfully

**Emitting:**
- `mobile-connected` - Mobile app connected
- `acknowledge-posture` - Acknowledge posture update
- `break-started` - User started a break
- `break-completed` - User completed exercises

## State Management

### Zustand Store Structure

```typescript
{
  // User
  user: User | null
  isAuthenticated: boolean
  deviceId: string | null

  // Posture
  currentPosture: PostureMetrics | null
  postureHistory: PostureMetrics[]

  // Analytics
  analytics: Analytics | null
  analyticsLoading: boolean

  // Exercises
  exercises: Exercise[]
  favoriteExercises: string[]
  currentWorkout: BreakSession | null

  // Sync
  lastSyncTime: string | null
  isSyncing: boolean

  // Achievements
  achievements: Achievement[]
  unreadAchievements: number
}
```

## Development Roadmap

### Phase 1: Core Setup ✅
- [x] Project initialization
- [x] TypeScript configuration
- [x] Expo Router setup
- [x] API service
- [x] WebSocket service
- [x] Zustand store
- [x] Home screen
- [x] Pairing screen with QR scanner

### Phase 2: Screens (TODO)
- [ ] Analytics screen with charts
- [ ] Exercises list with categories
- [ ] Exercise detail with video player
- [ ] Settings screen
- [ ] Workout tracking screen

### Phase 3: Features (TODO)
- [ ] Push notifications for break reminders
- [ ] Offline mode with SQLite
- [ ] Background sync
- [ ] Achievement notifications
- [ ] Haptic feedback
- [ ] Dark mode support

### Phase 4: Polish (TODO)
- [ ] Animations and transitions
- [ ] Loading states
- [ ] Error handling UI
- [ ] Empty states
- [ ] Onboarding flow

### Phase 5: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] TestFlight beta (iOS)
- [ ] Google Play internal testing (Android)
- [ ] App Store submission
- [ ] Production release

## Known Issues

1. **Camera permission**: Must grant on first launch
2. **WebSocket reconnection**: May need manual refresh after long disconnect
3. **Local storage**: Limited to 6MB, needs migration to SQLite for large datasets
4. **Video player**: Not yet implemented for exercise demonstrations

## Contributing

1. Create feature branch from `main`
2. Implement changes following existing patterns
3. Test on both iOS and Android
4. Update README with new features
5. Submit pull request

## Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Future: Unit tests
npm test
```

## Troubleshooting

### QR Scanner Not Working
- Ensure camera permissions granted
- Check lighting conditions
- Make sure QR code is clearly visible
- Try regenerating QR code on webapp

### Connection Issues
- Verify API_URL is correct
- Check if backend server is running
- For physical devices, use computer IP not localhost
- Check firewall settings

### Build Errors
```bash
# Clear cache
npm start --clear

# Reset
rm -rf node_modules package-lock.json
npm install

# Restart Metro bundler
npm start --reset-cache
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Zustand](https://github.com/pmndrs/zustand)

## License

Proprietary - SpineMate© 2025
