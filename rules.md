# Spine Mate - Project Development Rules

## 1. Project Overview

**Product Name:** Spine Mate (formerly PosturePall)
**Type:** SaaS Posture Monitoring Application
**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, Socket.IO, TensorFlow.js with MoveNet
**Database:** SQLite (development), PostgreSQL (production)
**Deployment:** Vercel (frontend), Custom Node.js server (Socket.IO)

## 2. Core Development Principles

### 2.1 Code Quality Standards
- **TypeScript First**: All code must be written in TypeScript with strict type checking
- **No `any` types**: Use proper type definitions or `unknown` with type guards
- **Component Architecture**: Follow React best practices with functional components and hooks
- **Error Handling**: All async operations must have proper try-catch blocks
- **Code Comments**: Document complex logic, algorithms, and AI model parameters

### 2.2 File Organization
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   ├── ui/          # shadcn/ui components (don't modify directly)
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── lib/             # Utility functions and configurations
│   ├── ai/          # AI/ML models and posture detection
│   ├── db/          # Database utilities
│   └── utils/       # Helper functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── constants/       # App constants and configurations
```

### 2.3 Naming Conventions
- **Files**: kebab-case for files (e.g., `posture-detection.ts`)
- **Components**: PascalCase for React components (e.g., `PostureMonitor.tsx`)
- **Functions**: camelCase for functions and variables (e.g., `calculatePostureScore`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `MAX_SESSION_DURATION`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `PostureMetrics`, `UserProfile`)

## 3. AI/ML Posture Detection Rules

### 3.1 Technology Stack
- **PRIMARY**: TensorFlow.js with MoveNet (Thunder or Lightning model)
- **DO NOT USE**: MediaPipe (removed per project requirements)
- **Model Location**: Store models in `/public/models/` directory
- **Processing**: Client-side inference on device for privacy

### 3.2 Posture Detection Implementation
```typescript
// Required keypoints for posture analysis
const REQUIRED_KEYPOINTS = [
  'nose',           // Head position
  'left_eye', 'right_eye',  // Gaze direction
  'left_shoulder', 'right_shoulder',  // Shoulder alignment
  'left_ear', 'right_ear',  // Head tilt
  'left_hip', 'right_hip'   // Seated posture base
];

// Confidence threshold for keypoint detection
const MIN_CONFIDENCE = 0.3;

// Processing frame rate
const FRAME_PROCESSING_RATE = 5; // FPS (balance accuracy vs battery)
```

### 3.3 Posture Metrics Calculation
All posture metrics must follow these exact calculations:

1. **Head Forward Angle**
   - Measure: Degrees of forward head tilt from baseline
   - Formula: `angle = atan2(ear_y - shoulder_y, ear_x - shoulder_x) * (180 / PI)`
   - Good: ±5° from calibrated position
   - Moderate: 6-15° deviation
   - Poor: >15° deviation (text neck)

2. **Shoulder Symmetry**
   - Measure: Height difference between shoulders
   - Formula: `symmetry = abs(left_shoulder_y - right_shoulder_y) / shoulder_width * 100`
   - Good: <5% difference
   - Moderate: 5-10% difference
   - Poor: >10% difference

3. **Shoulder Roundedness**
   - Measure: Forward protrusion from spine
   - Formula: Based on shoulder-to-ear distance vs calibrated baseline
   - Good: Within 5% of baseline
   - Moderate: 5-15% forward
   - Poor: >15% forward (hunched)

4. **Spine Alignment**
   - Measure: Upper spine curve from neutral
   - Formula: Calculate angle between shoulder midpoint, hip midpoint, and vertical
   - Good: 0-10° from vertical
   - Moderate: 10-20° slouch
   - Poor: >20° slouch

5. **Composite Posture Score**
   ```typescript
   const WEIGHTS = {
     headForwardAngle: 0.30,    // 30% - most common issue
     shoulderPosition: 0.25,     // 25%
     spineAlignment: 0.25,       // 25%
     screenDistance: 0.10,       // 10%
     shoulderSymmetry: 0.10      // 10%
   };

   // Score: 0 (perfect) to 100 (severe deviation)
   // Final score: 100 - compositeScore for user-facing percentage
   ```

### 3.4 Performance Requirements
- **Latency**: Posture analysis must complete in <100ms per frame
- **Battery**: Optimize to use <10% battery per hour of monitoring
- **Memory**: Keep memory usage under 150MB for AI processing
- **Accuracy**: Achieve >90% accuracy compared to calibrated baseline

## 4. Database Rules

### 4.1 Schema Management
- **Migrations**: Use Prisma migrations for all schema changes
- **Command**: `npx prisma migrate dev --name descriptive_name`
- **Never**: Directly edit the database without migrations
- **Versioning**: Keep migration history in git

### 4.2 Data Privacy
- **No Video Storage**: Never store raw video or camera feed data
- **Anonymization**: All analytics must be anonymizable
- **Local Processing**: Process posture data on-device when possible
- **Minimal Storage**: Only store calculated metrics, not raw skeletal data
- **User Consent**: Check user consent before storing any personal data

### 4.3 Database Operations
```typescript
// Always use transactions for multi-table operations
await prisma.$transaction(async (tx) => {
  await tx.postureSession.create({...});
  await tx.user.update({...});
});

// Use proper error handling
try {
  const result = await prisma.user.findUnique({...});
  if (!result) throw new Error('User not found');
} catch (error) {
  console.error('Database error:', error);
  // Handle appropriately
}
```

## 5. Real-Time Communication Rules

### 5.1 Socket.IO Implementation
- **Events**: Use typed event names (constants)
- **Namespaces**: Organize by feature (`/posture`, `/breaks`, `/sync`)
- **Room Management**: Use user IDs for private rooms
- **Heartbeat**: Implement ping/pong for connection health
- **Reconnection**: Handle reconnection logic gracefully

### 5.2 Event Naming Convention
```typescript
// Server → Client events (prefix with 'server:')
'server:posture-update'
'server:break-reminder'
'server:achievement-unlocked'

// Client → Server events (prefix with 'client:')
'client:posture-data'
'client:session-start'
'client:break-complete'
```

### 5.3 Data Validation
- **Always** validate incoming Socket.IO data with Zod schemas
- **Never** trust client-side data
- **Sanitize** all user input before processing

## 6. UI/UX Development Rules

### 6.1 Component Guidelines
- **shadcn/ui**: Use for all base components (buttons, forms, dialogs)
- **Customization**: Extend shadcn components, don't modify them directly
- **Accessibility**: All interactive elements must be keyboard accessible
- **ARIA**: Use proper ARIA labels for screen readers
- **Responsive**: Mobile-first design approach

### 6.2 Design System
```typescript
// Color Coding for Posture Status
const POSTURE_COLORS = {
  excellent: 'green',     // 0-15 score
  good: 'light-green',    // 16-35 score
  fair: 'yellow',         // 36-60 score
  poor: 'red'             // 61-100 score
};

// Animation Guidelines
const ANIMATIONS = {
  fast: '150ms',          // Quick interactions
  normal: '300ms',        // Standard transitions
  slow: '500ms'           // Emphasis animations
};
```

### 6.3 Performance Optimization
- **Code Splitting**: Use dynamic imports for heavy components
- **Lazy Loading**: Defer non-critical component loading
- **Memoization**: Use `React.memo()`, `useMemo()`, `useCallback()` appropriately
- **Image Optimization**: Use Next.js Image component with proper sizes

### 6.4 User Feedback Rules
- **Immediate**: Visual feedback within 100ms of user action
- **Progress**: Show loading states for operations >300ms
- **Errors**: Display user-friendly error messages, log technical details
- **Success**: Confirm successful actions with subtle animations

## 7. Feature Implementation Priority

### 7.1 Phase 1: Core Functionality (CURRENT PRIORITY)
1. ✅ Basic UI/UX structure (COMPLETED)
2. 🔄 **Posture Calibration with MoveNet** (IN PROGRESS - TOP PRIORITY)
3. 🔄 **Real-time Posture Detection** (IN PROGRESS - TOP PRIORITY)
4. 🔄 Posture deviation alerts and notifications
5. ⏳ Session tracking and data storage
6. ⏳ Break reminder system with timers

### 7.2 Phase 2: Analytics & Engagement
1. Progress tracking and analytics dashboard
2. Streak system and gamification
3. Achievement system
4. Goal setting and tracking
5. Exercise library integration

### 7.3 Phase 3: Premium Features
1. User tiers (Free vs Premium)
2. Payment integration (Stripe)
3. Advanced analytics and insights
4. Export functionality (PDF, CSV)
5. Calendar integration
6. Social features and community

### 7.4 Phase 4: Mobile & Scaling
1. Mobile app development
2. QR code pairing (already scaffolded)
3. Cross-device sync
4. Performance optimization
5. Enterprise features

## 8. Testing Requirements

### 8.1 Testing Strategy
- **Unit Tests**: All utility functions and hooks
- **Integration Tests**: API routes and database operations
- **Component Tests**: Critical UI components
- **E2E Tests**: Complete user flows (onboarding, session, breaks)
- **AI Model Tests**: Posture detection accuracy validation

### 8.2 Testing Tools
```json
{
  "unit": "Jest",
  "component": "React Testing Library",
  "e2e": "Playwright or Cypress",
  "coverage": "Minimum 70% for core features"
}
```

### 8.3 Manual Testing Checklist
Before marking any feature as complete:
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS and Android)
- [ ] Test with different camera qualities
- [ ] Test with poor lighting conditions
- [ ] Test with different user postures
- [ ] Test error handling and edge cases
- [ ] Verify accessibility with keyboard navigation
- [ ] Check console for errors or warnings

## 9. Security Rules

### 9.1 Authentication & Authorization
- **Never** store passwords in plain text
- **Use** bcrypt or similar for password hashing
- **Implement** JWT tokens with short expiration (15 min access, 7 day refresh)
- **Validate** tokens on every protected API route
- **Rate Limit**: Implement rate limiting on auth endpoints

### 9.2 Data Protection
- **Camera Access**: Request explicit permission, show clear privacy notice
- **Local Processing**: Process video frames locally, don't send to server
- **HTTPS Only**: All production traffic must use HTTPS
- **Input Validation**: Sanitize all user inputs (XSS prevention)
- **SQL Injection**: Use Prisma parameterized queries (already safe)

### 9.3 API Security
```typescript
// Example protected API route
export async function GET(request: Request) {
  // 1. Validate authentication
  const token = request.headers.get('authorization');
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Verify token
  const user = await verifyToken(token);
  if (!user) return Response.json({ error: 'Invalid token' }, { status: 401 });

  // 3. Check permissions
  if (!user.hasPermission('read:sessions')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Process request
  // ...
}
```

## 10. Git Workflow Rules

### 10.1 Branch Strategy
- **Main Branch**: `main` (production-ready code)
- **Development Branch**: `develop` (integration branch)
- **Feature Branches**: `feature/description` (e.g., `feature/movenet-integration`)
- **Bug Fixes**: `fix/description` (e.g., `fix/calibration-crash`)
- **Current Branch**: `claude/review-prd-repo-01K3zBTogbxoDwZYKwp6TvZJ` (PRD review work)

### 10.2 Commit Message Format
```
<type>(<scope>): <short description>

<longer description if needed>

<footer with issue references>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(posture): integrate MoveNet for real-time detection

- Replace simulated detection with TensorFlow.js MoveNet
- Implement keypoint tracking for neck, shoulders, spine
- Add confidence threshold filtering
- Optimize frame processing to 5 FPS

Closes #42
```

### 10.3 Code Review Checklist
- [ ] Code follows TypeScript and project conventions
- [ ] No console.logs in production code
- [ ] Proper error handling implemented
- [ ] Types are properly defined (no `any`)
- [ ] Comments explain complex logic
- [ ] No sensitive data in code
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## 11. Environment Variables

### 11.1 Required Variables
```env
# Database
DATABASE_URL="file:./db/custom.db"  # Development
# DATABASE_URL="postgresql://..."   # Production

# Authentication
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# API Keys (Future)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (Future)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Future)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
PORT="3000"
SOCKET_PORT="3001"
```

### 11.2 Environment Management
- **Never** commit `.env` files to git
- **Use** `.env.example` as template
- **Validate** required variables on app startup
- **Document** all new environment variables in `.env.example`

## 12. Performance Benchmarks

### 12.1 Core Metrics
- **Page Load**: <3 seconds on 3G connection
- **Time to Interactive**: <5 seconds
- **Lighthouse Score**: >90 for Performance, Accessibility, Best Practices
- **Bundle Size**: Keep JavaScript bundle <500KB (gzipped)
- **API Response**: <200ms for most endpoints

### 12.2 AI Model Performance
- **Model Load Time**: <2 seconds on first use
- **Inference Time**: <100ms per frame
- **Accuracy**: >90% keypoint detection confidence
- **Frame Rate**: 5-10 FPS (adjustable based on device capability)

## 13. Documentation Requirements

### 13.1 Code Documentation
- **Functions**: JSDoc comments for all public functions
- **Components**: Prop types and usage examples
- **Complex Logic**: Inline comments explaining "why", not "what"
- **API Routes**: Document request/response schemas

### 13.2 Project Documentation
- **README.md**: Keep updated with setup instructions
- **TODO.md**: Track all pending tasks and features
- **CHANGELOG.md**: Document significant changes (for releases)
- **API.md**: Document all API endpoints (create when needed)

## 14. Accessibility (a11y) Requirements

### 14.1 WCAG Compliance
- **Level**: WCAG 2.1 Level AA minimum
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Visible focus states for all interactive elements

### 14.2 Implementation Checklist
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Buttons have descriptive text (not just icons)
- [ ] Color is not the only indicator of status
- [ ] Animations can be disabled (prefers-reduced-motion)
- [ ] Proper heading hierarchy (h1 → h2 → h3)

## 15. Internationalization (i18n) - Future

### 15.1 Structure
- **Library**: next-intl or react-i18next
- **Languages**: Start with English, expand to Spanish, French, German
- **Date/Time**: Use locale-aware formatting
- **Numbers**: Respect regional number formats

### 15.2 Implementation
```typescript
// All user-facing strings must be translatable
❌ <button>Start Session</button>
✅ <button>{t('session.start')}</button>
```

## 16. Error Handling Standards

### 16.1 Client-Side Errors
```typescript
// Use try-catch for async operations
try {
  const result = await fetchData();
  processResult(result);
} catch (error) {
  console.error('Error details:', error);
  toast.error('Something went wrong. Please try again.');
  // Log to error tracking service (e.g., Sentry)
}
```

### 16.2 API Error Responses
```typescript
// Standardized error response format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2025-11-18T10:30:00Z"
  }
}
```

### 16.3 Error Tracking
- **Development**: Console logs with stack traces
- **Production**: Use Sentry or similar for error tracking
- **User Feedback**: Show friendly messages, log technical details

## 17. Feature Flags (Future)

### 17.1 Purpose
- Gradually roll out new features
- A/B testing
- Quick rollback if issues occur
- Different features for Free vs Premium users

### 17.2 Implementation
```typescript
// Example feature flag usage
const FEATURES = {
  PREMIUM_ANALYTICS: 'premium-analytics',
  COMMUNITY_FEATURES: 'community',
  CALENDAR_SYNC: 'calendar-sync'
};

if (hasFeature(user, FEATURES.PREMIUM_ANALYTICS)) {
  // Show advanced analytics
}
```

## 18. Code Review & Quality Gates

### 18.1 Pre-Commit Checks
- TypeScript compilation must pass
- ESLint must have no errors
- Prettier formatting applied
- No console.log statements (use logger)

### 18.2 Pre-Merge Checks
- All tests must pass
- Code review by at least one other developer
- Documentation updated if needed
- No merge conflicts

## 19. Deployment Rules

### 19.1 Development
- **Command**: `npm run dev`
- **Port**: 3000 (Next.js) + 3001 (Socket.IO)
- **Hot Reload**: Enabled
- **Source Maps**: Enabled

### 19.2 Production
- **Build**: `npm run build`
- **Start**: `npm start`
- **Environment**: Production environment variables
- **Monitoring**: Set up error tracking and performance monitoring
- **Database**: Use PostgreSQL (not SQLite)

### 19.3 Deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Build passes without errors
- [ ] No TypeScript errors
- [ ] No console warnings in production build
- [ ] SSL certificate configured
- [ ] Performance tested
- [ ] Error tracking configured

## 20. Third-Party Integrations

### 20.1 Current Integrations
- **TensorFlow.js**: AI/ML posture detection
- **Socket.IO**: Real-time communication
- **Prisma**: Database ORM
- **shadcn/ui**: UI component library

### 20.2 Planned Integrations
- **Stripe**: Payment processing (Premium tiers)
- **SendGrid/Resend**: Email notifications
- **Google Calendar**: Calendar sync for break scheduling
- **Sentry**: Error tracking
- **PostHog/Mixpanel**: Product analytics

### 20.3 Integration Rules
- **API Keys**: Store in environment variables
- **Rate Limits**: Respect third-party rate limits
- **Error Handling**: Handle API failures gracefully
- **Fallbacks**: Provide fallback behavior if service unavailable

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes (dev)
npx prisma migrate dev   # Create migration
npx prisma studio        # Open database GUI

# Testing (to be set up)
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

---

## Notes for AI Development Assistant (Claude)

When implementing features:
1. **Always check** what's already implemented before starting
2. **Read existing code** to understand patterns and conventions
3. **Update TODO.md** when completing tasks
4. **Test thoroughly** before marking as complete
5. **Ask clarifying questions** if requirements are ambiguous
6. **Document** complex implementations
7. **Think about edge cases** and error scenarios
8. **Optimize for performance** especially in AI processing
9. **Prioritize user privacy** in all camera/data handling
10. **Follow these rules** consistently throughout the project

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Maintained By**: Development Team
