🦴 Spine Mate - AI-Powered Posture Correction Web App
A comprehensive web application that complements the Spine Mate mobile app, providing real-time posture monitoring, intelligent break reminders, and detailed analytics for desk workers and individuals with sedentary lifestyles.

🎯 Project Overview
Spine Mate Web is designed to empower users to achieve and maintain optimal posture throughout their workday by combining:

Real-time AI-powered posture analysis using webcam
Personalized corrective exercises and micro-stretches
Intelligent break scheduling based on user patterns
Comprehensive analytics and progress tracking
Seamless mobile app synchronization via QR code pairing
✨ Key Features
🔗 QR-Based Mobile Pairing
Secure authentication via QR code scanning (like WhatsApp Web)
Asynchronous data sync between web and mobile platforms
Cross-device posture data continuity
📹 Real-Time Posture Monitoring
AI-powered computer vision posture detection
Live webcam analysis with privacy-first local processing
Minimalist and detailed viewing modes
Customizable alerts (visual, audio, haptic)
Real-time posture scoring and feedback
🧘 Intelligent Break System
Adaptive break scheduling (micro, standard, extended)
Guided micro-stretch routines with animations
Exercise library categorized by target areas
Break completion tracking and streaks
📊 Analytics Dashboard
Daily/weekly/monthly posture score trends
Problem areas analysis with heatmaps
Session summaries and insights
Progress tracking with achievements
Export capabilities (PDF/CSV)
👤 Personalized Onboarding
Comprehensive setup wizard with personalization quiz
Posture calibration with baseline establishment
Goal setting and commitment tracking
Work environment and schedule customization
🛠 Technology Stack
Frontend
Next.js 15 with App Router
TypeScript 5 for type safety
Tailwind CSS 4 for styling
shadcn/ui component library
Framer Motion for animations
Lucide React icons
Backend & Database
Prisma ORM with SQLite
Next.js API Routes for backend
Zod for schema validation
UUID for unique identifiers
Real-time Features
WebRTC for camera access
Socket.io for real-time communication
Local AI processing for privacy
🚀 Getting Started
Prerequisites
Node.js 18+
npm or yarn
Modern web browser with camera support
Installation
bash

Line Wrapping

Collapse
Copy
1
2
3
4
5
6
7
8
9
10
11
12
# Clone the repository
git clone <repository-url>
cd spine-mate-web

# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
Open http://localhost:3000 to view the application.

Database Setup
bash

Line Wrapping

Collapse
Copy
1
2
3
4
5
6
7
8
# Push schema to database
npm run db:push

# (Optional) Generate Prisma client
npm run db:generate

# Reset database if needed
npm run db:reset
📱 User Flow
New User Journey
Onboarding → Personalization quiz (work environment, goals, pain areas)
Calibration → Posture baseline setup with webcam
First Session → Real-time posture monitoring
Breaks → Guided stretches and exercises
Analytics → Progress tracking and insights
Mobile App Integration
QR Pairing → Scan QR code from mobile app
Data Sync → Web sessions sync to mobile app
Cross-Platform → Seamless experience across devices
🏗 Project Structure

Line Wrapping

Collapse
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main dashboard
│   ├── onboarding/              # User setup flow
│   ├── calibration/             # Posture baseline setup
│   ├── posture/                 # Real-time monitoring
│   ├── breaks/                  # Stretch exercises
│   ├── analytics/               # Progress dashboard
│   └── api/                     # API endpoints
│       ├── pair/                # QR pairing
│       ├── sessions/            # Posture sessions
│       ├── breaks/              # Break sessions
│       ├── user/                # User management
│       ├── analytics/           # Analytics data
│       └── sync/                # Mobile sync
├── components/
│   └── ui/                      # shadcn/ui components
├── hooks/                       # Custom React hooks
└── lib/                         # Utilities and database
🎯 Core Features Implementation
Posture Detection Algorithm
The system tracks multiple skeletal keypoints:

Head Forward Angle: Degrees from calibrated position
Shoulder Symmetry: Height difference between shoulders
Spine Alignment: Upper spine curve measurement
Distance from Screen: Eye strain prevention
Break Intelligence
Adaptive Timing: Learns user productivity patterns
Context Awareness: Avoids interruptions during meetings
Exercise Selection: Based on detected posture issues
Progressive Difficulty: Adapts to user improvement
Data Sync Architecture
Web → Mobile: Posture sessions, break completions
Mobile → Web: Exercise recommendations, goals
Bidirectional: User profile, calibration data
Offline Support: Local storage with sync on reconnect
🔐 Privacy & Security
Local Processing: All video analysis happens on-device
No Video Storage: Camera feed is processed in real-time only
Secure Pairing: Encrypted QR code authentication
Data Encryption: All API communications encrypted
GDPR Compliant: User data handling regulations
📊 Analytics Features
Real-time Metrics
Posture score percentage
Good posture duration
Alert frequency and response time
Break completion rates
Trend Analysis
Daily/weekly/monthly progress
Problem area identification
Productivity pattern recognition
Improvement recommendations
Achievement System
Streak tracking (daily, weekly)
Milestone badges
Point-based rewards
Community challenges
🎨 UI/UX Design
Design Principles
Minimal Distraction: Clean interface during work sessions
Accessibility: WCAG 2.1 AA compliant
Responsive: Mobile-first design approach
Dark Mode: Eye-friendly interface options
Interactive Elements
Smooth animations and transitions
Visual feedback for all interactions
Progress indicators and loading states
Error handling with recovery options
🔧 Development Commands
bash

Line Wrapping

Collapse
Copy
1
2
3
4
5
6
7
8
9
10
11
12
13
# Development
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run build        # Build for production

# Database
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database

# Production
npm run start        # Start production server
🚀 Deployment
Environment Variables
env

Line Wrapping

Collapse
Copy
1
2
3
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
Production Build
bash

Line Wrapping

Collapse
Copy
1
2
npm run build
npm start
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Built with Z.ai Code AI assistance
Powered by Next.js
UI components by shadcn/ui
Icons by Lucide